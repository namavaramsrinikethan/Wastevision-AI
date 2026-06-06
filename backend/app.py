from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from ultralytics import YOLO
import requests
import random
import time
from math import radians, cos, sin, asin, sqrt

app = Flask(__name__)
CORS(app)

# ─── LOAD MODEL ──────────────────────────────────────────────────────────────
try:
    model = YOLO("../model/best.pt")
    print("✅ Model loaded: best.pt")
except Exception:
    try:
        model = YOLO("../yolov8n.pt")
        print("⚠️  Fallback model loaded: yolov8n.pt")
    except Exception as e:
        print(f"❌ Could not load model: {e}")
        model = None

UPLOAD_FOLDER = 'data'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ─── MAPPINGS ────────────────────────────────────────────────────────────────

waste_mapping = {
    "Bottle": "plastic",
    "Bottle cap": "plastic",
    "Plastic bag - wrapper": "plastic",
    "Plastic container": "plastic",
    "Cup": "plastic",
    "Lid": "plastic",
    "Straw": "plastic",
    "Styrofoam piece": "plastic",
    "Can": "metal",
    "Aluminium foil": "metal",
    "Carton": "paper",
    "Paper": "paper",
    "Broken glass": "glass",
}

# Scrap value per item (₹)
price_mapping = {
    "plastic": 20,
    "metal": 50,
    "glass": 30,
    "paper": 10,
    "organic": 5,
    "unknown": 0,
}

# Weight per item (kg) for sustainability calcs
weight_per_item = {
    "plastic": 0.02,
    "metal": 0.05,
    "paper": 0.03,
    "glass": 0.10,
    "organic": 0.08,
    "unknown": 0.01,
}

# CO₂ saved (kg per kg of material recycled vs landfill)
co2_per_kg = {
    "plastic": 1.5,
    "metal": 2.0,
    "paper": 0.8,
    "glass": 1.2,
    "organic": 0.5,
    "unknown": 0,
}

# Water saved (liters per kg)
water_per_kg = {
    "plastic": 180,
    "metal": 50,
    "paper": 100,
    "glass": 20,
    "organic": 10,
    "unknown": 0,
}

# Energy saved (kWh per kg)
energy_per_kg = {
    "plastic": 5.0,
    "metal": 14.0,
    "paper": 4.0,
    "glass": 1.5,
    "organic": 0.5,
    "unknown": 0,
}

# Trees saved (1 tree per 50 kg of paper recycled)
PAPER_KG_PER_TREE = 50.0

# ─── DRIVER POOL ─────────────────────────────────────────────────────────────

DRIVERS = [
    {"name": "Ramesh Kumar",  "phone": "9876543210", "vehicle": "AP09 AB 1234", "color": "White"},
    {"name": "Suresh Singh",  "phone": "9123456780", "vehicle": "TS08 XY 5678", "color": "Blue"},
    {"name": "Imran Ahmed",   "phone": "9988776655", "vehicle": "TS09 CD 2222", "color": "Green"},
    {"name": "Priya Sharma",  "phone": "9555123456", "vehicle": "KA03 EF 9999", "color": "Red"},
    {"name": "Mohan Rao",     "phone": "9871234560", "vehicle": "TS10 GH 3333", "color": "Yellow"},
]

# ─── IN-MEMORY PICKUP STORE ───────────────────────────────────────────────────

# Each pickup request: { id, user_name, phone, address, waste_types, lat, lng,
#                        dealer_name, status, driver, eta_minutes, reference_id, created_at }
pickup_requests = []

# ─── UTILITIES ───────────────────────────────────────────────────────────────

def haversine(lat1, lon1, lat2, lon2):
    """Return distance in km between two lat/lon points."""
    lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    return 6371 * 2 * asin(sqrt(a))

def nominatim_geocode(query: str):
    """Returns (lat, lon, display_name) or raises RuntimeError."""
    headers = {"User-Agent": "WasteVision/1.0 (hackathon project)"}
    resp = requests.get(
        "https://nominatim.openstreetmap.org/search",
        params={"q": query, "format": "json", "limit": 1},
        headers=headers,
        timeout=6,
    )
    resp.raise_for_status()
    data = resp.json()
    if not data:
        raise RuntimeError(f"Location not found: {query}")
    r = data[0]
    return float(r["lat"]), float(r["lon"]), r.get("display_name", query)

def overpass_nearby(lat, lon, radius=10000):
    """Fetch recycling / scrap places near lat,lon within radius metres."""
    query = f"""
[out:json][timeout:15];
(
  node(around:{radius},{lat},{lon})["amenity"="recycling"];
  way(around:{radius},{lat},{lon})["amenity"="recycling"];
  node(around:{radius},{lat},{lon})["shop"="scrap"];
  node(around:{radius},{lat},{lon})["man_made"="waste_transfer_station"];
);
out center;
"""
    headers = {"User-Agent": "WasteVision/1.0 (hackathon project)"}
    resp = requests.post(
        "https://overpass-api.de/api/interpreter",
        data={"data": query},
        headers=headers,
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json().get("elements", [])

def compute_sustainability(object_counts: dict) -> dict:
    """Calculate realistic sustainability metrics from detected item counts."""
    carbon_saved = 0.0
    water_saved = 0.0
    energy_saved = 0.0
    trees_saved = 0.0

    for category, count in object_counts.items():
        kg = weight_per_item.get(category, 0.01) * count
        carbon_saved += co2_per_kg.get(category, 0) * kg
        water_saved  += water_per_kg.get(category, 0) * kg
        energy_saved += energy_per_kg.get(category, 0) * kg
        if category == "paper":
            trees_saved += kg / PAPER_KG_PER_TREE

    return {
        "carbon_saved": round(carbon_saved, 3),
        "water_saved":  round(water_saved, 1),
        "energy_saved": round(energy_saved, 3),
        "trees_saved":  round(trees_saved, 4),
    }

def compute_score(object_counts: dict) -> dict:
    """
    Segregation score = (recyclable_items / total_items) * 100
    Green ≥ 80, Yellow 50-79, Red < 50
    """
    recyclable_cats = {"plastic", "metal", "paper", "glass"}
    total = sum(object_counts.values())
    if total == 0:
        return {"score": 0, "grade": "red", "suggestions": ["Upload an image with detectable waste."]}

    recyclable = sum(v for k, v in object_counts.items() if k in recyclable_cats)
    score = round((recyclable / total) * 100)

    if score >= 80:
        grade = "green"
    elif score >= 50:
        grade = "yellow"
    else:
        grade = "red"

    suggestions = []
    if "unknown" in object_counts:
        suggestions.append("⚠️ Remove unidentified items — they lower your score.")
    if "organic" in object_counts:
        suggestions.append("🌱 Separate organic waste into a compost bin.")
    if score < 80:
        suggestions.append("♻️ Sort all recyclables (plastic, metal, paper, glass) separately.")
    if "plastic" in object_counts:
        suggestions.append("🧴 Clean plastic containers before recycling — dirty ones get rejected.")
    if "metal" in object_counts:
        suggestions.append("💰 Metal scrap fetches 20% more when clean and sorted by type.")
    if "paper" in object_counts:
        suggestions.append("📄 Keep paper dry — wet paper has no recycling value.")
    if score >= 80:
        suggestions.append("✅ Excellent segregation! Keep it up for maximum profit.")

    return {"score": score, "grade": grade, "suggestions": suggestions[:4]}

# ─── IMAGE PROCESSING ────────────────────────────────────────────────────────

def process_image(file):
    try:
        filepath = os.path.join(UPLOAD_FOLDER, file.filename or "upload.jpg")
        file.save(filepath)

        if model is None:
            raise RuntimeError("AI model not loaded")

        results = model(filepath)
        object_counts = {}

        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                name = model.names[cls_id]
                category = waste_mapping.get(name, "unknown")
                object_counts[category] = object_counts.get(category, 0) + 1

        total_profit = sum(price_mapping.get(cat, 0) * cnt for cat, cnt in object_counts.items())
        sustain = compute_sustainability(object_counts)
        score_data = compute_score(object_counts)

        recommendations = []
        if "plastic" in object_counts:
            recommendations.append("♻️ Send plastic to recycling center")
        if "metal" in object_counts:
            recommendations.append("💰 Sell metal to scrap dealer")
        if "organic" in object_counts:
            recommendations.append("🌱 Use composting")
        if "paper" in object_counts:
            recommendations.append("📄 Recycle paper")
        if "unknown" in object_counts:
            recommendations.append("⚠️ Manual sorting needed")

        return {
            "objects": object_counts,
            "profit": total_profit,
            "carbon_saved":  sustain["carbon_saved"],
            "water_saved":   sustain["water_saved"],
            "energy_saved":  sustain["energy_saved"],
            "trees_saved":   sustain["trees_saved"],
            "score":         score_data["score"],
            "grade":         score_data["grade"],
            "suggestions":   score_data["suggestions"],
            "recommendations": recommendations,
            "confidence": "High",
            "is_waste": True,
        }

    except Exception as e:
        print(f"ERROR in process_image: {e}")
        return {
            "error": f"Image processing failed: {str(e)}",
            "objects": {},
            "profit": 0,
            "carbon_saved": 0,
            "water_saved": 0,
            "energy_saved": 0,
            "trees_saved": 0,
            "score": 0,
            "grade": "red",
            "suggestions": [],
            "recommendations": [],
            "confidence": "Low",
            "is_waste": False,
        }

# ─── ROUTES ──────────────────────────────────────────────────────────────────

@app.route('/')
def home():
    return "WasteVision Backend Running 🚀"


@app.route('/analyze', methods=['POST'])
def analyze():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    return jsonify(process_image(request.files['file']))


@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    return jsonify(process_image(request.files['image']))


# ─── OSM LOCATIONS (Nominatim + Overpass) ────────────────────────────────────

@app.route('/osm_locations', methods=['GET', 'POST'])
def osm_locations():
    """
    Convert city/location → lat/lon (Nominatim), then find
    nearby recycling centres & scrap dealers (Overpass API).

    GET  ?city=Hyderabad
    POST { "city": "Hyderabad" }  OR  { "lat": 17.38, "lon": 78.48 }
    """
    city = None
    user_lat = None
    user_lon = None

    if request.method == 'POST':
        body = request.get_json(silent=True) or {}
        city = body.get("city", "").strip() or body.get("location", "").strip()
        try:
            user_lat = float(body.get("lat") or 0) or None
            user_lon = float(body.get("lon") or body.get("lng") or 0) or None
        except (TypeError, ValueError):
            pass
    else:
        city = (request.args.get("city") or request.args.get("location") or "").strip()
        try:
            user_lat = float(request.args.get("lat") or 0) or None
            user_lon = float(request.args.get("lon") or request.args.get("lng") or 0) or None
        except (TypeError, ValueError):
            pass

    # ── Step 1: resolve coordinates ──────────────────────────────────────────
    display_name = city or "Your location"
    try:
        if city:
            user_lat, user_lon, display_name = nominatim_geocode(city)
        elif user_lat is None or user_lon is None:
            return jsonify({"error": "Provide city or lat/lon"}), 400
    except Exception as e:
        # If we already have coords from the client, continue; otherwise fail
        if user_lat is None or user_lon is None:
            return jsonify({"error": f"Geocoding failed: {e}"}), 502

    # ── Step 2: Overpass query ───────────────────────────────────────────────
    locations = []
    try:
        elements = overpass_nearby(user_lat, user_lon, radius=15000)
        for el in elements:
            # Support both node and way (way has 'center')
            if el["type"] == "node":
                d_lat, d_lon = el.get("lat"), el.get("lon")
            elif el["type"] == "way" and "center" in el:
                d_lat, d_lon = el["center"]["lat"], el["center"]["lon"]
            else:
                continue
            if d_lat is None or d_lon is None:
                continue

            tags = el.get("tags", {})
            name = tags.get("name") or tags.get("operator") or "Recycling / Scrap Point"
            amenity = tags.get("amenity") or tags.get("shop") or tags.get("man_made", "")
            addr_parts = filter(None, [
                tags.get("addr:housenumber", ""),
                tags.get("addr:street", ""),
                tags.get("addr:suburb", ""),
                tags.get("addr:city", ""),
            ])
            address = ", ".join(addr_parts) or tags.get("addr:full", display_name)
            dist = round(haversine(user_lat, user_lon, d_lat, d_lon), 2)

            locations.append({
                "name": name,
                "type": amenity,
                "lat": d_lat,
                "lon": d_lon,
                "address": address,
                "distance": dist,
                "map_link": f"https://www.openstreetmap.org/?mlat={d_lat}&mlon={d_lon}#map=17/{d_lat}/{d_lon}",
            })
    except Exception as e:
        print(f"⚠️ Overpass error: {e}")
        # Continue — will use fallbacks below

    # Sort by distance
    locations.sort(key=lambda x: x["distance"])

    # ── Step 3: Guaranteed fallbacks if Overpass returned < 2 results ────────
    if len(locations) < 2:
        fallbacks = [
            {
                "name": f"Green Recycling Centre — {display_name.split(',')[0]}",
                "type": "recycling",
                "lat": round(user_lat + 0.015, 5),
                "lon": round(user_lon + 0.012, 5),
                "address": f"Near {display_name.split(',')[0]}",
                "distance": round(haversine(user_lat, user_lon, user_lat + 0.015, user_lon + 0.012), 2),
                "map_link": f"https://www.openstreetmap.org/?mlat={user_lat+0.015}&mlon={user_lon+0.012}",
            },
            {
                "name": f"City Scrap Dealers — {display_name.split(',')[0]}",
                "type": "scrap",
                "lat": round(user_lat - 0.02, 5),
                "lon": round(user_lon + 0.025, 5),
                "address": f"Central {display_name.split(',')[0]}",
                "distance": round(haversine(user_lat, user_lon, user_lat - 0.02, user_lon + 0.025), 2),
                "map_link": f"https://www.openstreetmap.org/?mlat={user_lat-0.02}&mlon={user_lon+0.025}",
            },
            {
                "name": "Eco Waste Management Hub",
                "type": "recycling",
                "lat": round(user_lat + 0.03, 5),
                "lon": round(user_lon - 0.018, 5),
                "address": f"{display_name.split(',')[0]} area",
                "distance": round(haversine(user_lat, user_lon, user_lat + 0.03, user_lon - 0.018), 2),
                "map_link": f"https://www.openstreetmap.org/?mlat={user_lat+0.03}&mlon={user_lon-0.018}",
            },
        ]
        # Add fallbacks not already present
        existing_names = {l["name"].lower() for l in locations}
        for fb in fallbacks:
            if fb["name"].lower() not in existing_names:
                locations.append(fb)

        locations.sort(key=lambda x: x["distance"])

    print(f"✅ OSM locations for ({user_lat}, {user_lon}): {len(locations)} results")
    return jsonify(locations[:10])


# ─── REAL LOCATIONS (legacy alias → redirect to osm_locations) ──────────────

@app.route('/real_locations', methods=['GET', 'POST'])
def real_locations():
    """Alias kept for backward-compat. Delegates to osm_locations logic."""
    return osm_locations()


# ─── PICKUP REQUEST ───────────────────────────────────────────────────────────

@app.route('/request_pickup', methods=['POST'])
def request_pickup():
    try:
        data = request.get_json(silent=True) or {}
        user_lat  = float(data.get("lat", 0))
        user_lng  = float(data.get("lng", 0))
        dealer_name = data.get("dealer_name", "Nearest Dealer")
        user_name   = data.get("user_name", "Anonymous User")
        phone       = data.get("phone", "Not provided")
        address     = data.get("address", "User location")
        waste_types = data.get("waste_types", ["mixed"])
    except (TypeError, ValueError) as e:
        return jsonify({"error": f"Invalid request data: {e}"}), 400

    driver = random.choice(DRIVERS)
    eta    = random.randint(8, 25)
    ref_id = f"WV{random.randint(100000, 999999)}"

    pickup = {
        "id":           ref_id,
        "user_name":    user_name,
        "phone":        phone,
        "address":      address,
        "lat":          user_lat,
        "lng":          user_lng,
        "waste_types":  waste_types,
        "dealer_name":  dealer_name,
        "estimated_value": random.randint(80, 600),
        "status":       "Pending",
        "driver":       None,
        "eta_minutes":  None,
        "reference_id": ref_id,
        "created_at":   int(time.time()),
    }
    pickup_requests.append(pickup)

    return jsonify({
        "status": "Pickup Requested ✅",
        "driver": {
            "name":    driver["name"],
            "phone":   driver["phone"],
            "vehicle": driver["vehicle"],
            "color":   driver["color"],
        },
        "dealer":       {"name": dealer_name},
        "eta_minutes":  eta,
        "reference_id": ref_id,
    })


# ─── DEALER ROUTES ────────────────────────────────────────────────────────────

@app.route('/dealer_login', methods=['POST'])
def dealer_login():
    """Mock dealer authentication."""
    data = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    MOCK_DEALERS = {
        "dealer1": {"password": "pass123", "name": "Fayaz Scrap Traders",        "area": "Narsapur, Hyderabad"},
        "dealer2": {"password": "pass456", "name": "Sri Venkateswara Scrap",      "area": "Beeramguda, Hyderabad"},
        "dealer3": {"password": "pass789", "name": "Eco Waste Management Centre", "area": "Kondapur, Hyderabad"},
    }

    if username in MOCK_DEALERS and MOCK_DEALERS[username]["password"] == password:
        d = MOCK_DEALERS[username]
        return jsonify({
            "success": True,
            "dealer": {
                "id":       username,
                "name":     d["name"],
                "area":     d["area"],
                "username": username,
            }
        })
    return jsonify({"success": False, "error": "Invalid credentials"}), 401


@app.route('/pickup_requests', methods=['GET'])
def get_pickup_requests():
    """Return all pickup requests (dealer dashboard view)."""
    return jsonify(pickup_requests)


@app.route('/accept_pickup', methods=['POST'])
def accept_pickup():
    data = request.get_json(silent=True) or {}
    ref_id = data.get("reference_id", "").strip()

    for p in pickup_requests:
        if p["reference_id"] == ref_id:
            driver = random.choice(DRIVERS)
            p["status"]      = "Accepted"
            p["driver"]      = driver
            p["eta_minutes"] = random.randint(8, 20)
            return jsonify({"success": True, "pickup": p})

    return jsonify({"success": False, "error": "Request not found"}), 404


@app.route('/reject_pickup', methods=['POST'])
def reject_pickup():
    data = request.get_json(silent=True) or {}
    ref_id = data.get("reference_id", "").strip()

    for p in pickup_requests:
        if p["reference_id"] == ref_id:
            p["status"] = "Rejected"
            return jsonify({"success": True, "pickup": p})

    return jsonify({"success": False, "error": "Request not found"}), 404


@app.route('/complete_pickup', methods=['POST'])
def complete_pickup():
    data = request.get_json(silent=True) or {}
    ref_id = data.get("reference_id", "").strip()

    for p in pickup_requests:
        if p["reference_id"] == ref_id:
            p["status"] = "Completed"
            return jsonify({"success": True, "pickup": p})

    return jsonify({"success": False, "error": "Request not found"}), 404


# ─── ENTRY POINT ─────────────────────────────────────────────────────────────

if __name__ == '__main__':
    app.run(debug=True, port=5000)
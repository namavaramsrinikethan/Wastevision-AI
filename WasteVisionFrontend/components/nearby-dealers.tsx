"use client"

import { useEffect, useState } from "react"
import { MapPin, Phone, Star, Loader2, Map, CheckCircle, AlertCircle, Navigation } from "lucide-react"

interface OSMLocation {
  name: string
  type?: string
  lat: number
  lon: number
  address: string
  distance: number
  map_link: string
}

interface PickupData {
  status: string
  driver: {
    name: string
    phone: string
    vehicle: string
    color: string
  }
  dealer: { name: string }
  eta_minutes: number
  reference_id: string
}

// Normalise legacy shape (lng) and new shape (lon) from backend
function normaliseLocation(raw: any): OSMLocation {
  return {
    name:     raw.name     || "Recycling Centre",
    type:     raw.type     || raw.source || "",
    lat:      Number(raw.lat),
    lon:      Number(raw.lon ?? raw.lng ?? 0),
    address:  raw.address  || "Nearby area",
    distance: Number(raw.distance) || 0,
    map_link: raw.map_link || `https://www.openstreetmap.org/?mlat=${raw.lat}&mlon=${raw.lon ?? raw.lng}`,
  }
}

export function NearbyDealers() {
  const [locations, setLocations]               = useState<OSMLocation[]>([])
  const [loading, setLoading]                   = useState(false)
  const [error, setError]                       = useState<string | null>(null)
  const [selected, setSelected]                 = useState<OSMLocation | null>(null)
  const [pickupData, setPickupData]             = useState<PickupData | null>(null)
  const [requestingPickup, setRequestingPickup] = useState(false)
  const [cityInput, setCityInput]               = useState("")
  const [searchMode, setSearchMode]             = useState<"auto" | "manual">("auto")

  useEffect(() => {
    autoDetect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Auto-detect via browser geolocation ──────────────────────────────────
  const autoDetect = () => {
    setSearchMode("auto")
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation not supported. Please search by city.")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        await fetchByCoords(coords.latitude, coords.longitude)
      },
      (err) => {
        console.warn("Geolocation denied:", err.message)
        setError("Location access denied. Search by city below.")
        setLoading(false)
      },
      { timeout: 8000 }
    )
  }

  // ── Fetch by coords ───────────────────────────────────────────────────────
  const fetchByCoords = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `http://localhost:5000/osm_locations?lat=${lat}&lon=${lon}`,
        { signal: AbortSignal.timeout(20000) }
      )
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const raw: any[] = await res.json()
      if (!Array.isArray(raw) || raw.length === 0) throw new Error("No results")
      const data = raw.map(normaliseLocation)
      setLocations(data)
      setSelected(data[0])
      setError(null)
    } catch (e: any) {
      console.error("fetchByCoords error:", e)
      setError("Could not load nearby centres. Try searching by city.")
      setLocations([])
    } finally {
      setLoading(false)
    }
  }

  // ── Fetch by city string ──────────────────────────────────────────────────
  const fetchByCity = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const city = cityInput.trim()
    if (!city) { setError("Please enter a city name."); return }

    setSearchMode("manual")
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `http://localhost:5000/osm_locations?city=${encodeURIComponent(city)}`,
        { signal: AbortSignal.timeout(20000) }
      )
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const raw: any[] = await res.json()
      if (!Array.isArray(raw) || raw.length === 0) throw new Error("No results")
      const data = raw.map(normaliseLocation)
      setLocations(data)
      setSelected(data[0])
      setError(null)
    } catch (e: any) {
      console.error("fetchByCity error:", e)
      setError(`No recycling centres found for "${city}". Try a broader location.`)
    } finally {
      setLoading(false)
    }
  }

  // ── Request pickup ────────────────────────────────────────────────────────
  const handleRequestPickup = async () => {
    if (!selected) return
    setRequestingPickup(true)

    try {
      const res = await fetch("http://localhost:5000/request_pickup", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat:         selected.lat,
          lng:         selected.lon,
          dealer_name: selected.name,
          user_name:   "WasteVision User",
          phone:       "9000000000",
          address:     selected.address,
          waste_types: ["mixed"],
        }),
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      setPickupData(data)
    } catch (e: any) {
      setError(e?.message || "Failed to request pickup. Try again.")
    } finally {
      setRequestingPickup(false)
    }
  }

  // ── Pickup confirmed view ─────────────────────────────────────────────────
  if (pickupData) {
    return (
      <div className="rounded-2xl border border-neon-green/30 bg-neon-green/5 backdrop-blur-md p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-neon-green/20 border border-neon-green/30 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6 text-neon-green" />
          </div>
          <div className="flex-1 space-y-4">
            <h3 className="font-bold text-foreground text-lg">Pickup Confirmed! ✅</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              {[
                ["Driver",           pickupData.driver.name],
                ["Vehicle",          `${pickupData.driver.vehicle} (${pickupData.driver.color})`],
                ["Contact",          pickupData.driver.phone],
                ["ETA",              `${pickupData.eta_minutes} minutes`],
                ["Dealer",           pickupData.dealer.name],
                ["Reference",        pickupData.reference_id],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border">
                  <span>{label}:</span>
                  <span className={`font-semibold ${label === "ETA" ? "text-neon-green" : label === "Reference" ? "font-mono text-xs text-neon-cyan" : "text-foreground"}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setPickupData(null)}
              className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
            >
              ← Back to dealers
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main view ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Search bar */}
      <form onSubmit={fetchByCity} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Enter city or area (e.g. Hyderabad, Mumbai)"
            className="flex-1 rounded-xl border border-border bg-background/80 px-4 py-3 text-sm outline-none transition-all duration-300 hover:shadow-[0_0_10px_rgba(34,197,94,0.2)] focus:border-green-400 focus:ring-2 focus:ring-green-400/20 focus:shadow-[0_0_12px_rgba(34,197,94,0.25)]"
          />
          <button
            type="submit"
            disabled={loading || !cityInput.trim()}
            className="rounded-xl px-4 py-3 text-sm font-medium border border-neon-green/30 bg-neon-green/10 text-neon-green hover:bg-neon-green/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 whitespace-nowrap"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Search"}
          </button>
        </div>
        <div className="flex gap-2 text-xs items-center">
          <button
            type="button"
            onClick={autoDetect}
            disabled={loading}
            className="text-neon-cyan hover:underline flex items-center gap-1"
          >
            <Navigation className="w-3 h-3" />
            Use My Location
          </button>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            {searchMode === "auto" ? "Auto-detecting location…" : `Showing results for "${cityInput}"`}
          </span>
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-border bg-card/50 p-8 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-neon-green animate-spin" />
          <p className="text-muted-foreground text-sm">
            {searchMode === "auto" ? "Detecting your location…" : "Searching OpenStreetMap…"}
          </p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive-foreground">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-destructive" />
          {error}
        </div>
      )}

      {/* Locations list */}
      {!loading && locations.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-foreground">
            Nearby Recycling &amp; Scrap Centres ({locations.length})
          </h3>

          {locations.map((loc, idx) => (
            <div
              key={idx}
              onClick={() => setSelected(loc)}
              className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
                selected?.name === loc.name
                  ? "border-neon-green/60 bg-neon-green/10 ring-2 ring-neon-green/30"
                  : "border-border hover:border-neon-green/40 bg-card/50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{loc.name}</p>
                  {loc.type && (
                    <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/20 mt-1 capitalize">
                      {loc.type}
                    </span>
                  )}
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{loc.address}</span>
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-2">
                  <div className="text-lg font-bold text-neon-green">
                    {loc.distance.toFixed(1)} <span className="text-xs">km</span>
                  </div>
                  <a
                    href={loc.map_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center gap-1 w-full rounded-lg px-2 py-1.5 text-xs font-medium border border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 transition-colors duration-200"
                  >
                    <Map className="w-3 h-3" />
                    OpenStreetMap
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Pickup */}
      {!loading && locations.length > 0 && (
        <button
          onClick={handleRequestPickup}
          disabled={requestingPickup || !selected}
          className="w-full rounded-xl px-5 py-3 font-medium border border-neon-green/30 bg-neon-green/10 text-neon-green hover:bg-neon-green/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {requestingPickup ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Requesting Pickup…
            </span>
          ) : (
            `Request Pickup from ${selected?.name || "Selected Centre"}`
          )}
        </button>
      )}
    </div>
  )
}

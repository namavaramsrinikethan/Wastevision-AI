# WasteVision

WasteVision is an AI-powered waste analysis and optimization system developed during our college hackathon. The project focuses on analyzing waste images, detecting waste categories, calculating material composition, estimating recyclable value, and providing smart disposal recommendations.

Our team was selected in the Top 11 out of 1153 teams and received an appreciation certificate along with a ₹2000 cash prize.

## Project Overview

WasteVision allows users to upload waste images and get AI-based analysis of the waste composition. The system is designed to support better waste segregation, recycling decisions, and disposal planning.

## Key Features

* Waste image upload
* AI-based waste detection and classification
* Material composition calculation
* Economic value estimation
* Smart disposal recommendations
* Segregation efficiency score
* Location-based disposal suggestions
* Analytics dashboard
* Upload history tracking
* Settings page

## Tech Stack

### Frontend

* React
* Responsive UI
* Reusable components

### Backend

* FastAPI
* Python

### AI Model

* YOLOv8
* PyTorch

### Database

* SQLite / Firebase

### Maps

* Google Maps API / OpenStreetMap

## Waste Categories

The system is designed to classify waste into categories such as:

* Plastic
* Metal
* Paper
* Organic
* Glass
* E-waste

## System Workflow

```text
User Uploads Waste Image
        ↓
AI Model Detects Waste Objects
        ↓
Material Composition is Calculated
        ↓
Economic Value is Estimated
        ↓
Disposal Recommendations are Generated
        ↓
Analytics and History are Displayed
```

## Main Modules

### Image Upload

Users can upload JPG or PNG waste images. The frontend provides image preview, upload progress, and error handling for invalid files or large file sizes.

### AI Waste Detection

The backend uses YOLOv8 or mock predictions to detect waste objects and return bounding boxes, class labels, and confidence scores.

### Material Composition Analysis

The system calculates approximate material composition using bounding box area.

### Value Estimation

The project estimates the possible recyclable value of detected waste using predefined material weights and price-per-kg values.

### Smart Recommendations

The recommendation system suggests actions such as composting, selling recyclables, or certified disposal based on the waste composition.

### Segregation Score

A score is calculated to show the efficiency of waste segregation and is displayed with color-coded categories.

### Location-Based Disposal

The system can show nearby scrap dealers, recycling centers, and compost facilities using location-based recommendations or mock data.

### Analytics Dashboard

The dashboard displays waste composition, distribution, recyclable percentage, organic percentage, and other useful statistics.

### History

The system stores past uploads with image, date, value, and segregation score.

## Hackathon Achievement

* Selected in Top 11 out of 1153 teams
* Team size: 4 members
* Each team member received an appreciation certificate
* Team received ₹2000 cash prize

## Use Cases

* Smart waste management
* Recycling optimization
* Environmental awareness
* Municipal waste analysis
* Educational demonstrations
* Sustainability-focused applications

## Future Improvements

* Train a custom waste detection model
* Add real-time location-based disposal centers
* Improve accuracy of material value estimation
* Add user authentication
* Add admin dashboard
* Deploy full-stack application online

## Author

N. Srinikethan
B.Tech CSE (AI & ML)

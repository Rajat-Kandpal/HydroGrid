<<<<<<< HEAD
# 🌊 HydroGrid // Delhi-NCR Climate Telemetry & Civic Action Platform

> **HydroGrid** is an immersive, production-ready geospatial full-stack application addressing Delhi-NCR's twin climate crises: blistering urban heat islands (**Summer Drought Mode**) and catastrophic urban inundation (**Monsoon Flood Mode**).

---

## 🌟 Key Features

1. **Dual-Mode Visual Engine**:
   - Dark Obsidian foundation (`#05070B`)
   - **Summer Drought Mode**: Solar Amber (`#FF4500`) with heat island thermal polygons, groundwater depletion indicators, and tanker logistics.
   - **Monsoon Flood Mode**: Hydro Cyan (`#00E5FF`) with waterlogging sumps, Yamuna river gauge breach alerts, and drain silt vectors.
   - Procedural Web Audio API soundscape synthesis (cybernetic beeps, harmonic verification chimes).

2. **Cinematic Scrollytelling Acts**:
   - **Act I: The Urban Anatomy**: Delhi-NCR's existential climate paradox (49°C heatwaves vs 100mm/hr cloudbursts).
   - **Act II: Thermal Asphyxiation (Drought Focus)**: Karol Bagh, Connaught Place, and Okhla concrete basins vs ridge forest sanctuaries.
   - **Act III: The Choked Grids (Monsoon Focus)**: Minto Bridge underpass, Najafgarh drain (57km), Barapullah basin, and Yamuna floodplain overflow telemetry.

3. **Real-Time Interactive Leaflet Map Matrix (`HydroMap.jsx`)**:
   - Centered on Delhi-NCR (`[28.6139, 77.2090]`) with CartoDB Dark Matter base tiles.
   - **NASA/Sentinel-2 NDVI Layer**: Real-time vegetation canopy vs concrete barren zones gradient.
   - **Surface Water Inundation Grids**: Sentinel-1 SAR simulated water accumulation polygons with opacity controls.
   - **Drainage Grid Vectors**: Silted trunk drainage lines (Najafgarh Drain, Barapullah Confluence).
   - **Custom Animated Pulsing Markers**: Real-time SCADA telemetry popups for critical zones.
   - **Grid Jump Buttons**: Instant teleport to critical Delhi hotspots (Minto Bridge, Karol Bagh, Loha Pul, etc.).

4. **HuggingFace AI Vision Incident Verification (`ReportModule.jsx`)**:
   - Snap-to-Grid citizen hazard reporting module.
   - EXIF geotagging extraction & Delhi-NCR grid coordinate snapping.
   - Simulated HuggingFace Vision AI inference with laser radar scanning, confidence scoring, hazard severity rating, and cryptographic verification badge (`HG-VERIFIED-XXXXX`).
   - One-click sample test feeds for rapid evaluation.

5. **Gamified RWA Leaderboard & Live Feed (`Leaderboard.jsx`)**:
   - Benchmarks Delhi-NCR RWAs (Vasant Kunj, Dwarka Sector 12, Karol Bagh, Lajpat Nagar, Rohini).
   - Tracks verified reports resolved, liters conserved, and canopy cover gain.
   - Interactive cheer/upvote system awarding instant green credits.

---

## 🏗️ Directory Architecture

```
HydroGrid/
├── package.json                 # Monorepo concurrent execution
├── README.md                    # Platform documentation
├── server/
│   ├── package.json             # Express, Multer, Cors, Exif-Parser
│   ├── index.js                 # Server entry point & API router
│   └── routes/
│       ├── telemetry.js         # Real-time municipal sensors & jitter stream
│       ├── satellite.js         # Sentinel-2 NDVI & flood raster polygons
│       ├── verification.js      # HuggingFace Vision AI inference & image upload
│       └── leaderboard.js       # RWA community ranks & incident persistence
└── client/
    ├── package.json             # React, Leaflet, Framer Motion, Tailwind CSS
    ├── vite.config.js           # Vite dev server with /api proxy
    ├── tailwind.config.js       # Obsidian, Solar Amber, Hydro Cyan configuration
    ├── index.html               # Custom dark theme & Leaflet stylesheets
    └── src/
        ├── index.css            # Dark theme, glassmorphism & radar animations
        ├── main.jsx             # React DOM entry
        ├── App.jsx              # Scrollytelling master orchestrator
        ├── context/
        │   └── SeasonContext.jsx# Dual-mode theme & Web Audio API synthesizer
        ├── services/
        │   └── api.js           # Resilient API service with offline fallbacks
        └── components/
            ├── Navbar.jsx       # Floating HUD with season switch & ticker
            ├── ScrollySection.jsx# Cinematic narrative acts
            ├── TelemetryHUD.jsx # Real-time municipal SCADA gauges
            ├── HydroMap.jsx     # Leaflet map + Satellite tile layers
            ├── ReportModule.jsx # Snap-to-Grid reporting & AI validation badge
            └── Leaderboard.jsx  # Gamified RWA leaderboard & verified feed
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# In HydroGrid root directory
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Run Both Backend and Frontend Concurrently
```bash
# Starts Express on http://localhost:5000 and Vite React on http://localhost:3000
npm run dev
```

Or run them individually:
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run client
```

### 3. Build for Production
```bash
npm run build
```

---

## 📡 API Endpoints Reference

| Route | Method | Description |
| :--- | :--- | :--- |
| `GET /api/health` | `GET` | Health check & gateway diagnostics |
| `GET /api/telemetry?mode=flood\|drought` | `GET` | Live municipal SCADA sensors with dynamic jitter |
| `GET /api/satellite` | `GET` | Sentinel-2 NDVI polygons & flood risk zones |
| `POST /api/verify-incident` | `POST` | Multipart upload, EXIF parse & HuggingFace AI vision |
| `GET /api/incidents` | `GET` | Community verified incidents feed |
| `GET /api/leaderboard` | `GET` | Delhi-NCR RWA resilience rankings |
| `POST /api/leaderboard/award` | `POST` | Award green credits to an RWA |

---

## 🛡️ License
MIT License &bull; HydroGrid Project
=======
# HydroGrid
>>>>>>> 9bd9a48cc1e4c637453b691b0289a869321a8267

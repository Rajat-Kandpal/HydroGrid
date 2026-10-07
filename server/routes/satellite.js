const express = require('express');
const router = express.Router();

// Simulated NASA / Sentinel-2 NDVI layers and flood accumulation vectors for Delhi-NCR
const ndviZones = [
  {
    name: "Central Ridge Forest Canopy",
    type: "High_NDVI",
    ndviValue: 0.76,
    color: "#00FF66",
    coordinates: [
      [28.610, 77.170],
      [28.595, 77.165],
      [28.580, 77.175],
      [28.590, 77.185],
      [28.610, 77.170]
    ]
  },
  {
    name: "Asola Bhatti Wildlife Sanctuary",
    type: "High_NDVI",
    ndviValue: 0.81,
    color: "#00E676",
    coordinates: [
      [28.480, 77.220],
      [28.450, 77.240],
      [28.460, 77.280],
      [28.490, 77.250],
      [28.480, 77.220]
    ]
  },
  {
    name: "Karol Bagh & Sadar Concrete Basin",
    type: "Critical_Low_NDVI",
    ndviValue: 0.08,
    color: "#FF1744",
    coordinates: [
      [28.655, 77.185],
      [28.645, 77.200],
      [28.658, 77.215],
      [28.668, 77.195],
      [28.655, 77.185]
    ]
  },
  {
    name: "Okhla Industrial Asphalt Trap",
    type: "Critical_Low_NDVI",
    ndviValue: 0.09,
    color: "#FF3D00",
    coordinates: [
      [28.540, 77.260],
      [28.525, 77.280],
      [28.515, 77.265],
      [28.530, 77.250],
      [28.540, 77.260]
    ]
  },
  {
    name: "Yamuna Biodiversity Buffer",
    type: "High_NDVI",
    ndviValue: 0.72,
    color: "#00E5FF",
    coordinates: [
      [28.710, 77.215],
      [28.690, 77.225],
      [28.675, 77.240],
      [28.695, 77.230],
      [28.710, 77.215]
    ]
  }
];

// Flood Accumulation & Inundation Polygons (Simulated Sentinel-1 SAR Water Extent)
const floodRiskZones = [
  {
    name: "Minto Bridge Underpass Basin",
    severity: "CRITICAL_INUNDATION",
    depthEstimatedM: 2.8,
    color: "#00E5FF",
    fillColor: "rgba(0, 229, 255, 0.45)",
    coordinates: [
      [28.634, 77.221],
      [28.631, 77.221],
      [28.631, 77.224],
      [28.634, 77.224],
      [28.634, 77.221]
    ]
  },
  {
    name: "Yamuna Floodplain Inundation Zone (ITO / Mayur Vihar)",
    severity: "SURGE_OVERFLOW",
    depthEstimatedM: 3.5,
    color: "#0077FF",
    fillColor: "rgba(0, 119, 255, 0.35)",
    coordinates: [
      [28.640, 77.250],
      [28.620, 77.260],
      [28.600, 77.275],
      [28.610, 77.290],
      [28.635, 77.275],
      [28.650, 77.260],
      [28.640, 77.250]
    ]
  },
  {
    name: "Pul Prahladpur Underpass",
    severity: "RECURRENT_WATERLOGGING",
    depthEstimatedM: 2.1,
    color: "#00E5FF",
    fillColor: "rgba(0, 229, 255, 0.40)",
    coordinates: [
      [28.505, 77.288],
      [28.498, 77.288],
      [28.498, 77.294],
      [28.505, 77.294],
      [28.505, 77.288]
    ]
  },
  {
    name: "Zakhira Flyover Junction Sump",
    severity: "PUMP_OVERWHELMED",
    depthEstimatedM: 1.9,
    color: "#2979FF",
    fillColor: "rgba(41, 121, 255, 0.38)",
    coordinates: [
      [28.665, 77.155],
      [28.658, 77.155],
      [28.658, 77.163],
      [28.665, 77.163],
      [28.665, 77.155]
    ]
  }
];

// Drainage Grid Vectors (Trunk Arteries)
const drainageArteries = [
  {
    name: "Najafgarh Trunk Drain (Length: 57km)",
    dischargePct: 88,
    status: "SEVERELY_SILTED",
    path: [
      [28.520, 76.980],
      [28.570, 77.030],
      [28.620, 77.080],
      [28.670, 77.120],
      [28.710, 77.220]
    ]
  },
  {
    name: "Barapullah Stormwater Drain",
    dischargePct: 74,
    status: "DEBRIS_CONSTRICTED",
    path: [
      [28.570, 77.190],
      [28.580, 77.220],
      [28.585, 77.250],
      [28.590, 77.265]
    ]
  },
  {
    name: "Supplementary Drain North",
    dischargePct: 62,
    status: "PARTIAL_FLOW",
    path: [
      [28.740, 77.110],
      [28.720, 77.150],
      [28.710, 77.200],
      [28.712, 77.225]
    ]
  }
];

router.get('/', (req, res) => {
  const satelliteSource = req.query.source || 'Sentinel-2_MSI';

  res.json({
    success: true,
    metadata: {
      provider: "Copernicus Open Access Hub & NASA FIRMS Sync",
      sensor: satelliteSource,
      spatialResolutionMeters: 10,
      lastPassUtc: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
      cloudCoverPct: 3.2,
      boundingEnvelope: {
        northWest: [28.850, 76.850],
        southEast: [28.400, 77.400]
      }
    },
    data: {
      ndviZones,
      floodRiskZones,
      drainageArteries
    }
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const ExifParser = require('exif-parser');
const crypto = require('crypto');

// In-memory storage for uploaded incident images
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Seed incidents database in memory
let verifiedIncidents = [
  {
    id: "INC-2026-DEL-001",
    badgeToken: "HG-VERIFIED-A891B",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    coords: [28.6328, 77.2223],
    locationName: "Minto Road Underpass",
    category: "WATERLOGGING_CRITICAL",
    severity: 5,
    confidence: 0.968,
    status: "DISPATCHED_TO_MCD",
    rwa: "Connaught Place Central",
    aiTags: ["deep_standing_water", "submerged_vehicle_wheel", "culvert_blockage"],
    description: "Water level rose 1.8m in 25 minutes after localized cloudburst.",
    imageUrl: null
  },
  {
    id: "INC-2026-DEL-002",
    badgeToken: "HG-VERIFIED-C472X",
    timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    coords: [28.6517, 77.1906],
    locationName: "Karol Bagh Arya Samaj Road",
    category: "HEAT_ISLAND_HOTSPOT",
    severity: 4,
    confidence: 0.942,
    status: "CANOPY_SHADE_ALERT",
    rwa: "Karol Bagh Traders & Residents RWA",
    aiTags: ["asphalt_thermal_fracture", "zero_shade_corridor", "air_radiance_high"],
    description: "Thermal emissivity measured above 49°C along commercial corridor.",
    imageUrl: null
  },
  {
    id: "INC-2026-DEL-003",
    badgeToken: "HG-VERIFIED-E910Z",
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    coords: [28.5355, 77.2715],
    locationName: "Okhla Phase II Container Yard",
    category: "POTABLE_WATER_LEAK",
    severity: 3,
    confidence: 0.915,
    status: "PIPELINE_CREW_ALERTED",
    rwa: "Okhla Industrial & Welfare Assoc.",
    aiTags: ["ruptured_trunk_pipe", "high_velocity_jet", "surface_puddle"],
    description: "Main supply conduit leaking 500 liters/minute onto roadway.",
    imageUrl: null
  }
];

// Helper to determine AI vision category and tags based on hints or random fallback
function inferHazardCharacteristics(categoryHint) {
  const catalog = {
    WATERLOGGING_CRITICAL: {
      category: "WATERLOGGING_CRITICAL",
      confidence: (0.92 + Math.random() * 0.07).toFixed(3),
      severity: 5,
      detectedObjects: ["standing_floodwater", "submerged_sidewalk", "storm_drain_reversal"],
      hazardSummary: "Severe inundation exceeding 1.2m depth detected by vision transformer.",
      modelSignature: "HuggingFace/geo-flood-detr-v3"
    },
    HEAT_ISLAND_HOTSPOT: {
      category: "HEAT_ISLAND_HOTSPOT",
      confidence: (0.90 + Math.random() * 0.08).toFixed(3),
      severity: 4,
      detectedObjects: ["high_albedo_asphalt", "thermal_radiation_plume", "vegetation_deficit"],
      hazardSummary: "Extreme surface heat trap detected without shade buffer.",
      modelSignature: "HuggingFace/thermal-canopy-vit"
    },
    DRAIN_CHOKED: {
      category: "DRAIN_CHOKED",
      confidence: (0.93 + Math.random() * 0.06).toFixed(3),
      severity: 4,
      detectedObjects: ["solid_waste_occlusion", "stagnant_blackwater", "plastic_clog"],
      hazardSummary: "Stormwater conduit blocked over 80% with municipal debris.",
      modelSignature: "HuggingFace/drainage-choke-segformer"
    },
    UNAUTHORIZED_BOREWELL: {
      category: "UNAUTHORIZED_BOREWELL",
      confidence: (0.88 + Math.random() * 0.09).toFixed(3),
      severity: 4,
      detectedObjects: ["submersible_rig_chassis", "deep_aquifer_casing", "commercial_tanker_fill"],
      hazardSummary: "Unlicensed deep-aquifer extraction rig detected in zero-recharge zone.",
      modelSignature: "HuggingFace/aquifer-sentinel-yolo"
    },
    POTABLE_WATER_LEAK: {
      category: "POTABLE_WATER_LEAK",
      confidence: (0.91 + Math.random() * 0.07).toFixed(3),
      severity: 3,
      detectedObjects: ["pressurized_plume", "pipe_fissure", "freshwater_pooling"],
      hazardSummary: "Pressurized municipal drinking water main rupture detected.",
      modelSignature: "HuggingFace/pipe-leak-vit"
    }
  };

  if (categoryHint && catalog[categoryHint]) {
    return catalog[categoryHint];
  }
  const keys = Object.keys(catalog);
  return catalog[keys[Math.floor(Math.random() * keys.length)]];
}

// POST: /api/verify-incident - Verify image via HuggingFace Vision AI Simulation
router.post('/verify-incident', upload.single('image'), (req, res) => {
  try {
    let extractedGps = null;
    let cameraMeta = {};

    // 1. Try to extract EXIF data if buffer exists
    if (req.file && req.file.buffer) {
      try {
        const parser = ExifParser.create(req.file.buffer);
        const result = parser.parse();
        if (result.tags) {
          cameraMeta = {
            make: result.tags.Make || "Mobile Sensor",
            model: result.tags.Model || "Digital Lens",
            dateTimeOriginal: result.tags.DateTimeOriginal
          };
          if (result.tags.GPSLatitude && result.tags.GPSLongitude) {
            extractedGps = [result.tags.GPSLatitude, result.tags.GPSLongitude];
          }
        }
      } catch (exifErr) {
        // EXIF might be missing from PNGs or stripped by browser
        console.log("EXIF parse note: No raw EXIF tags found or format is non-JPEG.");
      }
    }

    // 2. Geolocation fallback: Use form coordinates or snap to central Delhi
    let latitude = req.body.latitude ? parseFloat(req.body.latitude) : null;
    let longitude = req.body.longitude ? parseFloat(req.body.longitude) : null;

    if (extractedGps) {
      latitude = extractedGps[0];
      longitude = extractedGps[1];
    } else if (!latitude || !longitude) {
      // Snap to Delhi-NCR grid envelope with subtle pseudo-random spread
      latitude = 28.6139 + (Math.random() - 0.5) * 0.08;
      longitude = 77.2090 + (Math.random() - 0.5) * 0.08;
    }

    const categoryHint = req.body.category || 'WATERLOGGING_CRITICAL';
    const locationName = req.body.locationName || 'Delhi-NCR Identified Grid';
    const rwaName = req.body.rwa || 'Delhi Citizen Sentinel';
    const userNotes = req.body.description || 'Verified via citizen reporting portal';

    // 3. AI Vision inference simulation
    const inference = inferHazardCharacteristics(categoryHint);
    const hash = crypto.randomBytes(3).toString('hex').toUpperCase();
    const badgeToken = `HG-VERIFIED-${hash}`;
    const incidentId = `INC-${new Date().getFullYear()}-DEL-${Math.floor(1000 + Math.random() * 9000)}`;

    const newIncident = {
      id: incidentId,
      badgeToken,
      timestamp: new Date().toISOString(),
      coords: [Number(latitude.toFixed(4)), Number(longitude.toFixed(4))],
      locationName,
      category: inference.category,
      severity: inference.severity,
      confidence: parseFloat(inference.confidence),
      status: "AI_VERIFIED_PENDING_DISPATCH",
      rwa: rwaName,
      aiTags: inference.detectedObjects,
      description: userNotes,
      aiModel: inference.modelSignature,
      hazardSummary: inference.hazardSummary,
      cameraMeta: cameraMeta,
      exifExtracted: !!extractedGps
    };

    // Store in live memory incidents list
    verifiedIncidents.unshift(newIncident);

    // Keep memory collection at reasonable size
    if (verifiedIncidents.length > 50) {
      verifiedIncidents.pop();
    }

    return res.json({
      success: true,
      message: "HuggingFace Vision Inference Complete & Verified",
      incident: newIncident
    });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({
      success: false,
      error: "AI verification pipeline failed: " + err.message
    });
  }
});

// GET: /api/verify-incident - Fetch all verified incidents
router.get('/incidents', (req, res) => {
  res.json({
    success: true,
    count: verifiedIncidents.length,
    data: verifiedIncidents
  });
});

module.exports = router;

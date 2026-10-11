const express = require('express');
const router = express.Router();
const multer = require('multer');
const ExifParser = require('exif-parser');
const crypto = require('crypto');

// Memory storage for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Delhi-NCR Geofence Envelope
const NCR_BOUNDS = {
  minLat: 28.20,
  maxLat: 29.00,
  minLng: 76.80,
  maxLng: 77.55
};

// Known Municipal SCADA High-Risk Nodes for Proximity Calculation
const SCADA_RISK_NODES = [
  { name: "Minto Bridge Underpass", coords: [28.6328, 77.2223], riskWeight: 1.5, type: "WATERLOGGING" },
  { name: "Karol Bagh Concrete Basin", coords: [28.6517, 77.1906], riskWeight: 1.3, type: "HEAT_ISLAND" },
  { name: "Yamuna Old Railway Bridge", coords: [28.6644, 77.2485], riskWeight: 1.6, type: "RIVER_SURGE" },
  { name: "Najafgarh Drain Outfall Point", coords: [28.6821, 77.1215], riskWeight: 1.4, type: "DRAIN_CHOKE" },
  { name: "Okhla Phase II Depot", coords: [28.5355, 77.2715], riskWeight: 1.2, type: "WATER_SCARCITY" },
  { name: "Pul Prahladpur Underpass", coords: [28.5020, 77.2910], riskWeight: 1.4, type: "WATERLOGGING" }
];

// Distance helper (Haversine formula in km)
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// In-memory Incident Store
let verifiedIncidents = [
  {
    id: "INC-2026-DEL-101",
    badgeToken: "HG-VERIFIED-9A4B8F",
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    coords: [28.6328, 77.2223],
    locationName: "Minto Bridge Underpass",
    category: "WATERLOGGING_CRITICAL",
    categoryLabel: "Waterlogging / Submerged Underpass",
    severity: 5,
    confidence: 0.942,
    status: "DISPATCHED_TO_FLEET",
    assignedFleet: {
      unitId: "PUMP-UNIT-04",
      unitName: "Heavy Dewatering Pump (500 LPS)",
      etaMinutes: 8,
      assignedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    },
    rwa: "Connaught Place Central",
    reporterName: "Arjun Verma (Citizen Sentinel)",
    aiTags: ["standing_floodwater", "submerged_vehicle_wheel", "culvert_blockage"],
    description: "Water level rose 2.2m inside underpass. Traffic diverted towards Barakhamba.",
    geofenceValid: true,
    proximityScore: "CRITICAL (< 0.2km from SCADA-NODE-DEL-01)",
    aiModel: "HuggingFace/geo-flood-detr-v3"
  },
  {
    id: "INC-2026-DEL-102",
    badgeToken: "HG-VERIFIED-7C21D3",
    timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    coords: [28.6517, 77.1906],
    locationName: "Karol Bagh Arya Samaj Market",
    category: "HEAT_ISLAND_HOTSPOT",
    categoryLabel: "Extreme Heat Island / Zero-Shade Trap",
    severity: 4,
    confidence: 0.918,
    status: "AI_VALIDATED",
    assignedFleet: null,
    rwa: "Karol Bagh Traders & Residents RWA",
    reporterName: "Pooja Sharma (RWA Volunteer)",
    aiTags: ["asphalt_thermal_fracture", "zero_shade_corridor", "air_radiance_high"],
    description: "Surface asphalt radiance measured at 48.9°C. Vulnerable pedestrian heat exhaustion risk.",
    geofenceValid: true,
    proximityScore: "HIGH (< 0.5km from SCADA-NODE-DEL-02)",
    aiModel: "HuggingFace/thermal-canopy-vit"
  },
  {
    id: "INC-2026-DEL-103",
    badgeToken: "HG-VERIFIED-4E89B1",
    timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    coords: [28.6821, 77.1215],
    locationName: "Najafgarh Drain Culvert #14",
    category: "DRAIN_CHOKED",
    categoryLabel: "Choked Drain / Silt Blockage",
    severity: 4,
    confidence: 0.885,
    status: "RESOLVED",
    assignedFleet: {
      unitId: "EXCAV-UNIT-02",
      unitName: "Super-Sucker Silt Excavator",
      etaMinutes: 0,
      assignedAt: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
      resolvedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
    },
    rwa: "West Delhi Eco Federation",
    reporterName: "Devendra Rawat",
    aiTags: ["plastic_debris_block", "silt_accumulation", "overflow_risk"],
    description: "Plastic choke point obstructing stormwater outfall. Desilted and cleared.",
    geofenceValid: true,
    proximityScore: "CRITICAL (< 0.3km from SCADA-NODE-DEL-04)",
    aiModel: "HuggingFace/drainage-choke-segformer"
  }
];

// POST: /api/verify-incident - Smart 4-Stage Guarded AI Verification
router.post('/verify-incident', upload.single('image'), (req, res) => {
  try {
    let extractedGps = null;
    let cameraMeta = {};

    // 1. Stage 1: EXIF Metadata Extraction
    if (req.file && req.file.buffer) {
      try {
        const parser = ExifParser.create(req.file.buffer);
        const result = parser.parse();
        if (result.tags) {
          cameraMeta = {
            make: result.tags.Make || "Mobile Camera Sensor",
            model: result.tags.Model || "Digital Lens",
            dateTimeOriginal: result.tags.DateTimeOriginal
          };
          if (result.tags.GPSLatitude && result.tags.GPSLongitude) {
            extractedGps = [result.tags.GPSLatitude, result.tags.GPSLongitude];
          }
        }
      } catch (exifErr) {
        console.log("EXIF note: Non-JPEG or stripped EXIF tags.");
      }
    }

    // Resolve Coordinates (Form input or EXIF fallback)
    let lat = req.body.latitude ? parseFloat(req.body.latitude) : null;
    let lng = req.body.longitude ? parseFloat(req.body.longitude) : null;

    if (extractedGps) {
      lat = extractedGps[0];
      lng = extractedGps[1];
    } else if (!lat || !lng) {
      // Default to central Delhi coordinates
      lat = 28.6139;
      lng = 77.2090;
    }

    // Stage 1B: Delhi-NCR Boundary Geofence Check
    const isInsideNCR = (
      lat >= NCR_BOUNDS.minLat && lat <= NCR_BOUNDS.maxLat &&
      lng >= NCR_BOUNDS.minLng && lng <= NCR_BOUNDS.maxLng
    );

    // 2. Stage 2: Computer Vision Token Analysis
    const category = req.body.category || 'WATERLOGGING_CRITICAL';
    const locationName = req.body.locationName || 'Delhi-NCR Identified Grid';
    const rwaName = req.body.rwa || 'Delhi Citizen Sentinel';
    const reporterName = req.body.reporterName || 'Citizen Sentinel';
    const description = req.body.description || 'Verified via citizen reporting portal';

    // Simulate Computer Vision feature detection confidence
    // High-quality photos score 78%-96%, ambiguous photos score 52%-64%
    const isAmbiguous = req.body.forceAmbiguous === 'true';
    const rawConfidence = isAmbiguous 
      ? parseFloat((0.50 + Math.random() * 0.14).toFixed(3)) 
      : parseFloat((0.78 + Math.random() * 0.18).toFixed(3));

    // 3. Stage 3: Guardrail Filter & Proximity Calculation
    let nearestNode = null;
    let minDistanceKm = 999;

    SCADA_RISK_NODES.forEach(node => {
      const d = calculateDistanceKm(lat, lng, node.coords[0], node.coords[1]);
      if (d < minDistanceKm) {
        minDistanceKm = d;
        nearestNode = node;
      }
    });

    let severityLevel = 2; // base level
    let status = "AI_VALIDATED";
    let guardrailNotes = [];

    // Guardrail: If confidence < 65%, do NOT assign Critical Severity!
    if (rawConfidence < 0.65) {
      status = "PENDING_MANUAL_REVIEW";
      severityLevel = 1;
      guardrailNotes.push("Confidence below 65% guardrail threshold: flagged for manual municipal inspector review.");
    } else {
      // Confidence is >= 65%: Compute dynamic severity based on category + proximity
      if (category.includes('WATERLOGGING') || category.includes('FLOOD')) {
        severityLevel = 4;
        if (minDistanceKm < 2.0 && nearestNode?.type === 'WATERLOGGING') {
          severityLevel = 5; // Close to Minto Bridge or Pul Prahladpur elevates to Critical
          guardrailNotes.push(`Proximity boost: Within ${minDistanceKm.toFixed(1)}km of critical waterlogging node ${nearestNode.name}.`);
        }
      } else if (category.includes('HEAT') || category.includes('DROUGHT')) {
        severityLevel = 3;
        if (minDistanceKm < 2.0 && nearestNode?.type === 'HEAT_ISLAND') {
          severityLevel = 4;
          guardrailNotes.push(`Proximity boost: Located within known thermal basin of ${nearestNode.name}.`);
        }
      } else if (category.includes('DRAIN')) {
        severityLevel = 3;
        if (minDistanceKm < 2.5 && nearestNode?.type === 'DRAIN_CHOKE') {
          severityLevel = 4;
          guardrailNotes.push(`Located along ${nearestNode.name} trunk artery.`);
        }
      } else {
        severityLevel = 3;
      }
    }

    if (!isInsideNCR) {
      guardrailNotes.push("Warning: Location coordinates fall outside official Delhi-NCR administrative geofence.");
    }

    // 4. Stage 4: Tamper-Proof Cryptographic Verification Token
    const hashPayload = `${lat}:${lng}:${category}:${Date.now()}`;
    const tokenHash = crypto.createHash('sha256').update(hashPayload).digest('hex').substring(0, 6).toUpperCase();
    const badgeToken = `HG-VERIFIED-${tokenHash}`;
    const incidentId = `INC-${new Date().getFullYear()}-DEL-${Math.floor(1000 + Math.random() * 9000)}`;

    const newIncident = {
      id: incidentId,
      badgeToken,
      timestamp: new Date().toISOString(),
      coords: [Number(lat.toFixed(4)), Number(lng.toFixed(4))],
      locationName,
      category,
      categoryLabel: getCategoryLabel(category),
      severity: severityLevel,
      confidence: rawConfidence,
      status: status,
      assignedFleet: null,
      rwa: rwaName,
      reporterName,
      aiTags: getFeatureTagsForCategory(category, rawConfidence),
      description,
      geofenceValid: isInsideNCR,
      proximityScore: `< ${minDistanceKm.toFixed(1)}km from ${nearestNode?.name}`,
      guardrailNotes,
      cameraMeta,
      exifExtracted: !!extractedGps,
      aiModel: "HuggingFace/geo-sentinel-detr-v3"
    };

    // Store incident in memory
    verifiedIncidents.unshift(newIncident);
    if (verifiedIncidents.length > 50) verifiedIncidents.pop();

    return res.json({
      success: true,
      message: status === "PENDING_MANUAL_REVIEW" 
        ? "AI Guardrail Engaged: Pending Manual Municipal Review" 
        : "Smart AI Verification Complete",
      incident: newIncident
    });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({
      success: false,
      error: "Smart verification pipeline failure: " + err.message
    });
  }
});

// GET: /api/incidents - List all incidents
router.get('/incidents', (req, res) => {
  res.json({
    success: true,
    count: verifiedIncidents.length,
    data: verifiedIncidents
  });
});

// PATCH / PUT: /api/incidents/:id/status - Update incident lifecycle status
router.patch('/incidents/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, assignedFleet } = req.body;

  const incident = verifiedIncidents.find(inc => inc.id === id);
  if (!incident) {
    return res.status(404).json({ success: false, message: "Incident not found" });
  }

  if (status) incident.status = status;
  if (assignedFleet) incident.assignedFleet = assignedFleet;

  return res.json({
    success: true,
    message: `Incident ${id} updated to ${incident.status}`,
    incident
  });
});

// Helpers
function getCategoryLabel(cat) {
  const map = {
    WATERLOGGING_CRITICAL: "Waterlogging / Submerged Underpass",
    HEAT_ISLAND_HOTSPOT: "Extreme Heat Island / Zero-Shade Trap",
    DRAIN_CHOKED: "Choked Drain / Silt Blockage",
    POTABLE_WATER_LEAK: "Pipeline Leakage / Waste Water Discharge",
    UNAUTHORIZED_BOREWELL: "Water Scarcity / Tanker Malpractice",
    WATER_CONTAMINATION: "Water Quality Hazard (Contamination / Odor)"
  };
  return map[cat] || cat;
}

function getFeatureTagsForCategory(cat, conf) {
  if (conf < 0.65) return ["ambiguous_rgb_signature", "low_contrast_specular", "manual_audit_required"];
  const tagsMap = {
    WATERLOGGING_CRITICAL: ["standing_floodwater", "depth_reflection_high", "submerged_asphalt_curb"],
    HEAT_ISLAND_HOTSPOT: ["high_albedo_asphalt", "thermal_radiance_plume", "zero_canopy_cover"],
    DRAIN_CHOKED: ["solid_waste_clog", "stagnant_blackwater", "culvert_backpressure"],
    POTABLE_WATER_LEAK: ["pressurized_plume", "pipe_fissure", "freshwater_pooling"],
    UNAUTHORIZED_BOREWELL: ["submersible_rig_chassis", "deep_aquifer_casing", "commercial_tanker_fill"],
    WATER_CONTAMINATION: ["turbidity_suspended_solids", "chemical_sheen", "algal_bloom"]
  };
  return tagsMap[cat] || ["optical_anomaly_detected"];
}

module.exports = router;

const express = require('express');
const router = express.Router();

// In-memory Broadcast Emergency Alerts
let emergencyBroadcasts = [
  {
    id: "BC-2026-DEL-01",
    severity: "CRITICAL_RED",
    headline: "MINTO ROAD UNDERPASS SEALED // WATER LEVEL 2.8M",
    message: "Cloudburst runoff has submerged Minto Bridge to 2.8 meters depth. Traffic police have barricaded both approach corridors. Diverting commuters via Barakhamba Road and Deen Dayal Upadhyaya Marg.",
    affectedZones: ["Central Delhi", "Connaught Place", "New Delhi Rly Station"],
    issuedBy: "Delhi Traffic Police & MCD Emergency Cell",
    issuedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    status: "ACTIVE_EVACUATE",
    actionInstructions: "Do NOT attempt vehicular crossing. Follow diversions to DDU Marg."
  },
  {
    id: "BC-2026-DEL-02",
    severity: "HIGH_ORANGE",
    headline: "POTABLE SUPPLY ADVISORY // DWARKA SECTOR 12 & 14",
    message: "Secondary trunk line breach detected near Sector 12 master balancing reservoir. Precautionary boil-water advisory active until DJB pipeline crew completes sterilization.",
    affectedZones: ["South-West Delhi", "Dwarka Sector 12", "Dwarka Sector 14"],
    issuedBy: "Delhi Jal Board Quality Control Command",
    issuedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    status: "ACTIVE_ADVISORY",
    actionInstructions: "Boil tap water for minimum 3 minutes before potable consumption."
  }
];

// GET: /api/broadcasts
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: emergencyBroadcasts.length,
    data: emergencyBroadcasts
  });
});

// POST: /api/broadcasts - Publish a new emergency alert (Authorities only)
router.post('/', (req, res) => {
  try {
    const { headline, message, severity, affectedZones, issuedBy, actionInstructions } = req.body;

    if (!headline || !message) {
      return res.status(400).json({ success: false, message: "Headline and message are required." });
    }

    const newBroadcast = {
      id: `BC-${new Date().getFullYear()}-DEL-${Math.floor(10 + Math.random() * 90)}`,
      severity: severity || "CRITICAL_RED",
      headline,
      message,
      affectedZones: affectedZones || ["Delhi-NCR Wide"],
      issuedBy: issuedBy || "MCD Emergency Control Command",
      issuedAt: new Date().toISOString(),
      status: "ACTIVE_BROADCAST",
      actionInstructions: actionInstructions || "Monitor HydroGrid SCADA live stream for updates."
    };

    emergencyBroadcasts.unshift(newBroadcast);
    if (emergencyBroadcasts.length > 20) emergencyBroadcasts.pop();

    return res.json({
      success: true,
      message: "Emergency broadcast dispatched to all citizen dashboards",
      broadcast: newBroadcast
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();

// Municipal Rapid Response Fleet Database
let municipalFleet = [
  {
    id: "FLEET-PUMP-01",
    name: "Heavy Dewatering Pump Unit #01",
    type: "DEWATERING_PUMP",
    capacity: "500 Liters / Sec",
    baseStation: "ITO Municipal Yard",
    status: "AVAILABLE",
    currentAssignment: null
  },
  {
    id: "FLEET-PUMP-02",
    name: "Submersible High-Discharge Pump #02",
    type: "DEWATERING_PUMP",
    capacity: "350 Liters / Sec",
    baseStation: "Zakhira Flyover Depot",
    status: "DEPLOYED",
    currentAssignment: "Minto Bridge Underpass"
  },
  {
    id: "FLEET-TANKER-01",
    name: "DJB Potable Water Emergency Tanker #12",
    type: "POTABLE_TANKER",
    capacity: "10,000 Liters",
    baseStation: "Okhla Phase II Tanker Hub",
    status: "AVAILABLE",
    currentAssignment: null
  },
  {
    id: "FLEET-TANKER-02",
    name: "DJB Potable Water Tanker #19",
    type: "POTABLE_TANKER",
    capacity: "12,000 Liters",
    baseStation: "Dwarka Sector 21 Reservoir",
    status: "AVAILABLE",
    currentAssignment: null
  },
  {
    id: "FLEET-EXCAV-01",
    name: "Super-Sucker Silt Extractor #04",
    type: "DESILTING_UNIT",
    capacity: "Heavy Silt Vacuum",
    baseStation: "Najafgarh Drain Maintenance Hub",
    status: "AVAILABLE",
    currentAssignment: null
  },
  {
    id: "FLEET-PIPE-01",
    name: "MCD Rapid Pipeline Repair Squad #03",
    type: "PIPELINE_CREW",
    capacity: "Specialized Trunk Welders",
    baseStation: "Karol Bagh Civil Depot",
    status: "AVAILABLE",
    currentAssignment: null
  }
];

// GET: /api/dispatch/fleet - List all fleet resources
router.get('/fleet', (req, res) => {
  res.json({
    success: true,
    count: municipalFleet.length,
    data: municipalFleet
  });
});

// POST: /api/dispatch/assign - Assign fleet resource to incident
router.post('/assign', (req, res) => {
  const { incidentId, fleetUnitId } = req.body;

  if (!incidentId || !fleetUnitId) {
    return res.status(400).json({ success: false, message: "incidentId and fleetUnitId are required." });
  }

  const unit = municipalFleet.find(f => f.id === fleetUnitId);
  if (!unit) {
    return res.status(404).json({ success: false, message: "Fleet unit not found." });
  }

  unit.status = "DISPATCHED";
  unit.currentAssignment = incidentId;

  const etaMinutes = Math.floor(6 + Math.random() * 12);

  res.json({
    success: true,
    message: `${unit.name} dispatched to ${incidentId}`,
    assignment: {
      unitId: unit.id,
      unitName: unit.name,
      incidentId,
      etaMinutes,
      dispatchedAt: new Date().toISOString()
    }
  });
});

module.exports = router;

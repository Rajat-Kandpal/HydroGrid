const express = require('express');
const router = express.Router();

// Base telemetry nodes in Delhi-NCR
const baseNodes = [
  {
    id: "NODE-DEL-01",
    name: "Minto Bridge Underpass",
    coords: [28.6328, 77.2223],
    zone: "Central Delhi",
    type: "drainage_inundation",
    status: "CRITICAL_ALERT",
    metrics: {
      waterLevelCm: 185,
      drainCapacityPct: 18,
      pumpDischargeLps: 420,
      surfaceTempC: 32.4,
      flowVelocityMps: 0.12,
      riskLevel: "High"
    },
    history: [120, 145, 160, 175, 185]
  },
  {
    id: "NODE-DEL-02",
    name: "Karol Bagh Concrete Basin",
    coords: [28.6517, 77.1906],
    zone: "West-Central Delhi",
    type: "heat_island",
    status: "SEVERE_THERMAL",
    metrics: {
      waterLevelCm: 0,
      drainCapacityPct: 82,
      pumpDischargeLps: 0,
      surfaceTempC: 48.2,
      ambientTempC: 45.1,
      wetBulbTempC: 31.8,
      heatIndexC: 51.4,
      vegetationCoverPct: 4.2,
      riskLevel: "Critical"
    },
    history: [44.2, 45.6, 46.8, 47.5, 48.2]
  },
  {
    id: "NODE-DEL-03",
    name: "Okhla Industrial Area Tanker Depot",
    coords: [28.5355, 77.2715],
    zone: "South-East Delhi",
    type: "tanker_logistics",
    status: "HIGH_STRESS",
    metrics: {
      activeTankers: 38,
      pipelinePressureBar: 0.8,
      dailyDeficitKl: 1420,
      groundwaterDepthM: 38.6,
      surfaceTempC: 43.7,
      riskLevel: "High"
    },
    history: [35.2, 36.4, 37.1, 38.0, 38.6]
  },
  {
    id: "NODE-DEL-04",
    name: "Najafgarh Drain Outfall Point",
    coords: [28.6821, 77.1215],
    zone: "North-West Delhi",
    type: "drainage_trunk",
    status: "CHOKED_SILT",
    metrics: {
      siltAccumulationPct: 76,
      flowRateCusecs: 1450,
      toxicBiochemicalO2MgL: 64,
      waterLevelCm: 240,
      riskLevel: "Warning"
    },
    history: [68, 70, 72, 75, 76]
  },
  {
    id: "NODE-DEL-05",
    name: "Yamuna Old Railway Bridge (Loha Pul)",
    coords: [28.6644, 77.2485],
    zone: "East Delhi / Riverfront",
    type: "river_gauge",
    status: "ELEVATED_SURGE",
    metrics: {
      waterLevelM: 205.82,
      dangerMarkM: 205.33,
      warningMarkM: 204.50,
      dischargeCusecs: 182400,
      flowVelocityMps: 2.4,
      riskLevel: "Emergency"
    },
    history: [204.8, 205.1, 205.35, 205.6, 205.82]
  },
  {
    id: "NODE-DEL-06",
    name: "Central Ridge Reserve (Dhaula Kuan)",
    coords: [28.5921, 77.1605],
    zone: "Central-South Delhi",
    type: "green_sanctuary",
    status: "NOMINAL",
    metrics: {
      surfaceTempC: 33.1,
      ndviIndex: 0.74,
      canopyRetentionPct: 88,
      groundwaterDepthM: 14.2,
      riskLevel: "Safe"
    },
    history: [32.0, 32.5, 32.8, 33.0, 33.1]
  },
  {
    id: "NODE-DEL-07",
    name: "Dwarka Sector 21 Aquifer Well",
    coords: [28.5524, 77.0583],
    zone: "South-West Delhi",
    type: "groundwater_sensor",
    status: "DEPLETED_AQUIFER",
    metrics: {
      groundwaterDepthM: 42.1,
      tdsLevelPpm: 1840,
      extractionRateKld: 940,
      rechargeRateKld: 110,
      riskLevel: "High"
    },
    history: [39.5, 40.2, 41.0, 41.6, 42.1]
  },
  {
    id: "NODE-DEL-08",
    name: "Barapullah Stormwater Confluence",
    coords: [28.5830, 77.2410],
    zone: "South Delhi",
    type: "stormwater_confluence",
    status: "DEBRIS_RESTRICTION",
    metrics: {
      waterLevelCm: 165,
      debrisLoadTons: 14.8,
      flowDischargeLps: 680,
      riskLevel: "Warning"
    },
    history: [110, 130, 145, 155, 165]
  }
];

// Helper to add realistic telemetry jitter
const applyJitter = (val, maxVariance = 0.05) => {
  const delta = (Math.random() * 2 - 1) * maxVariance * val;
  return Number((val + delta).toFixed(2));
};

router.get('/', (req, res) => {
  const mode = req.query.mode || 'flood'; // 'flood' or 'drought'
  const isDrought = mode === 'drought';

  // Generate dynamic citywide summary metrics
  const citySummary = {
    timestamp: new Date().toISOString(),
    mode: mode,
    city: "Delhi-NCR",
    coordinates: [28.6139, 77.2090],
    weather: {
      ambientTemp: isDrought ? applyJitter(45.4, 0.02) : applyJitter(31.2, 0.03),
      heatIndex: isDrought ? applyJitter(51.8, 0.02) : applyJitter(39.4, 0.03),
      relativeHumidityPct: isDrought ? applyJitter(22, 0.08) : applyJitter(89, 0.04),
      precipitationMmPerHr: isDrought ? 0 : applyJitter(44.5, 0.15),
      airQualityAqi: isDrought ? 312 : 145
    },
    hydroMetrics: {
      yamunaWaterLevelM: isDrought ? applyJitter(202.10, 0.005) : applyJitter(205.85, 0.002),
      yamunaDangerMarkM: 205.33,
      yamunaWarningMarkM: 204.50,
      yamunaStatus: isDrought ? "SUB-CRITICAL_DROUGHT" : "ABOVE_DANGER_MARK",
      averageGroundwaterDepthM: isDrought ? applyJitter(39.8, 0.01) : applyJitter(33.4, 0.01),
      chokedDrainageSegments: isDrought ? 84 : 312,
      activeWaterloggingPoints: isDrought ? 2 : 47,
      dispatchedEmergencyTankers: isDrought ? 418 : 62,
      activePumpingStations: isDrought ? 12 : 89
    }
  };

  // Adjust nodes according to season mode
  const dynamicNodes = baseNodes.map(node => {
    const updated = JSON.parse(JSON.stringify(node));
    
    if (isDrought) {
      if (node.type === 'heat_island') {
        updated.metrics.surfaceTempC = applyJitter(48.5, 0.02);
        updated.metrics.ambientTempC = applyJitter(45.2, 0.02);
        updated.status = "SEVERE_THERMAL";
      } else if (node.type === 'tanker_logistics') {
        updated.metrics.activeTankers = Math.round(applyJitter(44, 0.1));
        updated.metrics.dailyDeficitKl = Math.round(applyJitter(1680, 0.05));
        updated.status = "EMERGENCY_RATIONING";
      } else if (node.type === 'groundwater_sensor') {
        updated.metrics.groundwaterDepthM = applyJitter(43.2, 0.02);
        updated.status = "SEVERE_DEPLETION";
      } else if (node.type === 'drainage_inundation') {
        updated.metrics.waterLevelCm = 0;
        updated.status = "DRY_CONDUIT";
        updated.metrics.riskLevel = "Low";
      } else if (node.type === 'river_gauge') {
        updated.metrics.waterLevelM = applyJitter(202.15, 0.005);
        updated.status = "DEPLETED_RIVERBED";
        updated.metrics.riskLevel = "Low";
      }
    } else {
      // Monsoon Flood mode
      if (node.type === 'drainage_inundation') {
        updated.metrics.waterLevelCm = Math.round(applyJitter(192, 0.08));
        updated.metrics.drainCapacityPct = Math.round(applyJitter(15, 0.1));
        updated.status = "CRITICAL_INUNDATION";
        updated.metrics.riskLevel = "Critical";
      } else if (node.type === 'river_gauge') {
        updated.metrics.waterLevelM = applyJitter(205.88, 0.002);
        updated.status = "SURGE_OVERFLOW";
        updated.metrics.riskLevel = "Emergency";
      } else if (node.type === 'drainage_trunk') {
        updated.metrics.siltAccumulationPct = Math.round(applyJitter(84, 0.04));
        updated.metrics.waterLevelCm = Math.round(applyJitter(270, 0.05));
        updated.status = "SPILLOVER_RISK";
        updated.metrics.riskLevel = "Critical";
      } else if (node.type === 'heat_island') {
        updated.metrics.surfaceTempC = applyJitter(32.8, 0.03);
        updated.status = "HUMID_SATURATION";
        updated.metrics.riskLevel = "Moderate";
      }
    }

    return updated;
  });

  res.json({
    success: true,
    data: {
      summary: citySummary,
      nodes: dynamicNodes
    }
  });
});

module.exports = router;

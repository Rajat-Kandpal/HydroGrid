const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const telemetryRoutes = require('./routes/telemetry');
const satelliteRoutes = require('./routes/satellite');
const verificationRoutes = require('./routes/verification');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and body parsers
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/satellite', satelliteRoutes);
app.use('/api', verificationRoutes); // mounts /api/verify-incident and /api/incidents
app.use('/api/leaderboard', leaderboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'HydroGrid Core Telemetry & AI Gateway',
    timestamp: new Date().toISOString(),
    version: '1.0.0-delhi-ncr'
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌊 HydroGrid Telemetry Server running on port ${PORT}`);
  console.log(`📡 Endpoints active:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - GET  /api/telemetry?mode=flood|drought`);
  console.log(`   - GET  /api/satellite?source=Sentinel-2_MSI`);
  console.log(`   - POST /api/verify-incident (HuggingFace Vision Simulator)`);
  console.log(`   - GET  /api/incidents`);
  console.log(`   - GET  /api/leaderboard`);
  console.log(`=======================================================`);
});

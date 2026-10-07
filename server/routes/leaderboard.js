const express = require('express');
const router = express.Router();

// Gamified RWA (Resident Welfare Association) Leaderboard dataset for Delhi-NCR
let rwaLeaderboard = [
  {
    rank: 1,
    id: "RWA-VK-C",
    name: "Vasant Kunj Sector C RWA",
    zone: "South-West Delhi",
    score: 9480,
    verifiedReports: 42,
    litersSaved: "1,420,000 L",
    canopyCoverGainPct: "+14.2%",
    desiltedDrains: 18,
    activeVolunteers: 124,
    badge: "Hydro Vanguard Champion",
    trend: "+2 ranks"
  },
  {
    rank: 2,
    id: "RWA-DWRK-12",
    name: "Dwarka Sector 12 Eco Federation",
    zone: "West Delhi",
    score: 8920,
    verifiedReports: 38,
    litersSaved: "980,000 L",
    canopyCoverGainPct: "+9.8%",
    desiltedDrains: 14,
    activeVolunteers: 98,
    badge: "Aquifer Restorer",
    trend: "+1 rank"
  },
  {
    rank: 3,
    id: "RWA-LJP-4",
    name: "Lajpat Nagar IV Civic Action Front",
    zone: "South Delhi",
    score: 8350,
    verifiedReports: 35,
    litersSaved: "750,000 L",
    canopyCoverGainPct: "+6.4%",
    desiltedDrains: 22,
    activeVolunteers: 82,
    badge: "Drainage Rapid Guard",
    trend: "-1 rank"
  },
  {
    rank: 4,
    id: "RWA-ROH-9",
    name: "Rohini Sector 9 Green Alliance",
    zone: "North-West Delhi",
    score: 7890,
    verifiedReports: 29,
    litersSaved: "620,000 L",
    canopyCoverGainPct: "+8.1%",
    desiltedDrains: 11,
    activeVolunteers: 64,
    badge: "Flood Sentinel",
    trend: "+3 ranks"
  },
  {
    rank: 5,
    id: "RWA-KB-AR",
    name: "Karol Bagh Arya Samaj Traders & RWA",
    zone: "Central-West Delhi",
    score: 7210,
    verifiedReports: 27,
    litersSaved: "490,000 L",
    canopyCoverGainPct: "+4.3%",
    desiltedDrains: 16,
    activeVolunteers: 57,
    badge: "Heat Island Mitigator",
    trend: "0"
  },
  {
    rank: 6,
    id: "RWA-OKH-2",
    name: "Okhla Residents & Industrial Welfare",
    zone: "South-East Delhi",
    score: 6840,
    verifiedReports: 23,
    litersSaved: "410,000 L",
    canopyCoverGainPct: "+3.9%",
    desiltedDrains: 9,
    activeVolunteers: 45,
    badge: "Tanker Integrity Sentinel",
    trend: "+1 rank"
  }
];

// GET: /api/leaderboard
router.get('/', (req, res) => {
  res.json({
    success: true,
    totalVerifiedActions: rwaLeaderboard.reduce((acc, r) => acc + r.verifiedReports, 0),
    leaderboard: rwaLeaderboard
  });
});

// POST: /api/leaderboard/vote - Upvote / award points to an RWA
router.post('/award', (req, res) => {
  const { rwaId, points } = req.body;
  const target = rwaLeaderboard.find(r => r.id === rwaId || r.name.toLowerCase().includes((rwaId || '').toLowerCase()));
  if (target) {
    target.score += (parseInt(points) || 100);
    target.verifiedReports += 1;
    // Sort leaderboard
    rwaLeaderboard.sort((a, b) => b.score - a.score);
    rwaLeaderboard.forEach((r, idx) => r.rank = idx + 1);
    return res.json({ success: true, updated: target, leaderboard: rwaLeaderboard });
  }
  res.status(404).json({ success: false, message: "RWA not found" });
});

module.exports = router;

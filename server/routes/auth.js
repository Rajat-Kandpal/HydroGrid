const express = require('express');
const router = express.Router();

const DEMO_PROFILES = {
  citizen: {
    id: "USR-DEL-8921",
    role: "citizen",
    name: "Arjun Verma",
    title: "Senior Resident Sentinel",
    rwa: "Vasant Kunj Sector C RWA",
    civicCredits: 850,
    badgeTier: "Hydro Sentinel Grade II",
    verifiedReportsCount: 6,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
  },
  authority: {
    id: "OFFICER-MCD-404",
    role: "authority",
    name: "Dr. Rajeshwar Rao",
    title: "Chief Municipal Hydrology Officer",
    department: "MCD Flood Control & DJB SCADA Cell",
    badgeTier: "Authority Level IV Command",
    clearanceLevel: "TOP_OPERATIONAL",
    activeDispatchesCount: 14,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
  },
  guest: {
    id: "GUEST-PUBLIC",
    role: "guest",
    name: "Public Observer",
    title: "Civilian Observer",
    rwa: "Delhi-NCR Wide",
    civicCredits: 0,
    badgeTier: "Observer",
    avatar: null
  }
};

router.post('/login', (req, res) => {
  const { role, username } = req.body;
  const targetRole = role && DEMO_PROFILES[role] ? role : 'citizen';
  const profile = JSON.parse(JSON.stringify(DEMO_PROFILES[targetRole]));

  if (username) {
    profile.name = username;
  }

  res.json({
    success: true,
    token: `HG-TOKEN-${targetRole.toUpperCase()}-${Date.now()}`,
    user: profile
  });
});

router.get('/me', (req, res) => {
  const role = req.query.role || 'citizen';
  const profile = DEMO_PROFILES[role] || DEMO_PROFILES.citizen;
  res.json({
    success: true,
    user: profile
  });
});

module.exports = router;

import React, { useState, useEffect } from 'react';
import { SeasonProvider, useSeason } from './context/SeasonContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { fetchTelemetry, fetchSatelliteData } from './services/api';

import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import CitizenDashboard from './pages/CitizenDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';

function MainLayout() {
  const { season, themeColors } = useSeason();
  const { role, switchRole } = useAuth();
  const isDrought = season === 'drought';

  const [telemetry, setTelemetry] = useState(null);
  const [satelliteData, setSatelliteData] = useState(null);

  // Poll telemetry every 15 seconds
  useEffect(() => {
    let isMounted = true;
    const loadTelemetry = async () => {
      const data = await fetchTelemetry(season);
      if (isMounted && data) {
        setTelemetry(data);
      }
    };

    const loadSatellite = async () => {
      const sat = await fetchSatelliteData();
      if (isMounted && sat) {
        setSatelliteData(sat);
      }
    };

    loadTelemetry();
    loadSatellite();

    const interval = setInterval(loadTelemetry, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [season]);

  return (
    <div className="min-h-screen bg-[#05070B] text-slate-100 relative selection:bg-cyan-500/30 selection:text-cyan-300">
      {/* Background dynamic ambient glow */}
      <div 
        className="fixed inset-0 pointer-events-none transition-all duration-1000 z-0"
        style={{
          background: isDrought 
            ? 'radial-gradient(circle at 50% 15%, rgba(255, 69, 0, 0.08) 0%, transparent 60%), radial-gradient(circle at 85% 60%, rgba(255, 165, 0, 0.05) 0%, transparent 50%)'
            : 'radial-gradient(circle at 50% 15%, rgba(0, 229, 255, 0.08) 0%, transparent 60%), radial-gradient(circle at 85% 60%, rgba(0, 119, 255, 0.05) 0%, transparent 50%)'
        }}
      ></div>

      {/* Navigation HUD Bar (z-50) */}
      <Navbar 
        telemetrySummary={telemetry?.summary} 
        activeView={role}
        onNavigate={(r) => switchRole(r)}
      />

      {/* Role-Based Active View Routing */}
      <div className="relative z-10">
        {role === 'citizen' ? (
          <CitizenDashboard />
        ) : role === 'authority' ? (
          <AuthorityDashboard />
        ) : (
          <LandingPage 
            telemetry={telemetry} 
            satelliteData={satelliteData}
            onNavigateTo={(r) => switchRole(r)}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SeasonProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </SeasonProvider>
  );
}

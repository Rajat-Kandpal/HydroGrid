import React, { useState, useEffect } from 'react';
import { SeasonProvider, useSeason } from './context/SeasonContext';
import { fetchTelemetry, fetchSatelliteData } from './services/api';

import Navbar from './components/Navbar';
import ScrollySection from './components/ScrollySection';
import TelemetryHUD from './components/TelemetryHUD';
import HydroMap from './components/HydroMap';
import ReportModule from './components/ReportModule';
import Leaderboard from './components/Leaderboard';

import { 
  Flame, 
  Droplets, 
  Compass, 
  ShieldCheck, 
  ChevronDown, 
  Sparkles, 
  Activity, 
  Radio, 
  Layers, 
  Cpu, 
  ArrowUpRight 
} from 'lucide-react';

function HydroGridDashboard() {
  const { season, themeColors, toggleSeason, playSound } = useSeason();
  const isDrought = season === 'drought';

  const [telemetry, setTelemetry] = useState(null);
  const [satelliteData, setSatelliteData] = useState(null);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [latestVerifiedIncident, setLatestVerifiedIncident] = useState(null);

  // Poll telemetry every 12 seconds to generate live jitter updates
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

    const interval = setInterval(loadTelemetry, 12000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [season]);

  const handleIncidentVerified = (incident) => {
    setLatestVerifiedIncident(incident);
    // If coordinates exist, select hotspot
    if (incident.coords) {
      setSelectedHotspot({
        name: incident.locationName,
        coords: incident.coords
      });
    }
  };

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

      {/* Navigation HUD */}
      <Navbar telemetrySummary={telemetry?.summary} />

      {/* Main Content Area */}
      <main className="relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* ===================== HERO CINEMATIC HEADER ===================== */}
        <section className="text-center py-16 sm:py-24 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono tracking-wider uppercase mb-6 transition-all shadow-lg"
               style={{
                 borderColor: isDrought ? 'rgba(255,69,0,0.4)' : 'rgba(0,229,255,0.4)',
                 backgroundColor: isDrought ? 'rgba(255,69,0,0.1)' : 'rgba(0,229,255,0.1)',
                 color: isDrought ? '#FF4500' : '#00E5FF'
               }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>OPERATIONAL SCADA PROTOCOL // DELHI-NCR HYDRO-TERRAIN</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-mono tracking-tight text-white mb-6 uppercase">
            HYDRO<span style={{ color: themeColors.primary }}>GRID</span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 font-sans leading-relaxed mb-10">
            Delhi-NCR oscillates between two deadly extremes: unshaded asphalt thermal traps reaching <strong className="text-orange-400 font-mono">49°C</strong> and flash monsoon cloudbursts paralyzing the city with <strong className="text-cyan-400 font-mono">2.8m underpass deluges</strong>. HydroGrid fuses real-time Sentinel-2 satellite indices, municipal SCADA nodes, and AI citizen verification into an interactive command matrix.
          </p>

          {/* Quick CTA cluster */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#matrix-map"
              className="px-6 py-3.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 shadow-2xl"
              style={{
                backgroundColor: themeColors.primary,
                color: '#05070B',
                boxShadow: `0 0 30px ${themeColors.primary}55`
              }}
            >
              <Compass className="w-4 h-4" />
              EXPLORE INTERACTIVE MAP MATRIX
            </a>

            <a
              href="#action-hub"
              className="px-6 py-3.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider border border-slate-700 bg-obsidian-850 hover:bg-slate-800 text-slate-200 transition-all flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              SUBMIT & AI-VERIFY HAZARD
            </a>

            <button
              onClick={toggleSeason}
              className="px-5 py-3.5 rounded-xl font-mono text-xs uppercase tracking-wider border border-slate-700 hover:border-slate-500 bg-obsidian-900/60 text-slate-400 hover:text-slate-200 transition-all flex items-center gap-2"
            >
              {isDrought ? <Flame className="w-4 h-4 text-orange-500" /> : <Droplets className="w-4 h-4 text-cyan-400" />}
              <span>TOGGLE TO {isDrought ? 'MONSOON FLOOD' : 'SUMMER DROUGHT'}</span>
            </button>
          </div>

          {/* Scroll down indicator */}
          <div className="mt-14 flex flex-col items-center gap-2 text-slate-500 text-xs font-mono">
            <span>SCROLL TO BEGIN ACT NARRATIVE</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-slate-400" />
          </div>
        </section>

        {/* ===================== SCROLLYTELLING ACTS ===================== */}
        <ScrollySection 
          onSelectHotspot={(hotspot) => setSelectedHotspot(hotspot)} 
        />

        {/* ===================== TELEMETRY HUD ===================== */}
        <section className="pt-8">
          <TelemetryHUD telemetryData={telemetry} />
        </section>

        {/* ===================== LEAFLET MATRIX MAP ===================== */}
        <section id="matrix-map" className="py-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-cyan-400 uppercase mb-1">
                <Layers className="w-4 h-4" />
                <span>GEOSPATIAL COMMAND // DELHI-NCR MATRIX</span>
              </div>
              <h2 className="text-3xl font-black font-mono text-white tracking-tight">
                REAL-TIME LEAFLET MAP & SATELLITE TILES
              </h2>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Center: <span className="text-cyan-300 font-bold">[28.6139, 77.2090]</span> // Sentinel-2 MSI Multi-Spectral Sync
            </div>
          </div>

          <HydroMap
            telemetryNodes={telemetry?.nodes}
            satelliteData={satelliteData}
            selectedHotspot={selectedHotspot}
            onSelectHotspot={(node) => setSelectedHotspot(node)}
          />
        </section>

        {/* ===================== ACTION HUB & REPORTING ===================== */}
        <section id="action-hub" className="py-12 scroll-mt-24">
          <ReportModule onIncidentVerified={handleIncidentVerified} />
        </section>

        {/* ===================== RWA LEADERBOARD ===================== */}
        <section id="leaderboard" className="py-8 scroll-mt-24">
          <Leaderboard newIncident={latestVerifiedIncident} />
        </section>

        {/* ===================== FOOTER & DIAGNOSTICS ===================== */}
        <footer className="mt-20 pt-8 border-t border-slate-800 text-xs font-mono text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>HYDROGRID SENTINEL // v1.0.0-DELHI-NCR</span>
            <span className="text-slate-600">|</span>
            <span>MUNICIPAL OPEN DATA FEED</span>
          </div>
          <div className="text-slate-500 text-center md:text-right">
            Satellite Telemetry: ESA Copernicus Sentinel-2 &bull; NASA FIRMS &bull; Delhi Jal Board SCADA
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <SeasonProvider>
      <HydroGridDashboard />
    </SeasonProvider>
  );
}

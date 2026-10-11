import React, { useState } from 'react';
import { useSeason } from '../context/SeasonContext';
import { useAuth } from '../context/AuthContext';
import ScrollyHero from '../components/hero/ScrollyHero';
import TelemetryHUD from '../components/TelemetryHUD';
import HydroMap from '../components/HydroMap';
import ScrollySection from '../components/ScrollySection';
import Leaderboard from '../components/Leaderboard';
import BrutalButton from '../components/ui/BrutalButton';
import BrutalBadge from '../components/ui/BrutalBadge';
import { 
  Compass, 
  Cpu, 
  Flame, 
  Droplets, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  ShieldAlert,
  Users
} from 'lucide-react';

export default function LandingPage({ telemetry, satelliteData, onNavigateTo }) {
  const { season, themeColors, toggleSeason } = useSeason();
  const { switchRole } = useAuth();
  const isDrought = season === 'drought';
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  return (
    <div className="w-full">
      {/* ================= 1. SCROLL-DRIVEN HERO CANVAS ================= */}
      <ScrollyHero />

      {/* ================= 2. QUICK LAUNCHER & COMMAND MATRIX ================= */}
      <div className="relative z-10 pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto blueprint-grid">
        <section className="text-center py-10 relative border-b-2 border-black mb-12">
          <div className="mb-4">
            <BrutalBadge variant={isDrought ? 'solar' : 'hydro'} icon={Sparkles}>
              OPERATIONAL SCADA PROTOCOL // DELHI-NCR HYDRO-TERRAIN
            </BrutalBadge>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-white mb-4 uppercase drop-shadow-md">
            GEOSPATIAL <span style={{ color: themeColors.primary }}>COMMAND MATRIX</span>
          </h2>

          <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-300 font-sans leading-relaxed mb-8">
            HydroGrid NCR fuses high-resolution Copernicus Sentinel-2 multispectral indices, 8 municipal SCADA sensor nodes, and AI citizen verification to combat Delhi's twin climate emergencies in real-time.
          </p>

          {/* Quick Dual-Role Launcher Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
            <div 
              onClick={() => { switchRole('citizen'); onNavigateTo?.('citizen'); }}
              className="brutal-card bg-obsidian-850 p-5 rounded-xl border-2 border-black hover:border-orange-400 cursor-pointer text-left group transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-orange-400 uppercase">PORTAL 01</span>
                <span className="text-xs text-slate-400 group-hover:translate-x-1 transition-transform">➔</span>
              </div>
              <h4 className="font-mono font-black text-white text-base uppercase mb-1">
                CITIZEN ACTION HUB
              </h4>
              <p className="text-xs font-mono text-slate-400">
                Capture EXIF-geotagged hazard photos, earn Civic Credits, and track municipal pump dispatch live.
              </p>
            </div>

            <div 
              onClick={() => { switchRole('authority'); onNavigateTo?.('authority'); }}
              className="brutal-card bg-obsidian-850 p-5 rounded-xl border-2 border-black hover:border-cyan-400 cursor-pointer text-left group transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase">PORTAL 02</span>
                <span className="text-xs text-slate-400 group-hover:translate-x-1 transition-transform">➔</span>
              </div>
              <h4 className="font-mono font-black text-white text-base uppercase mb-1">
                MCD AUTHORITY COMMAND
              </h4>
              <p className="text-xs font-mono text-slate-400">
                Filter crisis queues, deploy dewatering pumps to citizen GPS coordinates, and broadcast evacuation alerts.
              </p>
            </div>
          </div>

          {/* Action Button Cluster */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <BrutalButton
              variant={isDrought ? 'solar' : 'hydro'}
              size="md"
              icon={Compass}
              onClick={() => {
                const el = document.getElementById('matrix-map');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              EXPLORE LEAFLET MAP MATRIX
            </BrutalButton>

            <BrutalButton
              variant="dark"
              size="md"
              icon={isDrought ? Flame : Droplets}
              onClick={toggleSeason}
            >
              TOGGLE {isDrought ? 'MONSOON FLOOD' : 'SUMMER DROUGHT'}
            </BrutalButton>
          </div>
        </section>

        {/* ================= 3. SCROLLYTELLING ACTS ================= */}
        <ScrollySection 
          onSelectHotspot={(hotspot) => setSelectedHotspot(hotspot)} 
        />

        {/* ================= 4. TELEMETRY HUD ================= */}
        <section className="pt-6">
          <TelemetryHUD telemetryData={telemetry} />
        </section>

        {/* ================= 5. LEAFLET MATRIX MAP ================= */}
        <section id="matrix-map" className="py-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-bold">
                  GEOSPATIAL COMMAND // DELHI-NCR MATRIX
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight uppercase">
                REAL-TIME LEAFLET MAP & SATELLITE TILES
              </h2>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Center: <span className="text-cyan-300 font-bold">[28.6139, 77.2090]</span> // Sentinel-2 MSI Sync
            </div>
          </div>

          <HydroMap
            telemetryNodes={telemetry?.nodes}
            satelliteData={satelliteData}
            selectedHotspot={selectedHotspot}
            onSelectHotspot={(node) => setSelectedHotspot(node)}
          />
        </section>

        {/* ================= 6. RWA LEADERBOARD ================= */}
        <section id="leaderboard" className="py-8 scroll-mt-24">
          <Leaderboard />
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t-2 border-black text-xs font-mono text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>HYDROGRID SENTINEL // v2.0.0-DELHI-NCR DUAL-ROLE</span>
          </div>
          <div className="text-slate-500 text-center md:text-right">
            Satellite Telemetry: ESA Copernicus Sentinel-2 &bull; NASA FIRMS &bull; Delhi Jal Board SCADA
          </div>
        </footer>
      </div>
    </div>
  );
}

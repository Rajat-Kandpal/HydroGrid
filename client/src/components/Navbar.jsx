import React, { useState, useEffect } from 'react';
import { useSeason } from '../context/SeasonContext';
import { 
  Sun, 
  Droplets, 
  Volume2, 
  VolumeX, 
  Radio, 
  MapPin, 
  ShieldAlert, 
  Flame, 
  Activity,
  Compass
} from 'lucide-react';

export default function Navbar({ telemetrySummary }) {
  const { season, toggleSeason, themeColors, soundEnabled, setSoundEnabled, playSound } = useSeason();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDrought = season === 'drought';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-hud py-2.5 shadow-2xl' : 'bg-transparent py-4'}`}>
      {/* Real-time Emergency Ticker Bar */}
      <div className={`w-full text-xs font-mono py-1 px-4 border-b flex items-center justify-between overflow-hidden transition-colors ${
        isDrought 
          ? 'bg-solar-muted/30 border-solar/40 text-orange-200' 
          : 'bg-hydro-muted/30 border-hydro/40 text-cyan-200'
      }`}>
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDrought ? 'bg-orange-500' : 'bg-cyan-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isDrought ? 'bg-orange-600' : 'bg-cyan-500'}`}></span>
          </span>
          <span className="font-semibold tracking-wider uppercase text-[11px]">
            {isDrought ? 'CRITICAL HEATWAVE ALERT' : 'SURGE MONSOON INUNDATION'}
          </span>
          <span className="text-slate-400">|</span>
          <span className="truncate">
            {isDrought 
              ? `Thermal Trap Peak: ${telemetrySummary?.weather?.ambientTemp || '45.4'}°C // Heat Index: ${telemetrySummary?.weather?.heatIndex || '51.8'}°C // Groundwater: ${telemetrySummary?.hydroMetrics?.averageGroundwaterDepthM || '39.8'}m bgl` 
              : `Yamuna Gauge: ${telemetrySummary?.hydroMetrics?.yamunaWaterLevelM || '205.85'}m (Warning: 204.5m / Danger: 205.33m) // Active Waterlogging: ${telemetrySummary?.hydroMetrics?.activeWaterloggingPoints || '47'} Nodes`
            }
          </span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[10px] text-slate-400 flex-shrink-0">
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            TELEMETRY: ONLINE (10ms)
          </span>
          <span>COPERNICUS SENTINEL-2 SYNCED</span>
        </div>
      </div>

      {/* Main Navigation HUD */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand & Coordinates */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-300 ${
                isDrought 
                  ? 'bg-orange-950/40 border-solar text-solar group-hover:shadow-[0_0_15px_rgba(255,69,0,0.5)]' 
                  : 'bg-cyan-950/40 border-hydro text-hydro group-hover:shadow-[0_0_15px_rgba(0,229,255,0.5)]'
              }`}>
                {isDrought ? <Flame className="w-5 h-5" /> : <Droplets className="w-5 h-5" />}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-wider text-white font-mono flex items-center gap-1.5">
                  HYDROGRID
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    isDrought ? 'bg-solar/20 text-solar border border-solar/30' : 'bg-hydro/20 text-hydro border border-hydro/30'
                  }`}>
                    NCR
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-tight">
                  28.6139° N, 77.2090° E
                </span>
              </div>
            </a>
          </div>

          {/* Quick Nav Anchors */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-mono font-medium tracking-wide text-slate-300">
            <a href="#narrative" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              SCROLLYTELLING ACTS
            </a>
            <a href="#matrix-map" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              LEAFLET MATRIX MAP
            </a>
            <a href="#action-hub" className="hover:text-white transition-colors flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              AI REPORT HUB
            </a>
            <a href="#leaderboard" className="hover:text-white transition-colors flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              RWA LEADERBOARD
            </a>
          </nav>

          {/* Controls: Audio Toggle & Season Mode Switch */}
          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playSound('beep');
              }}
              className={`p-2 rounded-lg border transition-all ${
                soundEnabled 
                  ? (isDrought ? 'bg-solar/20 border-solar text-solar' : 'bg-hydro/20 border-hydro text-hydro')
                  : 'bg-obsidian-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
              title={soundEnabled ? "Mute Atmospheric Audio FX" : "Enable Cybernetic Audio FX"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Dynamic Season Toggle Switch */}
            <button
              onClick={toggleSeason}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider transition-all duration-500 ${
                isDrought 
                  ? 'bg-gradient-to-r from-orange-950/70 to-red-950/70 border-solar text-solar shadow-[0_0_20px_rgba(255,69,0,0.3)] hover:border-orange-400' 
                  : 'bg-gradient-to-r from-cyan-950/70 to-blue-950/70 border-hydro text-hydro shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:border-cyan-400'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isDrought ? (
                  <>
                    <Sun className="w-4 h-4 animate-spin text-solar" style={{ animationDuration: '10s' }} />
                    <span>SUMMER DROUGHT</span>
                  </>
                ) : (
                  <>
                    <Droplets className="w-4 h-4 animate-bounce text-hydro" />
                    <span>MONSOON FLOOD</span>
                  </>
                )}
              </div>
              <span className="text-[10px] uppercase opacity-75 font-normal ml-1 hidden sm:inline">
                (SWITCH)
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

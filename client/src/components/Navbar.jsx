import React, { useState, useEffect } from 'react';
import { useSeason } from '../context/SeasonContext';
import { useAuth } from '../context/AuthContext';
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
  Compass,
  Bell,
  User,
  Shield,
  Layers,
  ChevronDown
} from 'lucide-react';
import BrutalBadge from './ui/BrutalBadge';

export default function Navbar({ telemetrySummary, activeView, onNavigate }) {
  const { season, toggleSeason, soundEnabled, setSoundEnabled, playSound } = useSeason();
  const { role, switchRole, broadcastAlerts, unreadAlertsCount, markAlertsRead } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDrought = season === 'drought';

  const handleSelectRole = (newRole) => {
    playSound?.('beep');
    switchRole(newRole);
    setRoleMenuOpen(false);
    if (onNavigate) onNavigate(newRole);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Real-time Emergency Ticker Bar */}
      <div className={`w-full text-xs font-mono py-1 px-4 border-b-2 border-black flex items-center justify-between overflow-hidden transition-colors ${
        isDrought 
          ? 'bg-solar-muted/40 text-orange-200' 
          : 'bg-hydro-muted/40 text-cyan-200'
      }`}>
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDrought ? 'bg-orange-500' : 'bg-cyan-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isDrought ? 'bg-orange-600' : 'bg-cyan-500'}`}></span>
          </span>
          <span className="font-black tracking-wider uppercase text-[11px]">
            {isDrought ? 'CRITICAL HEATWAVE ALERT' : 'SURGE MONSOON INUNDATION'}
          </span>
          <span className="text-slate-400">|</span>
          <span className="truncate">
            {isDrought 
              ? `Thermal Trap Peak: ${telemetrySummary?.weather?.ambientTemp || '45.4'}°C // Heat Index: ${telemetrySummary?.weather?.heatIndex || '51.8'}°C // Groundwater: ${telemetrySummary?.hydroMetrics?.averageGroundwaterDepthM || '39.8'}m bgl` 
              : `Yamuna Gauge: ${telemetrySummary?.hydroMetrics?.yamunaWaterLevelM || '205.85'}m (Danger Mark: 205.33m) // Waterlogging Sumps: ${telemetrySummary?.hydroMetrics?.activeWaterloggingPoints || '47'} Nodes`
            }
          </span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[10px] text-slate-300 flex-shrink-0">
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            TELEMETRY: ONLINE (10ms)
          </span>
          <span>SENTINEL-2 MSI SYNCED</span>
        </div>
      </div>

      {/* Main Navigation HUD */}
      <div className={`w-full transition-all duration-200 ${scrolled ? 'glass-hud py-2.5 shadow-2xl bg-obsidian-950/90' : 'bg-obsidian-950/80 py-3.5 backdrop-blur-md border-b-2 border-black'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand & Home click */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleSelectRole('guest')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_#000] transition-transform group-hover:scale-105 ${
                isDrought ? 'bg-orange-500 text-black' : 'bg-cyan-400 text-black'
              }`}>
                {isDrought ? <Flame className="w-5 h-5" /> : <Droplets className="w-5 h-5" />}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-wider text-white font-mono flex items-center gap-1.5">
                  HYDROGRID
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-black border border-black shadow-[2px_2px_0px_#000] ${
                    isDrought ? 'bg-orange-500 text-black' : 'bg-cyan-400 text-black'
                  }`}>
                    NCR
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-tight">
                  28.6139° N, 77.2090° E
                </span>
              </div>
            </button>
          </div>

          {/* Role Navigation Switcher Pills */}
          <div className="hidden md:flex items-center bg-black/60 p-1 rounded-xl border-2 border-black text-xs font-mono shadow-[3px_3px_0px_#000]">
            <button
              onClick={() => handleSelectRole('guest')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold ${
                role === 'guest'
                  ? 'bg-slate-700 text-white shadow-[2px_2px_0px_#000]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PUBLIC MATRIX
            </button>
            <button
              onClick={() => handleSelectRole('citizen')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold ${
                role === 'citizen'
                  ? 'bg-orange-500 text-black border border-black shadow-[2px_2px_0px_#000]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              CITIZEN PORTAL
            </button>
            <button
              onClick={() => handleSelectRole('authority')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold ${
                role === 'authority'
                  ? 'bg-cyan-400 text-black border border-black shadow-[2px_2px_0px_#000]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              AUTHORITY COMMAND
            </button>
          </div>

          {/* Right Controls: Broadcast Bell, Audio, Season Toggle, Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Emergency Broadcast Bell with Unread Badge */}
            <button
              onClick={() => {
                setShowAlertModal(!showAlertModal);
                markAlertsRead();
                playSound?.('beep');
              }}
              className="relative p-2 rounded-lg bg-obsidian-900 border-2 border-black text-slate-300 hover:text-white shadow-[3px_3px_0px_#000] transition-transform active:translate-y-0.5"
              title="Emergency Municipal Broadcasts"
            >
              <Bell className="w-4 h-4 text-red-400" />
              {broadcastAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 border border-black text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {broadcastAlerts.length}
                </span>
              )}
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playSound?.('beep');
              }}
              className={`p-2 rounded-lg border-2 border-black transition-all shadow-[3px_3px_0px_#000] ${
                soundEnabled 
                  ? (isDrought ? 'bg-orange-500 text-black font-bold' : 'bg-cyan-400 text-black font-bold')
                  : 'bg-obsidian-900 text-slate-400 hover:text-white'
              }`}
              title={soundEnabled ? "Mute Atmospheric Soundscape" : "Enable Atmospheric Soundscape"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Dynamic Season Toggle Switch */}
            <button
              onClick={toggleSeason}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-black text-xs font-mono font-black uppercase transition-all shadow-[3px_3px_0px_#000] ${
                isDrought 
                  ? 'bg-orange-500 text-black hover:bg-orange-400' 
                  : 'bg-cyan-400 text-black hover:bg-cyan-300'
              }`}
            >
              {isDrought ? <Sun className="w-3.5 h-3.5 animate-spin" /> : <Droplets className="w-3.5 h-3.5 animate-bounce" />}
              <span className="hidden sm:inline">{isDrought ? 'DROUGHT' : 'MONSOON'}</span>
            </button>

            {/* Mobile Role Switcher Dropdown */}
            <div className="relative md:hidden">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="p-2 rounded-lg bg-obsidian-900 border-2 border-black text-slate-300 shadow-[3px_3px_0px_#000]"
              >
                <User className="w-4 h-4" />
              </button>
              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-obsidian-900 border-2 border-black rounded-xl p-2 shadow-[6px_6px_0px_#000] font-mono text-xs z-50">
                  <button 
                    onClick={() => handleSelectRole('guest')} 
                    className="w-full text-left p-2 rounded hover:bg-slate-800 text-slate-200"
                  >
                    Public Matrix
                  </button>
                  <button 
                    onClick={() => handleSelectRole('citizen')} 
                    className="w-full text-left p-2 rounded hover:bg-slate-800 text-orange-400 font-bold"
                  >
                    Citizen Portal
                  </button>
                  <button 
                    onClick={() => handleSelectRole('authority')} 
                    className="w-full text-left p-2 rounded hover:bg-slate-800 text-cyan-400 font-bold"
                  >
                    Authority Command
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Emergency Alerts Popover Dropdown */}
      {showAlertModal && (
        <div className="max-w-2xl mx-auto px-4 mt-2">
          <div className="bg-obsidian-900/95 border-2 border-red-500 rounded-xl p-4 shadow-[6px_6px_0px_#000] font-mono text-xs animate-fade-in backdrop-blur-xl">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-red-500/40">
              <span className="text-red-400 font-black uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                ACTIVE EMERGENCY BROADCASTS ({broadcastAlerts.length})
              </span>
              <button 
                onClick={() => setShowAlertModal(false)}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                CLOSE [✕]
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {broadcastAlerts.map(alert => (
                <div key={alert.id} className="bg-black/60 p-3 rounded-lg border border-red-500/30">
                  <div className="font-bold text-red-300 text-xs mb-1">{alert.headline}</div>
                  <p className="text-slate-300 text-[11px] mb-2">{alert.message}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{new Date(alert.issuedAt).toLocaleTimeString()}</span>
                    <span className="text-amber-400 font-bold">{alert.actionInstructions}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

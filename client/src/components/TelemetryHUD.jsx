import React from 'react';
import { useSeason } from '../context/SeasonContext';
import { 
  Gauge, 
  Activity, 
  Droplet, 
  Thermometer, 
  Truck, 
  Waves, 
  ShieldAlert, 
  CloudRain,
  Radio
} from 'lucide-react';

export default function TelemetryHUD({ telemetryData }) {
  const { season, themeColors } = useSeason();
  const isDrought = season === 'drought';

  const summary = telemetryData?.summary;
  const weather = summary?.weather;
  const hydro = summary?.hydroMetrics;

  const yamunaLevel = hydro?.yamunaWaterLevelM || 205.85;
  const dangerMark = hydro?.yamunaDangerMarkM || 205.33;
  const yamunaSurgeDelta = (yamunaLevel - dangerMark).toFixed(2);
  const isBreached = yamunaLevel >= dangerMark;

  return (
    <div className="w-full glass-panel rounded-2xl border border-obsidian-border p-6 mb-12">
      {/* Top HUD Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-mono tracking-widest text-slate-300 uppercase">
            LIVE MUNICIPAL SCADA MATRIX // REAL-TIME TELEMETRY FEED
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            TELEMETRY JITTER ENGINE: ACTIVE
          </span>
          <span>LAST UPDATE: {new Date(summary?.timestamp || Date.now()).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Main Gauges Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gauge 1: Yamuna River Surge Gauge */}
        <div className="bg-obsidian-850/90 rounded-xl p-4 border border-slate-800 font-mono relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-cyan-400" />
              YAMUNA GAUGE
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              isBreached && !isDrought ? 'bg-red-950 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              {isDrought ? 'RIVERBED LOW' : 'DANGER MARK'}
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl sm:text-3xl font-black text-cyan-300">
              {yamunaLevel}
            </span>
            <span className="text-sm text-slate-400">m</span>
          </div>

          {/* Gauge Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full my-2 overflow-hidden relative">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${
                isBreached && !isDrought ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(10, ((yamunaLevel - 200) / 10) * 100))}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Danger: 205.33m</span>
            <span className={isBreached && !isDrought ? 'text-red-400 font-bold' : 'text-slate-400'}>
              {!isDrought && isBreached ? `+${yamunaSurgeDelta}m Breach` : 'Within Envelope'}
            </span>
          </div>
        </div>

        {/* Gauge 2: Heat Index & Ambient Thermal Peak */}
        <div className="bg-obsidian-850/90 rounded-xl p-4 border border-slate-800 font-mono relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-orange-400" />
              HEAT INDEX
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-500/30">
              {isDrought ? 'CRITICAL PEAK' : 'HIGH HUMIDITY'}
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl sm:text-3xl font-black text-orange-400">
              {weather?.heatIndex || 46.2}
            </span>
            <span className="text-sm text-slate-400">°C</span>
          </div>

          {/* Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full my-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-red-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, ((weather?.heatIndex || 45) / 55) * 100)}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Ambient: {weather?.ambientTemp || 42}°C</span>
            <span>Humidity: {weather?.relativeHumidityPct || 40}%</span>
          </div>
        </div>

        {/* Gauge 3: Groundwater Aquifer Depth */}
        <div className="bg-obsidian-850/90 rounded-xl p-4 border border-slate-800 font-mono relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-purple-400" />
              GROUNDWATER TABLE
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-500/30">
              OVER-EXPLOITED
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl sm:text-3xl font-black text-purple-300">
              {hydro?.averageGroundwaterDepthM || 39.8}
            </span>
            <span className="text-sm text-slate-400">m bgl</span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full my-2 overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, ((hydro?.averageGroundwaterDepthM || 39) / 50) * 100)}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Critical Threshold: 30m</span>
            <span className="text-purple-400 font-bold">-1.8m Annual Deficit</span>
          </div>
        </div>

        {/* Gauge 4: Active Emergency Tankers / Waterlogging Points */}
        <div className="bg-obsidian-850/90 rounded-xl p-4 border border-slate-800 font-mono relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              {isDrought ? <Truck className="w-4 h-4 text-amber-400" /> : <CloudRain className="w-4 h-4 text-blue-400" />}
              {isDrought ? 'TANKER FLEET DISPATCH' : 'WATERLOGGING SUMPS'}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              isDrought ? 'bg-amber-950 text-amber-400 border border-amber-500/30' : 'bg-blue-950 text-blue-400 border border-blue-500/30'
            }`}>
              {isDrought ? 'ACTIVE DEPLOYMENT' : 'SUBMERGED NODES'}
            </span>
          </div>

          <div className="flex items-baseline gap-1 my-1">
            <span className={`text-2xl sm:text-3xl font-black ${isDrought ? 'text-amber-400' : 'text-blue-300'}`}>
              {isDrought ? hydro?.dispatchedEmergencyTankers || 418 : hydro?.activeWaterloggingPoints || 47}
            </span>
            <span className="text-sm text-slate-400">{isDrought ? 'vehicles' : 'hotspots'}</span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full my-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${isDrought ? 'bg-amber-500' : 'bg-blue-500'}`}
              style={{ width: isDrought ? '84%' : '68%' }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>{isDrought ? 'DJB Tanker Grid' : 'Choked Drains: ' + (hydro?.chokedDrainageSegments || 312)}</span>
            <span className="text-emerald-400 font-bold">100% Monitored</span>
          </div>
        </div>
      </div>
    </div>
  );
}

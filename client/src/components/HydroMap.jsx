import React, { useState, useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polygon, 
  Polyline, 
  Tooltip,  
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { useSeason } from '../context/SeasonContext';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Zap, 
  Thermometer, 
  Droplet, 
  Truck, 
  Maximize2, 
  Crosshair,
  AlertTriangle,
  Info
} from 'lucide-react';

// Fix default Leaflet icon paths in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom animated pulsing SVG icons for Leaflet
const createPulsingIcon = (color, isCritical) => {
  return L.divIcon({
    className: 'custom-pulse-marker',
    html: `
      <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${color};
          opacity: 0.35;
          animation: ${isCritical ? 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' : 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite'};
        "></div>
        <div style="
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid #ffffff;
          box-shadow: 0 0 10px ${color}, 0 0 20px ${color};
          z-index: 10;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

// Component to programmatically re-center or fly to coordinates
function MapController({ targetCenter, targetZoom }) {
  const map = useMap();
  useEffect(() => {
    if (targetCenter) {
      map.flyTo(targetCenter, targetZoom || 13, {
        duration: 1.8,
        easeLinearity: 0.25
      });
    }
  }, [targetCenter, targetZoom, map]);
  return null;
}

export default function HydroMap({ telemetryNodes, satelliteData, selectedHotspot, onSelectHotspot }) {
  const { season, themeColors, playSound } = useSeason();
  const isDrought = season === 'drought';

  // Layer visibility toggles
  const [showSensors, setShowSensors] = useState(true);
  const [showNdvi, setShowNdvi] = useState(true);
  const [showFloodZones, setShowFloodZones] = useState(true);
  const [showDrainageLines, setShowDrainageLines] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(0.65);

  // Active fly-to position
  const [flyTarget, setFlyTarget] = useState(null);

  // Pre-configured Delhi hotspot coordinates for quick jump
  const quickHotspots = [
    { name: "Minto Bridge", coords: [28.6328, 77.2223], zoom: 15, tag: "Waterlogging Epicenter" },
    { name: "Karol Bagh", coords: [28.6517, 77.1906], zoom: 15, tag: "Thermal Heat Island" },
    { name: "Yamuna Loha Pul", coords: [28.6644, 77.2485], zoom: 14, tag: "River Gauge 205.8m" },
    { name: "Okhla Depot", coords: [28.5355, 77.2715], zoom: 14, tag: "Tanker Logistics" },
    { name: "Najafgarh Drain", coords: [28.6821, 77.1215], zoom: 13, tag: "57km Silt Artery" },
  ];

  const handleFlyTo = (coords, zoom = 14) => {
    playSound('beep');
    setFlyTarget({ coords, zoom, timestamp: Date.now() });
  };

  // Synchronize when parent passes selected hotspot
  useEffect(() => {
    if (selectedHotspot && selectedHotspot.coords) {
      handleFlyTo(selectedHotspot.coords, 15);
    }
  }, [selectedHotspot]);

  // Determine marker color depending on node and seasonal mode
  const getNodeColor = (node) => {
    if (node.type === 'heat_island') return '#FF4500';
    if (node.type === 'drainage_inundation') return '#00E5FF';
    if (node.type === 'river_gauge') return '#0077FF';
    if (node.type === 'tanker_logistics') return '#FFA500';
    if (node.type === 'green_sanctuary') return '#00FF66';
    if (node.type === 'groundwater_sensor') return '#D946EF';
    return isDrought ? '#FF4500' : '#00E5FF';
  };

  return (
    <div className="relative w-full h-[680px] lg:h-[750px] rounded-2xl overflow-hidden border border-obsidian-border shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-[#05070B]">
      {/* Top Map HUD Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-wrap gap-2 pointer-events-auto">
        <div className="glass-panel px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-mono border border-white/10 shadow-lg">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200 uppercase tracking-wider">LAYERS:</span>
          
          <button
            onClick={() => setShowSensors(!showSensors)}
            className={`px-2 py-1 rounded text-[11px] transition-all ${
              showSensors ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sensors {showSensors ? '✓' : ''}
          </button>
          
          <button
            onClick={() => setShowNdvi(!showNdvi)}
            className={`px-2 py-1 rounded text-[11px] transition-all ${
              showNdvi ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            NDVI Sentinel {showNdvi ? '✓' : ''}
          </button>

          <button
            onClick={() => setShowFloodZones(!showFloodZones)}
            className={`px-2 py-1 rounded text-[11px] transition-all ${
              showFloodZones ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Water Accumulation {showFloodZones ? '✓' : ''}
          </button>

          <button
            onClick={() => setShowDrainageLines(!showDrainageLines)}
            className={`px-2 py-1 rounded text-[11px] transition-all ${
              showDrainageLines ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Drainage Grid {showDrainageLines ? '✓' : ''}
          </button>
        </div>

        {/* Opacity Slider */}
        <div className="hidden sm:flex glass-panel px-3 py-2 rounded-xl items-center gap-2 text-xs font-mono border border-white/10">
          <span className="text-slate-400 text-[10px]">OVERLAY OPACITY:</span>
          <input
            type="range"
            min="0.2"
            max="0.95"
            step="0.05"
            value={overlayOpacity}
            onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
            className="w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-slate-300 text-[10px] w-7">{Math.round(overlayOpacity * 100)}%</span>
        </div>
      </div>

      {/* Fly-to Hotspot Strip (Right Side) */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
        <div className="glass-panel px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-slate-400 tracking-wider uppercase border border-white/10 flex items-center gap-1.5">
          <Crosshair className="w-3 h-3 text-cyan-400" />
          <span>GRID JUMP</span>
        </div>
        {quickHotspots.map((spot, i) => (
          <button
            key={i}
            onClick={() => handleFlyTo(spot.coords, spot.zoom)}
            className="glass-card hover:bg-slate-800/80 px-2.5 py-1.5 rounded-lg text-left text-xs font-mono transition-all border border-white/5 hover:border-cyan-400/50 flex flex-col group"
          >
            <span className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
              {spot.name}
            </span>
            <span className="text-[9px] text-slate-400">
              {spot.tag}
            </span>
          </button>
        ))}
      </div>

      {/* Main Map Container */}
      <MapContainer
        center={[28.6139, 77.2090]}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={false}
      >
        <MapController targetCenter={flyTarget?.coords} targetZoom={flyTarget?.zoom} />

        {/* OpenStreetMap with Dark Mode CSS Filter (No API Key Required) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          className="map-tiles-dark"
        />

        {/* 1. Simulated NASA/Sentinel-2 NDVI Vegetation Canopy Layer */}
        {showNdvi && satelliteData?.ndviZones?.map((zone, idx) => (
          <Polygon
            key={`ndvi-${idx}`}
            positions={zone.coordinates}
            pathOptions={{
              color: zone.color,
              weight: 2,
              fillColor: zone.color,
              fillOpacity: overlayOpacity * (zone.type === 'High_NDVI' ? 0.45 : 0.6),
              dashArray: zone.type === 'High_NDVI' ? '4, 4' : null
            }}
          >
            <Tooltip sticky className="font-mono text-xs">
              <div className="font-bold">{zone.name}</div>
              <div>NDVI Value: <span className="text-emerald-400 font-mono">{zone.ndviValue}</span></div>
              <div className="text-[10px] text-slate-300">
                {zone.type === 'High_NDVI' ? 'Dense Biomass / Cooler Microclimate' : 'Severe Heat Island / Concrete Asphyxiation'}
              </div>
            </Tooltip>
          </Polygon>
        ))}

        {/* 2. Simulated Surface Water Accumulation & Flood Inundation Grids */}
        {showFloodZones && satelliteData?.floodRiskZones?.map((risk, idx) => (
          <Polygon
            key={`flood-${idx}`}
            positions={risk.coordinates}
            pathOptions={{
              color: risk.color,
              weight: 2,
              fillColor: risk.color,
              fillOpacity: overlayOpacity * 0.55
            }}
          >
            <Tooltip sticky className="font-mono text-xs">
              <div className="font-bold text-cyan-300">{risk.name}</div>
              <div>Severity: <span className="text-red-400 font-mono">{risk.severity}</span></div>
              <div>Est. Water Depth: <span className="font-mono text-cyan-200">{risk.depthEstimatedM} meters</span></div>
            </Tooltip>
          </Polygon>
        ))}

        {/* 3. Drainage Grid Vectors (Najafgarh & Barapullah Trunks) */}
        {showDrainageLines && satelliteData?.drainageArteries?.map((artery, idx) => (
          <Polyline
            key={`drainage-${idx}`}
            positions={artery.path}
            pathOptions={{
              color: '#A855F7',
              weight: 4,
              dashArray: '6, 8',
              opacity: overlayOpacity * 0.9
            }}
          >
            <Tooltip sticky className="font-mono text-xs">
              <div className="font-bold text-purple-300">{artery.name}</div>
              <div>Discharge Volume: {artery.dischargePct}%</div>
              <div>Flow Status: {artery.status}</div>
            </Tooltip>
          </Polyline>
        ))}

        {/* 4. Municipal Telemetry Nodes & Pulsing Beacon Markers */}
        {showSensors && telemetryNodes?.map((node) => {
          const markerColor = getNodeColor(node);
          const isCritical = node.status?.includes('CRITICAL') || node.status?.includes('EMERGENCY') || node.status?.includes('SEVERE');
          const pulseIcon = createPulsingIcon(markerColor, isCritical);

          return (
            <Marker
              key={node.id}
              position={node.coords}
              icon={pulseIcon}
              eventHandlers={{
                click: () => {
                  playSound('beep');
                  if (onSelectHotspot) onSelectHotspot(node);
                }
              }}
            >
              <Popup>
                <div className="p-4 w-72 text-slate-100 font-sans">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60">
                    <div>
                      <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                        {node.id} // {node.zone}
                      </span>
                      <h4 className="text-sm font-bold text-white tracking-wide">
                        {node.name}
                      </h4>
                    </div>
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight uppercase"
                      style={{ 
                        backgroundColor: `${markerColor}22`, 
                        color: markerColor, 
                        border: `1px solid ${markerColor}44` 
                      }}
                    >
                      {node.status}
                    </span>
                  </div>

                  {/* Dynamic Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 my-3 text-xs font-mono">
                    {node.metrics.waterLevelCm !== undefined && (
                      <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">WATER DEPTH</span>
                        <span className="text-base font-bold text-cyan-300">
                          {node.metrics.waterLevelCm} <span className="text-xs font-normal">cm</span>
                        </span>
                      </div>
                    )}

                    {node.metrics.surfaceTempC !== undefined && (
                      <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">SURFACE TEMP</span>
                        <span className="text-base font-bold text-orange-400">
                          {node.metrics.surfaceTempC} <span className="text-xs font-normal">°C</span>
                        </span>
                      </div>
                    )}

                    {node.metrics.waterLevelM !== undefined && (
                      <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">RIVER LEVEL</span>
                        <span className="text-base font-bold text-blue-300">
                          {node.metrics.waterLevelM} <span className="text-xs font-normal">m</span>
                        </span>
                      </div>
                    )}

                    {node.metrics.drainCapacityPct !== undefined && (
                      <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">DRAIN CAPACITY</span>
                        <span className={`text-base font-bold ${node.metrics.drainCapacityPct < 30 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {node.metrics.drainCapacityPct}%
                        </span>
                      </div>
                    )}

                    {node.metrics.activeTankers !== undefined && (
                      <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">TANKERS ACTIVE</span>
                        <span className="text-base font-bold text-amber-300">
                          {node.metrics.activeTankers} <span className="text-xs font-normal">Fleet</span>
                        </span>
                      </div>
                    )}

                    {node.metrics.groundwaterDepthM !== undefined && (
                      <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">AQUIFER DEPTH</span>
                        <span className="text-base font-bold text-purple-300">
                          {node.metrics.groundwaterDepthM} <span className="text-xs font-normal">m bgl</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer telemetry status */}
                  <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                    <span>RISK: <strong className="text-slate-200">{node.metrics.riskLevel || 'Nominal'}</strong></span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      SCADA SYNCED
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] glass-panel px-3 py-2 rounded-xl border border-white/10 text-xs font-mono pointer-events-auto flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[10px] uppercase">NDVI SCALE:</span>
          <div className="w-20 h-2 rounded bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-500"></div>
          <span className="text-[9px] text-slate-400">0.0 (Concrete) → 0.8 (Canopy)</span>
        </div>
        <div className="h-3 w-px bg-slate-700"></div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-[0_0_8px_#00E5FF]"></span>
          <span className="text-[10px] text-cyan-200">Inundation Sump</span>
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block shadow-[0_0_8px_#FF4500]"></span>
          <span className="text-[10px] text-orange-200">Thermal Trap</span>
        </div>
      </div>
    </div>
  );
}

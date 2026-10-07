import React from 'react';
import { motion } from 'framer-motion';
import { useSeason } from '../context/SeasonContext';
import { 
  Flame, 
  Droplets, 
  AlertOctagon, 
  ArrowRight, 
  Compass, 
  Layers, 
  ShieldAlert, 
  Gauge,
  Sun,
  CloudRain
} from 'lucide-react';

export default function ScrollySection({ onSelectHotspot }) {
  const { season, toggleSeason, playSound } = useSeason();
  const isDrought = season === 'drought';

  const acts = [
    {
      actNumber: "ACT I",
      tag: "THE URBAN ANATOMY",
      title: "Delhi-NCR: The Bipolar Climate Grid",
      subtitle: "From 49.2°C Thermal Traps to 100mm/hr Inundation Paralysis",
      description: 
        "Delhi-NCR is one of the world's most vulnerable inland megacities. Trapped between the arid Thar Desert fringes and the erratic monsoon trough of the Indo-Gangetic plain, 33 million citizens swing between fatal thermal dehydration in May and catastrophic urban drowning in July. HydroGrid transforms isolated civic data into a unified, synchronized command matrix.",
      seasonFocus: "all",
      metrics: [
        { label: "Summer Peak Recorded", value: "49.9°C", detail: "Mungeshpur AWS, 2024" },
        { label: "Yamuna Historical High", value: "208.66m", detail: "Exceeded 1978 Record" },
        { label: "Groundwater Depletion", value: "-1.8m/yr", detail: "Over-exploited blocks: 82%" },
        { label: "Stormwater Outfalls", value: "2,840+", detail: "Natural culverts disrupted: 64%" }
      ],
      hotspots: [
        { name: "Inspect Central Delhi", coords: [28.6328, 77.2223], zoom: 14 }
      ]
    },
    {
      actNumber: "ACT II",
      tag: "THERMAL ASPHYXIATION // DROUGHT MATRIX",
      title: "Heat Islands: Concrete Asphyxiation & The Tanker Scramble",
      subtitle: "Karol Bagh, Sadar Bazar, and the 40-Meter Groundwater Plunge",
      description: 
        "During the dry pre-monsoon scorching months, dense commercial hubs turn into solar ovens. High-albedo asphalt and dense concrete absorb shortwave radiation, radiating surface temperatures up to 52°C. With the local water table falling beyond 40 meters below ground level, over 400 municipal tankers scramble daily to supply vulnerable informal settlements.",
      seasonFocus: "drought",
      metrics: [
        { label: "Surface Asphalt Radiance", value: "51.4°C", detail: "Karol Bagh corridor" },
        { label: "NDVI Vegetation Deficit", value: "0.08", detail: "Near-zero biomass buffer" },
        { label: "Active Tanker Dispatches", value: "418 Fleet", detail: "Okhla & Mehrauli sectors" },
        { label: "Wet Bulb Stress Index", value: "32.1°C", detail: "Critical human threshold" }
      ],
      hotspots: [
        { name: "Karol Bagh Basin", coords: [28.6517, 77.1906], zoom: 15 },
        { name: "Okhla Tanker Depot", coords: [28.5355, 77.2715], zoom: 14 },
        { name: "Central Ridge Oasis", coords: [28.5921, 77.1605], zoom: 14 }
      ]
    },
    {
      actNumber: "ACT III",
      tag: "THE CHOKED GRIDS // MONSOON MATRIX",
      title: "Monsoon Deluge: Silted Trunks & The Minto Trap",
      subtitle: "Najafgarh Drain, Barapullah Confluence & River Surge",
      description: 
        "When the monsoon hits, Delhi's compromised natural hydrology strikes back. The 57km Najafgarh Trunk Drain—carrying over 60% of the capital's wastewater—is choked with municipal plastic and silt. Historical culverts like Minto Bridge become sunken traps within 20 minutes of intense cloudbursts, while Yamuna river levels surge past the 205.33m Danger Mark.",
      seasonFocus: "flood",
      metrics: [
        { label: "Minto Inundation Depth", value: "2.8m", detail: "Underpass sump overflow" },
        { label: "Najafgarh Drain Silt Load", value: "76%", detail: "Discharge velocity impeded" },
        { label: "Yamuna Danger Mark", value: "205.33m", detail: "Discharge > 180,000 cusecs" },
        { label: "Submerged Hotspots", value: "47 Nodes", detail: "Real-time sensor alerts" }
      ],
      hotspots: [
        { name: "Minto Bridge Underpass", coords: [28.6328, 77.2223], zoom: 15 },
        { name: "Yamuna Old Railway Bridge", coords: [28.6644, 77.2485], zoom: 14 },
        { name: "Najafgarh Drain Outfall", coords: [28.6821, 77.1215], zoom: 13 }
      ]
    }
  ];

  return (
    <div id="narrative" className="w-full space-y-16 py-12">
      {acts.map((act, index) => {
        const isActActiveSeason = act.seasonFocus === 'all' || act.seasonFocus === season;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className={`glass-panel rounded-2xl border p-8 lg:p-10 relative overflow-hidden transition-all duration-500 ${
              isActActiveSeason 
                ? (isDrought ? 'border-solar/40 shadow-[0_0_40px_rgba(255,69,0,0.1)]' : 'border-hydro/40 shadow-[0_0_40px_rgba(0,229,255,0.1)]') 
                : 'border-slate-800 opacity-80'
            }`}
          >
            {/* Act Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold tracking-widest ${
                  act.seasonFocus === 'drought' 
                    ? 'bg-solar/20 text-solar border border-solar/40' 
                    : act.seasonFocus === 'flood'
                      ? 'bg-hydro/20 text-hydro border border-hydro/40'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                }`}>
                  {act.actNumber}
                </span>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                  {act.tag}
                </span>
              </div>

              {act.seasonFocus !== 'all' && (
                <button
                  onClick={() => {
                    if (season !== act.seasonFocus) toggleSeason();
                  }}
                  className={`text-xs font-mono px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                    season === act.seasonFocus
                      ? (isDrought ? 'bg-solar/20 border-solar text-solar font-bold' : 'bg-hydro/20 border-hydro text-hydro font-bold')
                      : 'border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {act.seasonFocus === 'drought' ? <Sun className="w-3.5 h-3.5 text-solar" /> : <CloudRain className="w-3.5 h-3.5 text-hydro" />}
                  <span>{season === act.seasonFocus ? 'ACTIVE MODE' : `SWITCH TO ${act.seasonFocus.toUpperCase()}`}</span>
                </button>
              )}
            </div>

            {/* Act Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Narrative Story (7 cols) */}
              <div className="lg:col-span-7">
                <h2 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight mb-2">
                  {act.title}
                </h2>
                <h4 className="text-sm font-semibold text-slate-300 font-mono mb-4">
                  {act.subtitle}
                </h4>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-sans">
                  {act.description}
                </p>

                {/* Hotspot fly buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs font-mono text-slate-400 mr-2 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    JUMP TO TELEMETRY:
                  </span>
                  {act.hotspots.map((spot, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        playSound('beep');
                        if (onSelectHotspot) onSelectHotspot(spot);
                        const mapElem = document.getElementById('matrix-map');
                        if (mapElem) mapElem.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-obsidian-850 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 hover:text-white transition-all flex items-center gap-1.5 group"
                    >
                      <span>{spot.name}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Telemetry Cards (5 cols) */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                {act.metrics.map((m, mIdx) => (
                  <div
                    key={mIdx}
                    className="bg-obsidian-850/80 p-4 rounded-xl border border-slate-800 font-mono hover:border-slate-700 transition-colors"
                  >
                    <span className="text-[11px] text-slate-400 block mb-1">
                      {m.label}
                    </span>
                    <span className={`text-xl sm:text-2xl font-black tracking-tight block ${
                      act.seasonFocus === 'drought' ? 'text-orange-400' :
                      act.seasonFocus === 'flood' ? 'text-cyan-400' : 'text-slate-100'
                    }`}>
                      {m.value}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {m.detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

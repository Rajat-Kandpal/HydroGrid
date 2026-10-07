import React, { useState, useRef } from 'react';
import { useSeason } from '../context/SeasonContext';
import { verifyIncident } from '../services/api';
import confetti from 'canvas-confetti';
import { 
  UploadCloud, 
  Camera, 
  Cpu, 
  ShieldCheck, 
  MapPin, 
  AlertTriangle, 
  FileCheck2, 
  Terminal, 
  CheckCircle2, 
  Sparkles,
  RefreshCw,
  Copy,
  ExternalLink
} from 'lucide-react';

const DELHI_HOTSPOTS = [
  { name: "Minto Bridge Underpass", lat: 28.6328, lng: 77.2223 },
  { name: "Karol Bagh Market", lat: 28.6517, lng: 77.1906 },
  { name: "Okhla Phase II Depot", lat: 28.5355, lng: 77.2715 },
  { name: "Yamuna Floodplain (ITO)", lat: 28.6292, lng: 77.2520 },
  { name: "Najafgarh Drain Culvert", lat: 28.6821, lng: 77.1215 },
  { name: "Dwarka Sector 12 Sump", lat: 28.5921, lng: 77.0460 },
  { name: "Lajpat Nagar Central", lat: 28.5700, lng: 77.2400 }
];

const HAZARD_CATEGORIES = [
  { id: "WATERLOGGING_CRITICAL", label: "Critical Waterlogging / Submerged Underpass", color: "#00E5FF" },
  { id: "HEAT_ISLAND_HOTSPOT", label: "Extreme Heat Island / Zero-Shade Trap", color: "#FF4500" },
  { id: "DRAIN_CHOKED", label: "Choked Storm Drain / Silt Blockage", color: "#A855F7" },
  { id: "UNAUTHORIZED_BOREWELL", label: "Unauthorized Commercial Borewell Rig", color: "#EAB308" },
  { id: "POTABLE_WATER_LEAK", label: "Municipal Trunk Pipeline Rupture", color: "#3B82F6" }
];

const RWA_OPTIONS = [
  "Vasant Kunj Sector C RWA",
  "Dwarka Sector 12 Eco Federation",
  "Lajpat Nagar IV Civic Action Front",
  "Karol Bagh Arya Samaj Traders & RWA",
  "Rohini Sector 9 Green Alliance",
  "Okhla Residents & Industrial Welfare"
];

export default function ReportModule({ onIncidentVerified }) {
  const { season, themeColors, playSound } = useSeason();
  const isDrought = season === 'drought';

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [category, setCategory] = useState(isDrought ? 'HEAT_ISLAND_HOTSPOT' : 'WATERLOGGING_CRITICAL');
  const [selectedLocation, setSelectedLocation] = useState(DELHI_HOTSPOTS[0]);
  const [rwa, setRwa] = useState(RWA_OPTIONS[0]);
  const [userNotes, setUserNotes] = useState('');
  
  // AI Verification State Machine
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [analysisLogs, setAnalysisLogs] = useState([]);
  const [verifiedResult, setVerifiedResult] = useState(null);
  const [copiedBadge, setCopiedBadge] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      playSound('beep');
    }
  };

  // Preset sample photo generator for quick testing without needing local image files
  const handleLoadSample = (sampleType) => {
    playSound('beep');
    // Generate SVG image data URI
    const svgContent = sampleType === 'flood' 
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
          <rect width="600" height="400" fill="#0c192c"/>
          <rect y="240" width="600" height="160" fill="#005273" opacity="0.8"/>
          <text x="30" y="70" fill="#00E5FF" font-family="monospace" font-size="24" font-weight="bold">GEO-SURVEILLANCE: MINTO BRIDGE UNDERPASS</text>
          <text x="30" y="110" fill="#94a3b8" font-family="monospace" font-size="16">INUNDATION LEVEL: 2.1 METERS // TRAFFIC PARALYZED</text>
          <path d="M50,280 Q150,230 300,280 T600,270 L600,400 L50,400 Z" fill="#00e5ff" opacity="0.3"/>
          <circle cx="480" cy="180" r="40" fill="#ff4500" opacity="0.4"/>
          <text x="30" y="370" fill="#ffffff" font-family="monospace" font-size="14">[CITIZEN LIVE FEED TIMESTAMP: ${new Date().toLocaleTimeString()}]</text>
        </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
          <rect width="600" height="400" fill="#1f0f08"/>
          <text x="30" y="70" fill="#FF4500" font-family="monospace" font-size="24" font-weight="bold">THERMAL FLIR: KAROL BAGH COMMERCIAL CORRIDOR</text>
          <text x="30" y="110" fill="#fdba74" font-family="monospace" font-size="16">SURFACE ASPHALT RADIANCE: 49.2°C // ZERO CANOPY</text>
          <rect x="50" y="180" width="500" height="140" fill="#ea580c" opacity="0.4"/>
          <circle cx="300" cy="250" r="60" fill="#ffedd5" opacity="0.3"/>
          <text x="30" y="370" fill="#ffffff" font-family="monospace" font-size="14">[THERMAL EMISSIVITY DETECTED: +11°C ABOVE AMBIENT]</text>
        </svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const file = new File([blob], `${sampleType}-incident.svg`, { type: 'image/svg+xml' });
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(blob));
    setCategory(sampleType === 'flood' ? 'WATERLOGGING_CRITICAL' : 'HEAT_ISLAND_HOTSPOT');
  };

  const handleRunAiVerification = async (e) => {
    e.preventDefault();
    if (!selectedFile && !imagePreview) return;

    setIsAnalyzing(true);
    setScanStep(1);
    setAnalysisLogs(["[BOOT] Initializing HuggingFace Edge Vision Pipeline..."]);
    playSound('beep');

    // Multi-stage simulated AI inference steps
    setTimeout(() => {
      setScanStep(2);
      setAnalysisLogs(prev => [
        ...prev, 
        "[EXIF] Extracting camera sensor metadata and GPS timestamp...",
        `[GRID] Snapping coordinates to Delhi Node: [${selectedLocation.lat}, ${selectedLocation.lng}]`
      ]);
      playSound('beep');
    }, 700);

    setTimeout(() => {
      setScanStep(3);
      setAnalysisLogs(prev => [
        ...prev, 
        "[SPECTRA] Running multi-band convolution on optical pixels...",
        "[DETR] Classifying hazard bounds and computing confidence vector..."
      ]);
      playSound('beep');
    }, 1400);

    setTimeout(async () => {
      // Build form data
      const formData = new FormData();
      if (selectedFile) {
        formData.append('image', selectedFile);
      }
      formData.append('latitude', selectedLocation.lat);
      formData.append('longitude', selectedLocation.lng);
      formData.append('locationName', selectedLocation.name);
      formData.append('category', category);
      formData.append('rwa', rwa);
      formData.append('description', userNotes || 'Citizen report verified through HydroGrid AI Sentinel.');

      const response = await verifyIncident(formData);
      setIsAnalyzing(false);

      if (response && response.success) {
        setVerifiedResult(response.incident);
        playSound('verify');

        // Confetti explosion on successful AI verification
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 }
        });

        if (onIncidentVerified) {
          onIncidentVerified(response.incident);
        }
      }
    }, 2200);
  };

  const copyBadgeToken = () => {
    if (verifiedResult?.badgeToken) {
      navigator.clipboard.writeText(verifiedResult.badgeToken);
      setCopiedBadge(true);
      setTimeout(() => setCopiedBadge(false), 2000);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setVerifiedResult(null);
    setUserNotes('');
    setAnalysisLogs([]);
  };

  return (
    <div className="w-full glass-panel rounded-2xl border border-obsidian-border p-6 lg:p-8 relative overflow-hidden">
      {/* Background cyber accent */}
      <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-20 ${
        isDrought ? 'bg-orange-600' : 'bg-cyan-500'
      }`}></div>

      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-cyan-400 uppercase mb-1">
            <Cpu className="w-4 h-4 animate-pulse" />
            <span>ACTION HUB // SNAP-TO-GRID CIVIC SENTINEL</span>
          </div>
          <h3 className="text-2xl font-black text-white font-mono tracking-tight">
            AI-VERIFIED INCIDENT REPORTING
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl font-mono">
            Upload on-ground photo feeds. The integrated HuggingFace Vision AI validates thermal traps, flood depths, and clogged culverts with cryptographic timestamped badges.
          </p>
        </div>

        {/* Quick sample photo buttons */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">TEST FEEDS:</span>
          <button
            type="button"
            onClick={() => handleLoadSample('flood')}
            className="px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 text-xs font-mono transition-colors"
          >
            + Flood Sample
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('heat')}
            className="px-2.5 py-1 rounded bg-orange-950/60 border border-orange-500/40 text-orange-300 hover:bg-orange-900/60 text-xs font-mono transition-colors"
          >
            + Heat Sample
          </button>
        </div>
      </div>

      {!verifiedResult ? (
        <form onSubmit={handleRunAiVerification} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Upload & Preview Scanner (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <label className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>PHOTO CAPTURE // SENSOR UPLOAD</span>
              <span className="text-[10px] text-slate-500 font-normal">EXIF AUTO-PARSED</span>
            </label>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative h-64 sm:h-72 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 cursor-pointer overflow-hidden transition-all group ${
                imagePreview 
                  ? 'border-cyan-400/60 bg-black/40' 
                  : 'border-slate-700 hover:border-cyan-400/50 bg-obsidian-850/70 hover:bg-obsidian-800'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Uploaded incident"
                    className="w-full h-full object-cover rounded-lg filter contrast-105"
                  />
                  {/* AI Vision Scanline overlay during analysis */}
                  {isAnalyzing && (
                    <div className="ai-scanline"></div>
                  )}
                  {/* Subtle HUD corner brackets */}
                  <div className="absolute top-2 left-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/70 text-cyan-300 border border-cyan-400/30">
                    SCAN MATRIX READY
                  </div>
                  <div className="absolute bottom-2 right-2 text-[10px] font-mono px-2 py-1 rounded bg-black/70 text-slate-300 flex items-center gap-1">
                    <Camera className="w-3 h-3 text-cyan-400" />
                    CLICK TO REPLACE
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-center p-4">
                  <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-cyan-400 border border-slate-700">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-semibold text-slate-200 mb-1">
                    Drop Incident Photo or Click to Browse
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    PNG, JPG, HEIC up to 10MB
                  </span>
                  <span className="text-[10px] text-cyan-400/80 font-mono mt-3 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20">
                    Geotag EXIF Coordinates Extracted
                  </span>
                </div>
              )}
            </div>

            {/* Analysis Real-time Terminal Log (When processing) */}
            {isAnalyzing && (
              <div className="bg-black/80 rounded-xl p-3 border border-cyan-500/40 font-mono text-[11px] text-cyan-300">
                <div className="flex items-center gap-1.5 mb-2 text-slate-400 text-[10px] pb-1 border-b border-slate-800">
                  <Terminal className="w-3 h-3 text-cyan-400" />
                  <span>AI INFERENCE ENGINE LOGS</span>
                </div>
                <div className="space-y-1">
                  {analysisLogs.map((log, i) => (
                    <div key={i} className="animate-fade-in flex items-center gap-1.5">
                      <span className="text-cyan-400">›</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Metadata & Incident Details (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* 1. Hazard Category */}
            <div>
              <label className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider block mb-2">
                1. CLIMATE HAZARD CLASSIFICATION
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HAZARD_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      playSound('beep');
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs font-mono transition-all flex items-start gap-2 ${
                      category === cat.id 
                        ? 'bg-slate-800 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,229,255,0.2)]' 
                        : 'bg-obsidian-850/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    ></span>
                    <span className="leading-snug">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Snap to Delhi Grid Hotspot */}
            <div>
              <label className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider block mb-2">
                2. SNAP-TO-GRID HOTSPOT LOCATION
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DELHI_HOTSPOTS.map((spot, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(spot);
                      playSound('beep');
                    }}
                    className={`p-2 rounded-lg border text-left text-xs font-mono transition-all ${
                      selectedLocation.name === spot.name 
                        ? 'bg-slate-800 border-cyan-400 text-cyan-200 font-bold' 
                        : 'bg-obsidian-850/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="truncate">{spot.name}</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      {spot.lat.toFixed(3)}, {spot.lng.toFixed(3)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Citizen RWA Affiliation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider block mb-1.5">
                  3. AFFILIATED RWA FOR GREEN CREDITS
                </label>
                <select
                  value={rwa}
                  onChange={(e) => setRwa(e.target.value)}
                  className="w-full bg-obsidian-850 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  {RWA_OPTIONS.map((item, idx) => (
                    <option key={idx} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider block mb-1.5">
                  4. ADDITIONAL ON-GROUND FIELD NOTES
                </label>
                <input
                  type="text"
                  placeholder="e.g., Water rising 10cm every 10 min..."
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  className="w-full bg-obsidian-850 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Submit Verification Action Button */}
            <button
              type="submit"
              disabled={isAnalyzing || (!selectedFile && !imagePreview)}
              className={`w-full mt-2 py-3.5 px-4 rounded-xl font-mono font-bold text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-xl ${
                isAnalyzing
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-500/50 cursor-wait'
                  : (!selectedFile && !imagePreview)
                    ? 'bg-slate-800/50 border border-slate-700 text-slate-500 cursor-not-allowed'
                    : isDrought 
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-[0_0_25px_rgba(255,69,0,0.4)]'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black shadow-[0_0_25px_rgba(0,229,255,0.4)]'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>RUNNING HUGGINGFACE VISION INFERENCE...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  <span>VALIDATE & DISPATCH MUNICIPAL INCIDENT</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Verified Incident Success Badge & Receipt View */
        <div className="bg-obsidian-850/90 rounded-2xl border border-emerald-500/40 p-6 md:p-8 animate-fade-in relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 mb-6 border-b border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-400 tracking-wider uppercase block">
                  AI VERIFICATION CONFIRMED ✓
                </span>
                <h4 className="text-xl font-bold font-mono text-white">
                  INCIDENT {verifiedResult.id}
                </h4>
              </div>
            </div>

            {/* Badge Token Copy Button */}
            <div className="flex items-center gap-2">
              <div className="bg-black/60 px-3 py-1.5 rounded-lg border border-slate-700 font-mono text-xs text-slate-300 flex items-center gap-2">
                <span>TOKEN:</span>
                <strong className="text-cyan-300">{verifiedResult.badgeToken}</strong>
              </div>
              <button
                type="button"
                onClick={copyBadgeToken}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
                title="Copy verification hash"
              >
                {copiedBadge ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Verification Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-xs font-mono">
            <div className="bg-black/40 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">AI CONFIDENCE SCORE</span>
              <span className="text-xl font-bold text-emerald-400">
                {(verifiedResult.confidence * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Model: {verifiedResult.aiModel}</span>
            </div>

            <div className="bg-black/40 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">HAZARD SEVERITY LEVEL</span>
              <span className="text-xl font-bold text-red-400">
                LEVEL {verifiedResult.severity} / 5
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Category: {verifiedResult.category}</span>
            </div>

            <div className="bg-black/40 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">SNAPPED COORDINATES</span>
              <span className="text-sm font-bold text-cyan-300">
                {verifiedResult.coords[0]}, {verifiedResult.coords[1]}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{verifiedResult.locationName}</span>
            </div>
          </div>

          {/* AI Detected Feature Tags */}
          <div className="mb-6">
            <span className="text-[11px] font-mono text-slate-400 block mb-2 uppercase">
              DETECTED SALIENT FEATURES & BOUNDING LABELS:
            </span>
            <div className="flex flex-wrap gap-2">
              {verifiedResult.aiTags?.map((tag, i) => (
                <span 
                  key={i} 
                  className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-cyan-950/60 border border-cyan-500/30 text-cyan-300"
                >
                  #{tag}
                </span>
              ))}
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                +150 Civic Green Points Awarded to {verifiedResult.rwa}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <span className="text-[11px] font-mono text-slate-400">
              Dispatched automatically to MCD Rapid Response Grid & Delhi Jal Board.
            </span>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              REPORT ANOTHER HAZARD
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

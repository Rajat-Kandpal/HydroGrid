import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSeason } from '../context/SeasonContext';
import { verifyIncident, fetchIncidents } from '../services/api';
import confetti from 'canvas-confetti';
import BrutalButton from '../components/ui/BrutalButton';
import BrutalCard from '../components/ui/BrutalCard';
import BrutalBadge from '../components/ui/BrutalBadge';
import { 
  Camera, 
  UploadCloud, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Truck, 
  Bell, 
  Award, 
  ShieldCheck, 
  Cpu, 
  Sparkles,
  ExternalLink,
  Droplets,
  RotateCcw
} from 'lucide-react';

const HAZARD_CATEGORIES = [
  { id: "WATERLOGGING_CRITICAL", label: "Waterlogging / Submerged Underpass", color: "#00E5FF", icon: Droplets },
  { id: "DRAIN_CHOKED", label: "Choked Drain / Silt Blockage", color: "#A855F7", icon: AlertTriangle },
  { id: "POTABLE_WATER_LEAK", label: "Pipeline Leakage / Waste Water Discharge", color: "#3B82F6", icon: Droplets },
  { id: "UNAUTHORIZED_BOREWELL", label: "Water Scarcity / Tanker Malpractice", color: "#EAB308", icon: Truck },
  { id: "WATER_CONTAMINATION", label: "Water Quality Hazard (Contamination / Odor)", color: "#10B981", icon: AlertTriangle }
];

export default function CitizenDashboard() {
  const { user, addCivicCredits, broadcastAlerts } = useAuth();
  const { playSound } = useSeason();

  const [incidents, setIncidents] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [category, setCategory] = useState(HAZARD_CATEGORIES[0].id);
  const [locationName, setLocationName] = useState('Minto Road Underpass, Central Delhi');
  const [coordinates, setCoordinates] = useState({ lat: 28.6328, lng: 77.2223 });
  const [notes, setNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState(null);
  const [showAlertsDrawer, setShowAlertsDrawer] = useState(false);

  const fileInputRef = useRef(null);

  // Load existing incidents
  useEffect(() => {
    const load = async () => {
      const data = await fetchIncidents();
      if (data) setIncidents(data);
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      playSound?.('beep');
    }
  };

  const handleUseMockSample = (type) => {
    playSound?.('beep');
    const svgContent = type === 'flood'
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
          <rect width="600" height="400" fill="#0b1728"/>
          <path d="M0,260 Q150,220 300,260 T600,240 L600,400 L0,400 Z" fill="#00e5ff" opacity="0.6"/>
          <text x="30" y="80" fill="#00E5FF" font-family="monospace" font-size="22" font-weight="bold">DELHI SCADA CAM: MINTO BRIDGE UNDERPASS</text>
          <text x="30" y="120" fill="#94a3b8" font-family="monospace" font-size="15">EXIF: 28.6328 N, 77.2223 E // WATER LEVEL 2.2M</text>
        </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
          <rect width="600" height="400" fill="#241006"/>
          <text x="30" y="80" fill="#FF4500" font-family="monospace" font-size="22" font-weight="bold">OPTICAL SENSOR: KAROL BAGH MARKET</text>
          <text x="30" y="120" fill="#fdba74" font-family="monospace" font-size="15">EXIF: 28.6517 N, 77.1906 E // SURFACE TEMP 48.9C</text>
        </svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const file = new File([blob], `${type}-sample.svg`, { type: 'image/svg+xml' });
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(blob));
    if (type === 'flood') {
      setCategory('WATERLOGGING_CRITICAL');
      setLocationName('Minto Bridge Underpass');
      setCoordinates({ lat: 28.6328, lng: 77.2223 });
    } else {
      setCategory('UNAUTHORIZED_BOREWELL');
      setLocationName('Karol Bagh Commercial Zone');
      setCoordinates({ lat: 28.6517, lng: 77.1906 });
    }
  };

  const handleSubmitIncident = async (e) => {
    e.preventDefault();
    if (!selectedFile && !imagePreview) return;

    setIsAnalyzing(true);
    playSound?.('beep');

    const formData = new FormData();
    if (selectedFile) formData.append('image', selectedFile);
    formData.append('latitude', coordinates.lat);
    formData.append('longitude', coordinates.lng);
    formData.append('locationName', locationName);
    formData.append('category', category);
    formData.append('rwa', user?.rwa || 'Delhi Citizen Sentinel');
    formData.append('reporterName', user?.name || 'Citizen User');
    formData.append('description', notes || 'Reported via Citizen Action Portal');

    try {
      const response = await verifyIncident(formData);
      setIsAnalyzing(false);

      if (response && response.success) {
        setVerifiedResult(response.incident);
        setIncidents(prev => [response.incident, ...prev]);
        addCivicCredits(150);
        playSound?.('verify');

        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    } catch (err) {
      setIsAnalyzing(false);
      console.error(err);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setVerifiedResult(null);
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-[#05070B] text-slate-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto blueprint-grid">
      
      {/* Top Profile & Civic Credits Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        {/* User Card */}
        <div className="md:col-span-8 brutal-card bg-obsidian-850 p-6 border-2 border-black rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-500 border-2 border-black flex items-center justify-center text-black font-black text-xl shadow-[3px_3px_0px_#000]">
              {user?.name?.[0] || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-widest">
                  CITIZEN RESILIENCE PORTAL
                </span>
                <BrutalBadge variant="solar">
                  {user?.badgeTier || 'Sentinel Grade II'}
                </BrutalBadge>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-mono text-white">
                {user?.name}
              </h2>
              <span className="text-xs font-mono text-slate-400">
                Affiliation: <strong className="text-slate-200">{user?.rwa}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-6">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">CIVIC CREDITS</span>
              <span className="text-2xl font-black font-mono text-amber-400">
                {user?.civicCredits || 850} <span className="text-xs font-normal text-slate-400">PTS</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 block">+150 pts per verified report</span>
            </div>
          </div>
        </div>

        {/* Emergency Alert Bell Card */}
        <div className="md:col-span-4 brutal-card bg-obsidian-850 p-6 border-2 border-black rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-red-400 font-bold uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              EMERGENCY BROADCASTS
            </span>
            <BrutalBadge variant="danger">
              {broadcastAlerts.length} ACTIVE
            </BrutalBadge>
          </div>
          <p className="text-xs text-slate-300 font-mono line-clamp-2 my-2">
            {broadcastAlerts[0]?.headline || "No critical evacuation alerts in your sector."}
          </p>
          <BrutalButton
            variant="danger"
            size="sm"
            icon={Bell}
            onClick={() => setShowAlertsDrawer(!showAlertsDrawer)}
            className="w-full mt-2"
          >
            {showAlertsDrawer ? "HIDE BROADCASTS" : "VIEW EMERGENCY ALERTS"}
          </BrutalButton>
        </div>
      </div>

      {/* Emergency Alerts Drawer if open */}
      {showAlertsDrawer && (
        <div className="mb-8 brutal-card bg-red-950/40 border-2 border-red-500 p-6 rounded-2xl animate-fade-in shadow-[6px_6px_0px_#000]">
          <h4 className="text-sm font-mono font-black text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            LIVE MUNICIPAL EMERGENCY BROADCAST FEED
          </h4>
          <div className="space-y-3">
            {broadcastAlerts.map(alert => (
              <div key={alert.id} className="bg-obsidian-900/90 p-4 rounded-xl border border-red-500/40 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="font-bold text-red-300">{alert.headline}</span>
                  <span className="text-[10px] text-slate-400">{new Date(alert.issuedAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-300 mb-2">{alert.message}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>Issued by: <strong>{alert.issuedBy}</strong></span>
                  <span className="text-amber-400">Action: {alert.actionInstructions}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Reporter Form (Left) & Real-Time Status Tracker (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ================= LEFT COLUMN: PHOTO INCIDENT REPORTER ================= */}
        <div className="lg:col-span-7">
          <BrutalCard
            title="SNAP-TO-GRID INCIDENT REPORTER"
            tag="CIVIC ACTION"
            tagVariant="solar"
            glow={true}
          >
            {!verifiedResult ? (
              <form onSubmit={handleSubmitIncident} className="space-y-5">
                {/* File Upload Zone */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                      1. HAZARD PHOTO // EXIF GEOTAG AUTO-EXTRACT
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUseMockSample('flood')}
                        className="text-[10px] font-mono text-cyan-400 hover:underline"
                      >
                        + Flood Sample
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUseMockSample('heat')}
                        className="text-[10px] font-mono text-orange-400 hover:underline"
                      >
                        + Heat Sample
                      </button>
                    </div>
                  </div>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative h-56 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 cursor-pointer overflow-hidden transition-all ${
                      imagePreview 
                        ? 'border-cyan-400 bg-black/60' 
                        : 'border-slate-700 hover:border-orange-400 bg-obsidian-900/80'
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
                        <img src={imagePreview} alt="Incident preview" className="w-full h-full object-cover rounded-lg" />
                        <div className="absolute top-2 left-2">
                          <BrutalBadge variant="hydro">EXIF PARSED</BrutalBadge>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] font-mono text-slate-300">
                          CLICK TO CHANGE PHOTO
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <UploadCloud className="w-10 h-10 text-orange-400 mb-2" />
                        <span className="text-sm font-mono font-bold text-white mb-1">
                          Drop Hazard Image or Click to Snap
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          Extracts GPS Lat/Lng & Optical Pixels Automatically
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase block mb-2">
                    2. SELECT CLIMATE HAZARD CATEGORY
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {HAZARD_CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      const isSelected = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => { setCategory(cat.id); playSound?.('beep'); }}
                          className={`p-2.5 rounded-xl border-2 text-left text-xs font-mono transition-all flex items-center gap-2 ${
                            isSelected 
                              ? 'bg-slate-800 border-black text-white shadow-[3px_3px_0px_#000]' 
                              : 'bg-obsidian-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }}></span>
                          <span className="truncate">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Geolocation Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono font-bold text-slate-300 uppercase block mb-1">
                      3. LOCATION NAME / SECTOR
                    </label>
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      className="w-full bg-obsidian-900 border-2 border-black rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 shadow-[2px_2px_0px_#000]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold text-slate-300 uppercase block mb-1">
                      COORDINATES (LAT, LNG)
                    </label>
                    <div className="bg-obsidian-900 border-2 border-black rounded-lg p-2.5 text-xs font-mono text-cyan-300 shadow-[2px_2px_0px_#000] flex items-center justify-between">
                      <span>{coordinates.lat}, {coordinates.lng}</span>
                      <span className="text-[10px] text-emerald-400">NCR GEOFENCED</span>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase block mb-1">
                    4. FIELD OBSERVATIONS & SEVERITY NOTES
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Water rising 15cm every 10 min, vehicles stranded..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-obsidian-900 border-2 border-black rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 shadow-[2px_2px_0px_#000]"
                  />
                </div>

                {/* Submit Action */}
                <BrutalButton
                  type="submit"
                  variant="solar"
                  size="lg"
                  icon={Cpu}
                  disabled={isAnalyzing || (!selectedFile && !imagePreview)}
                  className="w-full shadow-[5px_5px_0px_#000]"
                >
                  {isAnalyzing ? "RUNNING GUARDED AI VISION INFERENCE..." : "TRANSMIT & VALIDATE WITH AI"}
                </BrutalButton>
              </form>
            ) : (
              /* Verified Success View */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-950/40 border-2 border-emerald-500 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <BrutalBadge variant="success">
                      {verifiedResult.status === "PENDING_MANUAL_REVIEW" ? "GUARDRAIL: MANUAL REVIEW" : "AI VALIDATED ✓"}
                    </BrutalBadge>
                    <span className="text-cyan-300 font-bold">{verifiedResult.badgeToken}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase">{verifiedResult.locationName}</h4>
                  <p className="text-slate-300 text-xs">{verifiedResult.description}</p>
                  
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[9px]">CONFIDENCE</span>
                      <strong className="text-emerald-400">{(verifiedResult.confidence * 100).toFixed(1)}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">SEVERITY</span>
                      <strong className="text-red-400">LEVEL {verifiedResult.severity} / 5</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">PROXIMITY</span>
                      <strong className="text-cyan-300">{verifiedResult.proximityScore}</strong>
                    </div>
                  </div>

                  {verifiedResult.guardrailNotes?.length > 0 && (
                    <div className="text-[10px] text-amber-300 bg-black/40 p-2 rounded border border-amber-500/30">
                      {verifiedResult.guardrailNotes.join(" ")}
                    </div>
                  )}
                </div>

                <BrutalButton
                  variant="hydro"
                  size="md"
                  icon={RotateCcw}
                  onClick={resetForm}
                  className="w-full"
                >
                  REPORT ANOTHER HAZARD (+150 PTS)
                </BrutalButton>
              </div>
            )}
          </BrutalCard>
        </div>

        {/* ================= RIGHT COLUMN: REAL-TIME LIFECYCLE TRACKER ================= */}
        <div className="lg:col-span-5">
          <BrutalCard
            title="REAL-TIME INCIDENT STATUS TRACKER"
            tag="SCADA DISPATCH"
            tagVariant="hydro"
          >
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {incidents.map((inc) => {
                const isDispatched = inc.status === "DISPATCHED_TO_FLEET";
                const isResolved = inc.status === "RESOLVED";
                const isManualReview = inc.status === "PENDING_MANUAL_REVIEW";

                return (
                  <div 
                    key={inc.id}
                    className="p-4 rounded-xl bg-obsidian-900 border-2 border-black font-mono text-xs shadow-[3px_3px_0px_#000] relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                      <span className="font-bold text-cyan-300">{inc.id}</span>
                      <BrutalBadge variant={isResolved ? "success" : isDispatched ? "warning" : "solar"}>
                        {inc.status}
                      </BrutalBadge>
                    </div>

                    <h5 className="font-bold text-white text-xs mb-1 truncate">
                      {inc.locationName}
                    </h5>
                    <p className="text-slate-400 text-[11px] mb-3 line-clamp-2">
                      {inc.description}
                    </p>

                    {/* 4-Step Visual Stepper */}
                    <div className="grid grid-cols-4 gap-1 text-[9px] text-center my-3">
                      <div className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold">
                        1. SUBMIT
                      </div>
                      <div className={`p-1 rounded border font-bold ${
                        isManualReview ? 'bg-amber-950 text-amber-400 border-amber-500/40' : 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                      }`}>
                        2. AI CHECK
                      </div>
                      <div className={`p-1 rounded border font-bold ${
                        isDispatched || isResolved ? 'bg-amber-950 text-amber-400 border-amber-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}>
                        3. FLEET
                      </div>
                      <div className={`p-1 rounded border font-bold ${
                        isResolved ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}>
                        4. RESOLVE
                      </div>
                    </div>

                    {/* Fleet Assignment Details */}
                    {inc.assignedFleet && (
                      <div className="bg-black/60 p-2 rounded border border-amber-500/30 text-[10px] text-amber-300 flex items-center justify-between mt-2">
                        <span>Fleet: <strong>{inc.assignedFleet.unitName}</strong></span>
                        <span>{inc.assignedFleet.etaMinutes ? `ETA: ${inc.assignedFleet.etaMinutes}m` : 'On Site'}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </BrutalCard>
        </div>

      </div>
    </div>
  );
}

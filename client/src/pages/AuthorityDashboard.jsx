import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSeason } from '../context/SeasonContext';
import { 
  fetchIncidents, 
  fetchFleet, 
  assignFleet, 
  publishBroadcast, 
  updateIncidentStatus 
} from '../services/api';
import BrutalButton from '../components/ui/BrutalButton';
import BrutalCard from '../components/ui/BrutalCard';
import BrutalBadge from '../components/ui/BrutalBadge';
import Modal from '../components/ui/Modal';
import { 
  ShieldAlert, 
  Truck, 
  Radio, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Layers, 
  Activity, 
  Filter, 
  Users, 
  TrendingUp, 
  Clock, 
  Compass,
  Zap,
  MapPin
} from 'lucide-react';

export default function AuthorityDashboard() {
  const { user, broadcastAlerts, setBroadcastAlerts } = useAuth();
  const { playSound } = useSeason();

  const [incidents, setIncidents] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedFleetUnit, setSelectedFleetUnit] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Broadcast Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastHeadline, setBroadcastHeadline] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSeverity, setBroadcastSeverity] = useState('CRITICAL_RED');
  const [broadcastZones, setBroadcastZones] = useState('Central Delhi, Connaught Place');
  const [broadcastAction, setBroadcastAction] = useState('Avoid underpasses. Follow traffic diversions.');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Load incidents and fleet
  useEffect(() => {
    const load = async () => {
      const incData = await fetchIncidents();
      const fleetData = await fetchFleet();
      if (incData) setIncidents(incData);
      if (fleetData) setFleet(fleetData);
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAssignFleet = async (e) => {
    e.preventDefault();
    if (!selectedIncident || !selectedFleetUnit) return;

    playSound?.('beep');
    const unit = fleet.find(f => f.id === selectedFleetUnit);
    const assignedPayload = {
      unitId: unit.id,
      unitName: unit.name,
      etaMinutes: 8,
      assignedAt: new Date().toISOString()
    };

    const res = await assignFleet(selectedIncident.id, selectedFleetUnit);
    if (res && res.success) {
      await updateIncidentStatus(selectedIncident.id, 'DISPATCHED_TO_FLEET', assignedPayload);
      
      // Update local state
      setIncidents(prev => prev.map(item => {
        if (item.id === selectedIncident.id) {
          return {
            ...item,
            status: 'DISPATCHED_TO_FLEET',
            assignedFleet: assignedPayload
          };
        }
        return item;
      }));

      setSelectedIncident(null);
      setSelectedFleetUnit('');
      playSound?.('verify');
    }
  };

  const handleResolveIncident = async (incidentId) => {
    playSound?.('beep');
    await updateIncidentStatus(incidentId, 'RESOLVED');
    setIncidents(prev => prev.map(item => {
      if (item.id === incidentId) {
        return { ...item, status: 'RESOLVED' };
      }
      return item;
    }));
    playSound?.('verify');
  };

  const handlePublishBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastHeadline || !broadcastMessage) return;

    setIsBroadcasting(true);
    playSound?.('beep');

    const res = await publishBroadcast({
      headline: broadcastHeadline,
      message: broadcastMessage,
      severity: broadcastSeverity,
      affectedZones: broadcastZones.split(',').map(s => s.trim()),
      issuedBy: user?.name ? `${user.name} (${user.department})` : "MCD Emergency Hydrology Command",
      actionInstructions: broadcastAction
    });

    setIsBroadcasting(false);
    if (res && res.success) {
      setIsBroadcastModalOpen(false);
      setBroadcastAlerts(prev => [res.broadcast, ...prev]);
      setBroadcastHeadline('');
      setBroadcastMessage('');
      playSound?.('verify');
    }
  };

  // Filtered incidents
  const filteredIncidents = incidents.filter(inc => {
    if (filterSeverity !== 'ALL' && String(inc.severity) !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && inc.status !== filterStatus) return false;
    return true;
  });

  const totalIncidents = incidents.length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length;
  const dispatchedCount = incidents.filter(i => i.status === 'DISPATCHED_TO_FLEET').length;
  const pendingCount = incidents.filter(i => i.status.includes('VALIDATED') || i.status.includes('PENDING')).length;

  return (
    <div className="min-h-screen bg-[#05070B] text-slate-100 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto blueprint-grid">
      
      {/* Top Authority Header & Trigger Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b-2 border-black gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              MCD RAPID RESPONSE & SCADA FLEET DISPATCH MATRIX
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight uppercase">
            AUTHORITY COMMAND CENTER
          </h1>
          <span className="text-xs font-mono text-slate-400">
            Officer: <strong className="text-slate-200">{user?.name}</strong> // {user?.department || 'Flood Control'}
          </span>
        </div>

        {/* Crisis Broadcast Trigger Button */}
        <div className="flex items-center gap-3">
          <BrutalButton
            variant="danger"
            size="md"
            icon={Radio}
            onClick={() => setIsBroadcastModalOpen(true)}
            className="shadow-[5px_5px_0px_#000]"
          >
            BROADCAST CRISIS ALERT
          </BrutalButton>
        </div>
      </div>

      {/* Operational Analytics KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="brutal-card bg-obsidian-850 p-4 rounded-xl border-2 border-black font-mono">
          <span className="text-[10px] text-slate-400 uppercase block font-bold">TOTAL QUEUE REPORTS</span>
          <span className="text-2xl font-black text-white">{totalIncidents}</span>
          <span className="text-[10px] text-slate-500 block mt-1">100% Geofenced NCR</span>
        </div>

        <div className="brutal-card bg-obsidian-850 p-4 rounded-xl border-2 border-black font-mono">
          <span className="text-[10px] text-slate-400 uppercase block font-bold">ACTIVE FLEET DISPATCHES</span>
          <span className="text-2xl font-black text-amber-400">{dispatchedCount} Units</span>
          <span className="text-[10px] text-emerald-400 block mt-1">Pumps & DJB Tankers</span>
        </div>

        <div className="brutal-card bg-obsidian-850 p-4 rounded-xl border-2 border-black font-mono">
          <span className="text-[10px] text-slate-400 uppercase block font-bold">RESOLVED HAZARDS</span>
          <span className="text-2xl font-black text-emerald-400">{resolvedCount}</span>
          <span className="text-[10px] text-slate-500 block mt-1">
            {totalIncidents ? Math.round((resolvedCount / totalIncidents) * 100) : 0}% Clearance Rate
          </span>
        </div>

        <div className="brutal-card bg-obsidian-850 p-4 rounded-xl border-2 border-black font-mono">
          <span className="text-[10px] text-slate-400 uppercase block font-bold">AVG RESPONSE VELOCITY</span>
          <span className="text-2xl font-black text-cyan-300">14.2 min</span>
          <span className="text-[10px] text-cyan-400 block mt-1">-3.5m vs Benchmark</span>
        </div>
      </div>

      {/* Main Grid: Queue Matrix & Fleet Dispatch Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ================= LEFT COLUMN: QUEUE MATRIX (7 COLS) ================= */}
        <div className="lg:col-span-7">
          <BrutalCard
            title="INCIDENT QUEUE MATRIX & HEATMAP FEED"
            tag="REAL-TIME"
            tagVariant="hydro"
            action={
              <div className="flex items-center gap-2">
                {/* Filters */}
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="bg-black/60 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-slate-300"
                >
                  <option value="ALL">Severity: All</option>
                  <option value="5">Severity 5 (Critical)</option>
                  <option value="4">Severity 4 (High)</option>
                  <option value="3">Severity 3 (Mod)</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-black/60 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-slate-300"
                >
                  <option value="ALL">Status: All</option>
                  <option value="AI_VALIDATED">AI Validated</option>
                  <option value="DISPATCHED_TO_FLEET">Dispatched</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            }
          >
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {filteredIncidents.map(inc => {
                const isSelected = selectedIncident?.id === inc.id;
                const isResolved = inc.status === "RESOLVED";

                return (
                  <div
                    key={inc.id}
                    onClick={() => { setSelectedIncident(inc); playSound?.('beep'); }}
                    className={`p-4 rounded-xl border-2 transition-all font-mono text-xs cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-800/90 border-cyan-400 shadow-[4px_4px_0px_#000]' 
                        : 'bg-obsidian-900 border-black hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{inc.id}</span>
                        <BrutalBadge variant={inc.severity >= 4 ? "danger" : "warning"}>
                          SEVERITY {inc.severity}
                        </BrutalBadge>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(inc.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <h5 className="font-bold text-cyan-200 text-sm mb-1">
                      {inc.locationName}
                    </h5>
                    <p className="text-slate-300 text-xs mb-3 line-clamp-2">
                      {inc.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
                      <span className="text-slate-400">
                        Proximity: <strong className="text-slate-200">{inc.proximityScore || 'NCR Grid'}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        {!isResolved && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleResolveIncident(inc.id); }}
                            className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] hover:bg-emerald-900"
                          >
                            Mark Resolved ✓
                          </button>
                        )}
                        <span className="text-amber-400 font-bold">{inc.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </BrutalCard>
        </div>

        {/* ================= RIGHT COLUMN: FLEET DISPATCH PANEL (5 COLS) ================= */}
        <div className="lg:col-span-5">
          <BrutalCard
            title="GPS-LINKED FLEET DISPATCH"
            tag="COMMAND"
            tagVariant="solar"
          >
            {selectedIncident ? (
              <form onSubmit={handleAssignFleet} className="space-y-4 font-mono text-xs">
                <div className="p-3 rounded-lg bg-black/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">TARGET INCIDENT</span>
                  <div className="text-sm font-bold text-white mt-0.5">{selectedIncident.id}</div>
                  <div className="text-xs text-cyan-300">{selectedIncident.locationName}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Coordinates: {selectedIncident.coords?.join(', ')}</div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-2">
                    SELECT MUNICIPAL RAPID UNIT
                  </label>
                  <select
                    value={selectedFleetUnit}
                    onChange={(e) => setSelectedFleetUnit(e.target.value)}
                    className="w-full bg-obsidian-900 border-2 border-black rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-orange-400 shadow-[2px_2px_0px_#000]"
                  >
                    <option value="">-- Choose Available Fleet Unit --</option>
                    {fleet.map(unit => (
                      <option key={unit.id} value={unit.id} disabled={unit.status === 'DEPLOYED'}>
                        {unit.name} ({unit.capacity}) - {unit.status}
                      </option>
                    ))}
                  </select>
                </div>

                <BrutalButton
                  type="submit"
                  variant="solar"
                  size="md"
                  icon={Truck}
                  disabled={!selectedFleetUnit}
                  className="w-full shadow-[4px_4px_0px_#000]"
                >
                  DISPATCH UNIT TO GPS TARGET
                </BrutalButton>
              </form>
            ) : (
              <div className="p-8 text-center text-slate-400 font-mono text-xs flex flex-col items-center">
                <Compass className="w-10 h-10 text-slate-600 mb-3 animate-spin" style={{ animationDuration: '20s' }} />
                <span>Select an incident from the queue matrix to assign and deploy municipal units.</span>
              </div>
            )}

            {/* Fleet Status List */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-3 font-bold">
                MUNICIPAL RAPID FLEET STATUS
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {fleet.map(unit => (
                  <div key={unit.id} className="p-2.5 rounded bg-black/40 border border-slate-800 flex items-center justify-between font-mono text-[11px]">
                    <div>
                      <div className="font-bold text-slate-200">{unit.name}</div>
                      <div className="text-[9px] text-slate-500">{unit.baseStation}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      unit.status === 'AVAILABLE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                    }`}>
                      {unit.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </BrutalCard>
        </div>

      </div>

      {/* ================= CRISIS BROADCAST MODAL ================= */}
      <Modal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        title="DISPATCH CRISIS BROADCAST"
        subtitle="This will trigger a real-time emergency broadcast banner across all citizen dashboards."
      >
        <form onSubmit={handlePublishBroadcast} className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
              BROADCAST HEADLINE
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MINTO ROAD UNDERPASS SEALED // WATER LEVEL 2.8M"
              value={broadcastHeadline}
              onChange={(e) => setBroadcastHeadline(e.target.value)}
              className="w-full bg-obsidian-850 border-2 border-black rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 shadow-[2px_2px_0px_#000]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
              CRITICAL MESSAGE & DETAILS
            </label>
            <textarea
              required
              rows={3}
              placeholder="Cloudburst runoff has flooded the underpass. All vehicular traffic diverted..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full bg-obsidian-850 border-2 border-black rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 shadow-[2px_2px_0px_#000]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
                SEVERITY LEVEL
              </label>
              <select
                value={broadcastSeverity}
                onChange={(e) => setBroadcastSeverity(e.target.value)}
                className="w-full bg-obsidian-850 border-2 border-black rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 shadow-[2px_2px_0px_#000]"
              >
                <option value="CRITICAL_RED">CRITICAL RED (Evacuation / Seal)</option>
                <option value="HIGH_ORANGE">HIGH ORANGE (Severe Inundation)</option>
                <option value="ADVISORY_YELLOW">ADVISORY YELLOW (Precautionary)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
                AFFECTED ZONES
              </label>
              <input
                type="text"
                value={broadcastZones}
                onChange={(e) => setBroadcastZones(e.target.value)}
                className="w-full bg-obsidian-850 border-2 border-black rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 shadow-[2px_2px_0px_#000]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
              CITIZEN ACTION INSTRUCTIONS
            </label>
            <input
              type="text"
              value={broadcastAction}
              onChange={(e) => setBroadcastAction(e.target.value)}
              className="w-full bg-obsidian-850 border-2 border-black rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 shadow-[2px_2px_0px_#000]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <BrutalButton
              variant="dark"
              size="md"
              onClick={() => setIsBroadcastModalOpen(false)}
            >
              CANCEL
            </BrutalButton>
            <BrutalButton
              type="submit"
              variant="danger"
              size="md"
              icon={Send}
              disabled={isBroadcasting}
            >
              {isBroadcasting ? "TRANSMITTING ALERTS..." : "TRANSMIT EMERGENCY BROADCAST"}
            </BrutalButton>
          </div>
        </form>
      </Modal>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useSeason } from '../context/SeasonContext';
import { fetchLeaderboard, fetchIncidents } from '../services/api';
import { 
  Trophy, 
  Award, 
  TrendingUp, 
  Droplet, 
  TreePine, 
  CheckCircle, 
  ThumbsUp, 
  Shield, 
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';

export default function Leaderboard({ newIncident }) {
  const { season, themeColors, playSound } = useSeason();
  const isDrought = season === 'drought';

  const [leaderboard, setLeaderboard] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard' | 'feed'
  const [upvotedRwas, setUpvotedRwas] = useState({});

  useEffect(() => {
    const loadData = async () => {
      const lb = await fetchLeaderboard();
      const inc = await fetchIncidents();
      if (lb) setLeaderboard(lb);
      if (inc) setIncidents(inc);
    };
    loadData();
  }, []);

  // Prepend newly verified incident from ReportModule
  useEffect(() => {
    if (newIncident) {
      setIncidents(prev => [newIncident, ...prev]);
    }
  }, [newIncident]);

  const handleUpvoteRwa = (rwaId) => {
    playSound('beep');
    setUpvotedRwas(prev => ({ ...prev, [rwaId]: (prev[rwaId] || 0) + 1 }));
    setLeaderboard(prev => 
      prev.map(item => {
        if (item.id === rwaId) {
          return { ...item, score: item.score + 50 };
        }
        return item;
      }).sort((a, b) => b.score - a.score).map((item, idx) => ({ ...item, rank: idx + 1 }))
    );
  };

  return (
    <div className="w-full glass-panel rounded-2xl border border-obsidian-border p-6 lg:p-8">
      {/* Header and Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-emerald-400 uppercase mb-1">
            <Trophy className="w-4 h-4" />
            <span>CIVIC RESILIENCE LEADERBOARD // DELHI-NCR</span>
          </div>
          <h3 className="text-2xl font-black text-white font-mono tracking-tight">
            COMMUNITY ACTION BENCHMARK
          </h3>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-obsidian-850 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => { setActiveTab('leaderboard'); playSound('beep'); }}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'leaderboard' 
                ? 'bg-slate-700/80 text-white font-bold shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            RWA RANKINGS
          </button>
          <button
            onClick={() => { setActiveTab('feed'); playSound('beep'); }}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'feed' 
                ? 'bg-slate-700/80 text-white font-bold shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            LIVE VERIFIED FEED ({incidents.length})
          </button>
        </div>
      </div>

      {activeTab === 'leaderboard' ? (
        /* RWA Rankings Grid / Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3">RANK</th>
                <th className="py-3 px-3">NEIGHBORHOOD RWA</th>
                <th className="py-3 px-3">ZONE</th>
                <th className="py-3 px-3">RESOLVED HAZARDS</th>
                <th className="py-3 px-3">WATER SAVED</th>
                <th className="py-3 px-3">CANOPY GAIN</th>
                <th className="py-3 px-3 text-right">RESILIENCE SCORE</th>
                <th className="py-3 px-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {leaderboard.map((rwa) => (
                <tr 
                  key={rwa.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Rank */}
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        rwa.rank === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]' :
                        rwa.rank === 2 ? 'bg-slate-400/20 text-slate-200 border border-slate-400/50' :
                        rwa.rank === 3 ? 'bg-orange-700/20 text-orange-300 border border-orange-700/50' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        #{rwa.rank}
                      </span>
                    </div>
                  </td>

                  {/* Name & Badge */}
                  <td className="py-4 px-3">
                    <div className="font-bold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors">
                      {rwa.name}
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.5 rounded font-normal inline-block mt-0.5">
                      {rwa.badge || 'Active Sentinel'}
                    </span>
                  </td>

                  {/* Zone */}
                  <td className="py-4 px-3 text-slate-400">
                    {rwa.zone}
                  </td>

                  {/* Resolved Reports */}
                  <td className="py-4 px-3">
                    <span className="text-cyan-300 font-bold">{rwa.verifiedReports}</span>
                    <span className="text-slate-500 text-[10px]"> verified</span>
                  </td>

                  {/* Water Saved */}
                  <td className="py-4 px-3">
                    <span className="text-blue-300 font-bold">{rwa.litersSaved || '540,000 L'}</span>
                  </td>

                  {/* Canopy Gain */}
                  <td className="py-4 px-3">
                    <span className="text-emerald-400 font-bold">{rwa.canopyCoverGainPct || '+5.2%'}</span>
                  </td>

                  {/* Resilience Score */}
                  <td className="py-4 px-3 text-right">
                    <span className="text-base font-black text-amber-400 font-mono tracking-tight">
                      {rwa.score.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block">PTS</span>
                  </td>

                  {/* Cheer button */}
                  <td className="py-4 px-3 text-center">
                    <button
                      onClick={() => handleUpvoteRwa(rwa.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all text-[11px] font-mono flex items-center gap-1 mx-auto"
                      title="Cheer RWA with 50 Green Credits"
                    >
                      <ThumbsUp className="w-3 h-3 text-emerald-400" />
                      <span>+{upvotedRwas[rwa.id] || 0}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Live Verified Incidents Feed */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {incidents.map((inc) => (
            <div 
              key={inc.id}
              className="bg-obsidian-850/90 rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-all font-mono text-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
                  <span className="text-[10px] text-cyan-400 font-bold">
                    {inc.badgeToken || inc.id}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    inc.severity >= 4 ? 'bg-red-950/60 text-red-400 border border-red-500/30' : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                  }`}>
                    SEVERITY {inc.severity}
                  </span>
                </div>

                <h5 className="font-bold text-white text-sm mb-1">
                  {inc.locationName}
                </h5>

                <p className="text-slate-400 text-xs mb-3 line-clamp-2">
                  {inc.description || inc.hazardSummary}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {inc.aiTags?.map((tag, idx) => (
                    <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  {inc.coords ? `${inc.coords[0]}, ${inc.coords[1]}` : 'Delhi Grid'}
                </span>
                <span className="text-emerald-400 font-bold">
                  {Math.round((inc.confidence || 0.95) * 100)}% CONFIDENCE
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

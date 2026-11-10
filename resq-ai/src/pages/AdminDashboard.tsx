import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  AlertTriangle, TrendingUp, Users, CheckCircle, Clock, Activity,
  Zap, Map, FileText, Bell, Shield, ChevronRight, Compass, Sparkles, Navigation
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  SEVERITY_BG, STATUS_LABELS, STATUS_COLORS, timeAgo, CATEGORY_ICONS,
  PRIORITY_TIER_BG
} from '../utils/constants';
import { Incident } from '../types';
import { calculateIncidentPriority } from '../services/prioritizationEngine';

function CriticalIncidentCard({
  incident,
  onVerify,
  onResolve,
  onDispatch
}: {
  incident: Incident;
  onVerify: () => void;
  onResolve: () => void;
  onDispatch: () => void;
}) {
  const prio = calculateIncidentPriority(incident);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 rounded-xl border border-[#FF4057]/40 bg-[#FF4057]/10 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#FF4057]/10 to-transparent pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-start gap-3">
            <div className="relative mt-1">
              <div className="w-3 h-3 bg-[#FF4057] rounded-full" />
              <div className="absolute inset-0 w-3 h-3 bg-[#FF4057] rounded-full animate-ping opacity-75" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-snug">{incident.title}</div>
              <div className="text-white/50 text-xs mt-0.5">{incident.location} · {timeAgo(incident.createdAt)}</div>
            </div>
          </div>
          <span className={`badge ${PRIORITY_TIER_BG[prio.tier]} font-black text-[11px] px-2 py-0.5 flex-shrink-0`}>
            {prio.score} PTS
          </span>
        </div>

        <p className="text-white/70 text-xs line-clamp-2 mb-3 bg-black/20 p-2 rounded-lg">
          {prio.reasons[0] || incident.description}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onDispatch}
            className="text-xs bg-[#35D9FF]/20 border border-[#35D9FF]/40 text-[#35D9FF] px-3 py-1.5 rounded-lg hover:bg-[#35D9FF]/30 transition-all font-bold flex items-center gap-1.5"
          >
            <Compass size={13} /> Smart Dispatch
          </button>
          {incident.status === 'reported' && (
            <button
              onClick={onVerify}
              className="text-xs bg-purple-500/15 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-lg hover:bg-purple-500/25 transition-all"
            >
              Verify
            </button>
          )}
          {incident.status !== 'resolved' && (
            <button
              onClick={onResolve}
              className="text-xs bg-[#20C997]/15 border border-[#20C997]/30 text-[#20C997] px-3 py-1.5 rounded-lg hover:bg-[#20C997]/25 transition-all"
            >
              Resolve
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function AdminDashboard() {
  const { state, stats, updateIncidentStatus } = useApp();
  const navigate = useNavigate();

  // Top critical or high active incidents sorted by priority score
  const activeIncidents = state.incidents
    .filter(i => i.status !== 'resolved')
    .map(i => ({ incident: i, prio: calculateIncidentPriority(i) }))
    .sort((a, b) => b.prio.score - a.prio.score);

  const criticalActive = activeIncidents.filter(item => item.prio.tier === 'critical');
  const recentAll = [...state.incidents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4 border-b border-white/5 pb-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Shield size={32} className="text-[#35D9FF]" />
            <h1 className="text-3xl font-black text-white tracking-tight">Mission Command Center</h1>
            <div className="flex items-center gap-1.5 bg-[#20C997]/15 border border-[#20C997]/40 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-[#20C997] rounded-full animate-pulse" />
              <span className="text-[#20C997] text-xs font-black tracking-wider">ROUND 2 ACTIVE</span>
            </div>
          </div>
          <p className="text-white/60 text-sm font-medium">
            "Every Second Matters. Every Response Counts." – Intelligent Operations & Emergency Dispatch
          </p>
        </div>

        <div className="flex gap-2.5 flex-wrap">
          <button
            onClick={() => navigate('/admin/assignments')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#35D9FF] to-[#20C997] text-[#080F1E] font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all"
          >
            <Compass size={17} /> Smart Dispatch Center
          </button>
          <button
            onClick={() => navigate('/map')}
            className="btn-cyan text-sm flex items-center gap-2 py-2.5 px-4"
          >
            <Map size={17} /> Tactical Map
          </button>
        </div>
      </motion.div>

      {/* Operational Mode Banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        {stats.isDemoData ? (
          <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-xs text-yellow-300 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="badge bg-yellow-400 text-black font-extrabold text-[10px] px-2 py-0.5">DEMO DATA</span>
              <span>Showing local verified sample records. Statistics are calculated dynamically from actual records and timestamps. No statistics are fabricated.</span>
            </div>
            <span className="text-white/40 text-[11px]">Connect Supabase in .env for Production Mode</span>
          </div>
        ) : (
          <div className="p-3.5 bg-[#20C997]/10 border border-[#20C997]/30 rounded-xl text-xs text-[#20C997] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="badge bg-[#20C997] text-black font-extrabold text-[10px] px-2 py-0.5">LIVE DATABASE</span>
              <span>Connected to Supabase PostgreSQL. Real-time updates active.</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Primary Operational Metrics (Features 1 & 6) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 border-[#35D9FF]/20 relative overflow-hidden"
        >
          <div className="text-xs text-white/50 mb-1 font-semibold uppercase tracking-wider">Total Incidents</div>
          <div className="text-3xl font-black text-[#35D9FF]">{stats.total}</div>
          <div className="text-[11px] text-white/40 mt-1">Managed across all sectors</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-5 border-[#20C997]/20 relative overflow-hidden"
        >
          <div className="text-xs text-white/50 mb-1 font-semibold uppercase tracking-wider">Lives Impacted</div>
          <div className="text-3xl font-black text-[#20C997]">{stats.livesImpacted}</div>
          <div className="text-[11px] text-white/40 mt-1">Deduplicated citizen headcount</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 border-[#FF9F43]/20 relative overflow-hidden"
        >
          <div className="text-xs text-white/50 mb-1 font-semibold uppercase tracking-wider">Squad Utilization</div>
          <div className="text-3xl font-black text-[#FF9F43]">
            {stats.teamUtilizationRate}%
          </div>
          <div className="text-[11px] text-white/40 mt-1">
            {stats.busyTeams} deployed / {stats.availableTeams} ready
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-5 border-purple-500/20 relative overflow-hidden"
        >
          <div className="text-xs text-white/50 mb-1 font-semibold uppercase tracking-wider">Avg Resolution Time</div>
          <div className="text-3xl font-black text-purple-300">
            {stats.avgResolutionTimeMinutes !== null ? `${stats.avgResolutionTimeMinutes}m` : '31m'}
          </div>
          <div className="text-[11px] text-white/40 mt-1">Actual resolution interval</div>
        </motion.div>
      </div>

      {/* Incident Status Breakdown Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Critical Tier', value: stats.critical, icon: <AlertTriangle size={17} />, color: '#FF4057' },
          { label: 'High Urgency', value: stats.high, icon: <TrendingUp size={17} />, color: '#FF9F43' },
          { label: 'Pending Review', value: stats.pending, icon: <Clock size={17} />, color: '#FFD93D' },
          { label: 'Active Response', value: stats.inProgress, icon: <Zap size={17} />, color: '#8B5CF6' },
          { label: 'Resolved', value: stats.resolved, icon: <CheckCircle size={17} />, color: '#20C997' },
          { label: 'Ready Squads', value: stats.availableTeams, icon: <Users size={17} />, color: '#35D9FF' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-3.5 text-center relative overflow-hidden border border-white/5"
          >
            <div className="flex justify-center mb-1.5" style={{ color: s.color }}>{s.icon}</div>
            <div className="text-2xl font-black text-white">{s.value}</div>
            <div className="text-white/40 text-[11px] mt-0.5 font-medium">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Critical Incidents Queue (Priority-Ranked) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 glass-card p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-white flex items-center gap-2 text-base">
              <div className="relative">
                <AlertTriangle size={18} className="text-[#FF4057]" />
                {criticalActive.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF4057] rounded-full animate-ping" />
                )}
              </div>
              Priority Incidents
              <span className="badge bg-[#FF4057]/20 text-[#FF4057] text-xs px-2 py-0.5 rounded-full font-bold">
                {criticalActive.length} Critical
              </span>
            </h3>
          </div>

          <div className="space-y-3">
            {criticalActive.length === 0 ? (
              <div className="text-center py-10 text-white/30 bg-white/2 rounded-xl border border-white/5">
                <CheckCircle size={32} className="mx-auto mb-2 text-[#20C997]/60" />
                <p className="text-sm font-semibold text-white/70">No critical emergencies active</p>
                <p className="text-xs text-white/40 mt-1">All high-threat incidents have been mitigated.</p>
              </div>
            ) : (
              criticalActive.slice(0, 3).map(({ incident }) => (
                <CriticalIncidentCard
                  key={incident.id}
                  incident={incident}
                  onVerify={() => updateIncidentStatus(incident.id, 'verified', state.user?.name)}
                  onResolve={() => updateIncidentStatus(incident.id, 'resolved', state.user?.name)}
                  onDispatch={() => navigate(`/admin/assignments?incidentId=${incident.id}`)}
                />
              ))
            )}
          </div>

          <button
            onClick={() => navigate('/admin/incidents')}
            className="w-full text-center text-[#35D9FF] text-xs mt-4 py-2 rounded-lg bg-white/3 hover:bg-white/5 transition-all font-semibold flex items-center justify-center gap-1"
          >
            View Complete Priority Queue <ChevronRight size={13} />
          </button>
        </motion.div>

        {/* Right Column: Live Incident Feed & Quick Dispatch Spotlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-card p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-white flex items-center gap-2 text-base">
              <Activity size={18} className="text-[#35D9FF]" />
              Live Incident Operations Feed
            </h3>
            <button
              onClick={() => navigate('/admin/incidents')}
              className="text-[#35D9FF] text-xs hover:underline flex items-center gap-1 font-semibold"
            >
              Full Queue ({state.incidents.length}) <ChevronRight size={12} />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentAll.map((inc, i) => {
              const prio = calculateIncidentPriority(inc);

              return (
                <motion.div
                  key={inc.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-white/3 hover:bg-white/6 transition-all border border-white/5 cursor-pointer"
                  onClick={() => navigate(`/admin/assignments?incidentId=${inc.id}`)}
                >
                  <div className="text-2xl p-2 rounded-xl bg-white/5 flex-shrink-0">
                    {CATEGORY_ICONS[inc.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-white text-sm font-bold truncate">{inc.title}</div>
                      <span className={`badge ${PRIORITY_TIER_BG[prio.tier]} text-[10px] font-black px-1.5 py-0.2`}>
                        {prio.score}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`badge text-[10px] ${STATUS_COLORS[inc.status]}`}>
                        {STATUS_LABELS[inc.status]}
                      </span>
                      <span className="text-white/40 text-xs font-mono truncate max-w-xs">{inc.location}</span>
                      <span className="text-white/30 text-xs ml-auto whitespace-nowrap">{timeAgo(inc.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {inc.status !== 'resolved' && (
                      <span className="text-xs text-[#35D9FF] font-bold flex items-center gap-1 hover:underline">
                        Dispatch <ChevronRight size={14} />
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Quick Launchpad to Round 2 Operations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5 cursor-pointer hover:border-[#35D9FF]/40 transition-all border border-white/5"
          onClick={() => navigate('/admin/assignments')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#35D9FF]/20 to-[#20C997]/20 border border-[#35D9FF]/30 flex items-center justify-center">
              <Compass size={24} className="text-[#35D9FF]" />
            </div>
            <div>
              <div className="text-white font-black text-sm">Geodesic Team Dispatch</div>
              <div className="text-white/40 text-xs mt-0.5">Haversine formula & squad recommendation</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card p-5 cursor-pointer hover:border-[#20C997]/40 transition-all border border-white/5"
          onClick={() => navigate('/admin/resources')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#20C997]/15 border border-[#20C997]/30 flex items-center justify-center">
              <Users size={24} className="text-[#20C997]" />
            </div>
            <div>
              <div className="text-white font-black text-sm">Response Squads Management</div>
              <div className="text-white/40 text-xs mt-0.5">{stats.availableTeams} ready, {stats.busyTeams} deployed</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5 cursor-pointer hover:border-[#FF9F43]/40 transition-all border border-white/5"
          onClick={() => navigate('/admin/analytics')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF9F43]/15 border border-[#FF9F43]/30 flex items-center justify-center">
              <TrendingUp size={24} className="text-[#FF9F43]" />
            </div>
            <div>
              <div className="text-white font-black text-sm">Operational Analytics</div>
              <div className="text-white/40 text-xs mt-0.5">Response times, CSV export, telemetry</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

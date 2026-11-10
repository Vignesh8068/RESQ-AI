import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  AlertTriangle, TrendingUp, Users, CheckCircle, Clock, Activity,
  Zap, Map, FileText, Bell, Shield, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SEVERITY_BG, STATUS_LABELS, STATUS_COLORS, timeAgo, CATEGORY_ICONS } from '../utils/constants';
import { Incident } from '../types';

function StatCard({ label, value, icon, color, sub }: { label: string; value: number; icon: React.ReactNode; color: string; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5"
        style={{ background: color, transform: 'translate(30%, -30%)' }} />
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg" style={{ background: `${color}15`, color }}>
          {icon}
        </div>
        {sub && <span className="text-white/30 text-xs">{sub}</span>}
      </div>
      <div className="text-4xl font-black text-white mb-1">{value}</div>
      <div className="text-white/50 text-sm">{label}</div>
    </motion.div>
  );
}

function CriticalIncidentCard({ incident, onVerify, onResolve }: {
  incident: Incident;
  onVerify: () => void;
  onResolve: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 rounded-xl border border-[#FF4057]/30 bg-[#FF4057]/5 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#FF4057]/5 to-transparent" />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="relative mt-1">
              <div className="w-3 h-3 bg-[#FF4057] rounded-full" />
              <div className="absolute inset-0 w-3 h-3 bg-[#FF4057] rounded-full animate-ping opacity-75" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">{incident.title}</div>
              <div className="text-white/50 text-xs mt-0.5">{incident.location} · {timeAgo(incident.createdAt)}</div>
            </div>
          </div>
          <span className={`badge ${SEVERITY_BG[incident.severity]} flex-shrink-0`}>{incident.severity}</span>
        </div>
        <div className="flex gap-2 mt-3">
          {incident.status === 'reported' && (
            <button onClick={onVerify} className="text-xs bg-[#35D9FF]/10 border border-[#35D9FF]/30 text-[#35D9FF] px-3 py-1.5 rounded-lg hover:bg-[#35D9FF]/20 transition-all">
              Verify
            </button>
          )}
          {incident.status !== 'resolved' && (
            <button onClick={onResolve} className="text-xs bg-[#20C997]/10 border border-[#20C997]/30 text-[#20C997] px-3 py-1.5 rounded-lg hover:bg-[#20C997]/20 transition-all">
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

  const criticalActive = state.incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved');
  const recentAll = [...state.incidents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);
  const availableTeams = state.teams.filter(t => t.status === 'available').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Shield size={28} className="text-[#35D9FF]" />
            <h1 className="text-3xl font-black text-white">Command Center</h1>
            <div className="flex items-center gap-1.5 bg-[#20C997]/10 border border-[#20C997]/30 px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-[#20C997] rounded-full animate-pulse" />
              <span className="text-[#20C997] text-xs font-semibold">LIVE</span>
            </div>
          </div>
          <p className="text-white/40">RESQ AI Emergency Response Operations</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/admin/incidents')} className="btn-cyan text-sm flex items-center gap-2">
            <FileText size={16} /> All Incidents
          </button>
          <button onClick={() => navigate('/map')} className="btn-primary text-sm flex items-center gap-2">
            <Map size={16} /> Live Map
          </button>
        </div>
      </motion.div>

      {/* Operational Mode Banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6">
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

      {/* Primary Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 border-[#35D9FF]/20 relative overflow-hidden">
          <div className="text-xs text-white/50 mb-1">Total Incidents Managed</div>
          <div className="text-3xl font-black text-[#35D9FF]">{stats.total}</div>
          <div className="text-[11px] text-white/30 mt-1">Actual incident record count</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass-card p-4 border-[#20C997]/20 relative overflow-hidden">
          <div className="text-xs text-white/50 mb-1">Lives Impacted</div>
          <div className="text-3xl font-black text-[#20C997]">{stats.livesImpacted}</div>
          <div className="text-[11px] text-white/30 mt-1">Sum of affected people (deduplicated)</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-4 border-[#FF9F43]/20 relative overflow-hidden">
          <div className="text-xs text-white/50 mb-1">Avg Response Time</div>
          <div className="text-3xl font-black text-[#FF9F43]">
            {stats.avgResponseTimeMinutes !== null ? `${stats.avgResponseTimeMinutes}m` : 'N/A'}
          </div>
          <div className="text-[11px] text-white/30 mt-1">Calculated from dispatch intervals</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card p-4 border-purple-500/20 relative overflow-hidden">
          <div className="text-xs text-white/50 mb-1">AI Triage Accuracy</div>
          <div className="text-sm font-bold text-purple-300 py-1.5">{stats.aiAccuracy}</div>
          <div className="text-[11px] text-white/30 mt-1">Pending verified evaluation dataset</div>
        </motion.div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, icon: <Activity size={18} />, color: '#35D9FF' },
          { label: 'Critical', value: stats.critical, icon: <AlertTriangle size={18} />, color: '#FF4057' },
          { label: 'High', value: stats.high, icon: <TrendingUp size={18} />, color: '#FF9F43' },
          { label: 'Pending', value: stats.pending, icon: <Clock size={18} />, color: '#FFD93D' },
          { label: 'In Progress', value: stats.inProgress, icon: <Zap size={18} />, color: '#8B5CF6' },
          { label: 'Resolved', value: stats.resolved, icon: <CheckCircle size={18} />, color: '#20C997' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass-card p-4 text-center relative overflow-hidden">
            <div className="flex justify-center mb-2" style={{ color: s.color }}>{s.icon}</div>
            <div className="text-3xl font-black text-white">{s.value}</div>
            <div className="text-white/40 text-xs mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Alerts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-1 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <div className="relative">
                <AlertTriangle size={18} className="text-[#FF4057]" />
                {criticalActive.length > 0 && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF4057] rounded-full animate-pulse" />}
              </div>
              Critical Alerts
              <span className="bg-[#FF4057]/20 text-[#FF4057] text-xs px-2 py-0.5 rounded-full">{criticalActive.length}</span>
            </h3>
          </div>
          <div className="space-y-3">
            {criticalActive.length === 0 ? (
              <div className="text-center py-8 text-white/30">
                <CheckCircle size={28} className="mx-auto mb-2" />
                <p className="text-sm">No active critical incidents</p>
              </div>
            ) : (
              criticalActive.slice(0, 4).map(inc => (
                <CriticalIncidentCard
                  key={inc.id}
                  incident={inc}
                  onVerify={() => updateIncidentStatus(inc.id, 'verified', state.user?.name)}
                  onResolve={() => updateIncidentStatus(inc.id, 'resolved', state.user?.name)}
                />
              ))
            )}
          </div>
          {criticalActive.length > 4 && (
            <button onClick={() => navigate('/admin/incidents')} className="w-full text-center text-[#35D9FF] text-xs mt-3 hover:underline">
              View all {criticalActive.length} critical incidents
            </button>
          )}
        </motion.div>

        {/* Recent Feed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Activity size={18} className="text-[#35D9FF]" /> Live Incident Feed
            </h3>
            <button onClick={() => navigate('/admin/incidents')} className="text-[#35D9FF] text-xs hover:underline flex items-center gap-1">
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {recentAll.map((inc, i) => (
              <motion.div key={inc.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => navigate('/admin/incidents')}>
                <div className="text-xl flex-shrink-0">{CATEGORY_ICONS[inc.category]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white/80 text-sm font-medium truncate">{inc.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`badge text-[10px] ${SEVERITY_BG[inc.severity]}`}>{inc.severity}</span>
                    <span className={`badge text-[10px] ${STATUS_COLORS[inc.status]}`}>{STATUS_LABELS[inc.status]}</span>
                    <span className="text-white/30 text-xs">{timeAgo(inc.createdAt)}</span>
                  </div>
                </div>
                {inc.isDemo && <span className="badge text-[9px] bg-yellow-500/10 text-yellow-400 border-yellow-500/20 flex-shrink-0">DEMO</span>}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#20C997]/10 flex items-center justify-center">
            <Users size={22} className="text-[#20C997]" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{availableTeams}</div>
            <div className="text-white/50 text-sm">Teams Available</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
          className="glass-card p-5 flex items-center gap-4 cursor-pointer hover:border-[#35D9FF]/20 transition-all"
          onClick={() => navigate('/admin/copilot')}>
          <div className="w-12 h-12 rounded-xl bg-[#35D9FF]/10 flex items-center justify-center">
            <Activity size={22} className="text-[#35D9FF]" />
          </div>
          <div>
            <div className="text-white font-bold">AI Copilot</div>
            <div className="text-white/40 text-sm">RESQ Intelligence ready</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="glass-card p-5 flex items-center gap-4 cursor-pointer hover:border-[#FF9F43]/20 transition-all"
          onClick={() => navigate('/admin/analytics')}>
          <div className="w-12 h-12 rounded-xl bg-[#FF9F43]/10 flex items-center justify-center">
            <TrendingUp size={22} className="text-[#FF9F43]" />
          </div>
          <div>
            <div className="text-white font-bold">Analytics</div>
            <div className="text-white/40 text-sm">View incident reports</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

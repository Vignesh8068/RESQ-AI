import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, Phone, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ResponseTeam, ResourceStatus } from '../types';
import { RESOURCE_LABELS, RESOURCE_ICONS } from '../utils/constants';

const STATUS_BADGE: Record<ResourceStatus, string> = {
  available: 'bg-[#20C997]/10 text-[#20C997] border-[#20C997]/30',
  assigned: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  offline: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
};

export function ResourceManagement() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState<ResourceStatus | 'all'>('all');

  const filtered = state.teams.filter(t => filter === 'all' || t.status === filter);

  const counts = {
    available: state.teams.filter(t => t.status === 'available').length,
    assigned: state.teams.filter(t => t.status === 'assigned').length,
    offline: state.teams.filter(t => t.status === 'offline').length,
  };

  const setAvailable = (team: ResponseTeam) => {
    dispatch({ type: 'UPDATE_TEAM', payload: { ...team, status: 'available', currentAssignment: undefined } });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1">Resource Management</h1>
        <p className="text-white/40 text-sm">Response team availability and assignments</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Available', value: counts.available, color: '#20C997' },
          { label: 'Assigned', value: counts.assigned, color: '#FF9F43' },
          { label: 'Offline', value: counts.offline, color: '#6B7280' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card p-4 text-center">
            <div className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-white/50 text-sm">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {(['all', 'available', 'assigned', 'offline'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f ? 'bg-[#35D9FF]/20 text-[#35D9FF] border border-[#35D9FF]/30' : 'bg-white/5 text-white/50 hover:text-white'
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Team cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((team, i) => (
          <motion.div key={team.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card-hover p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{RESOURCE_ICONS[team.type]}</div>
                <div>
                  <div className="text-white font-bold">{team.name}</div>
                  <div className="text-white/50 text-sm">{RESOURCE_LABELS[team.type]}</div>
                </div>
              </div>
              <span className={`badge ${STATUS_BADGE[team.status]}`}>{team.status}</span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <MapPin size={13} className="text-[#35D9FF]" />
                {team.location}
              </div>
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Users size={13} className="text-[#20C997]" />
                {team.members} members
              </div>
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Phone size={13} className="text-[#FF9F43]" />
                {team.contact}
              </div>
              {team.currentAssignment && (
                <div className="text-white/40 text-xs bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-lg">
                  Assigned to: {team.currentAssignment}
                </div>
              )}
              {team.isDemo && (
                <div className="text-yellow-400/60 text-xs">DEMO DATA</div>
              )}
            </div>

            {team.status === 'assigned' && (
              <button onClick={() => setAvailable(team)}
                className="w-full text-sm py-2 bg-[#20C997]/10 border border-[#20C997]/30 text-[#20C997] rounded-xl hover:bg-[#20C997]/20 transition-all flex items-center justify-center gap-2">
                <CheckCircle size={14} /> Mark Available
              </button>
            )}
            {team.status === 'offline' && (
              <button onClick={() => dispatch({ type: 'UPDATE_TEAM', payload: { ...team, status: 'available' } })}
                className="w-full text-sm py-2 bg-white/5 border border-white/10 text-white/50 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <CheckCircle size={14} /> Set Online
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

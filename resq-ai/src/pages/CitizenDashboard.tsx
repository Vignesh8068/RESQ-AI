import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, FileText, Map, Bell, TrendingUp, Clock, CheckCircle, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SEVERITY_BG, STATUS_LABELS, STATUS_COLORS, CATEGORY_LABELS, timeAgo } from '../utils/constants';

export function CitizenDashboard() {
  const { state, stats } = useApp();
  const navigate = useNavigate();
  const myReports = state.incidents.filter(i => !i.isDemo);

  const cards = [
    { label: 'My Reports', value: myReports.length, icon: <FileText size={20} />, color: '#35D9FF', path: '/my-reports' },
    { label: 'Active Incidents', value: stats.inProgress, icon: <AlertTriangle size={20} />, color: '#FF9F43', path: '/map' },
    { label: 'Critical Alerts', value: stats.critical, icon: <Shield size={20} />, color: '#FF4057', path: '/map' },
    { label: 'Resolved Today', value: stats.resolved, icon: <CheckCircle size={20} />, color: '#20C997', path: '/my-reports' },
  ];

  const recentNotifs = state.notifications.filter(n => !n.read).slice(0, 3);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">
          Welcome, <span className="gradient-text-cyan">{state.user?.name}</span>
        </h1>
        <p className="text-white/40">Your emergency reporting dashboard</p>
      </motion.div>

      {/* SOS Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8 p-6 rounded-2xl relative overflow-hidden cursor-pointer"
        onClick={() => navigate('/report')}
        style={{
          background: 'linear-gradient(135deg, rgba(255,64,87,0.15) 0%, rgba(255,159,67,0.1) 100%)',
          border: '1px solid rgba(255,64,87,0.3)',
          boxShadow: '0 0 40px rgba(255,64,87,0.1)',
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,64,87,0.1) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-[#FF4057] flex items-center justify-center">
                  <AlertTriangle size={20} className="text-white" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-[#FF4057]/30 animate-ping" />
              </div>
              <div>
                <div className="text-white font-black text-xl">🚨 Emergency? Report Now</div>
                <div className="text-white/50 text-sm">Tap to submit an emergency report with GPS location</div>
              </div>
            </div>
          </div>
          <button className="btn-primary flex items-center gap-2 text-sm flex-shrink-0">
            <AlertTriangle size={16} /> Report
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.2 }}
            className="glass-card-hover p-5 cursor-pointer"
            onClick={() => navigate(card.path)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg" style={{ background: `${card.color}15`, color: card.color }}>
                {card.icon}
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-1">{card.value}</div>
            <div className="text-white/50 text-sm">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2"><Clock size={18} className="text-[#35D9FF]" /> Recent Incidents</h3>
            <button onClick={() => navigate('/map')} className="text-[#35D9FF] text-xs hover:underline">View Map</button>
          </div>
          <div className="space-y-3">
            {state.incidents.slice(0, 4).map(inc => (
              <div key={inc.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                <div className={`badge mt-0.5 ${SEVERITY_BG[inc.severity]}`}>
                  {inc.severity}
                </div>
                <div className="min-w-0">
                  <div className="text-white/80 text-sm font-medium truncate">{inc.title}</div>
                  <div className="text-white/40 text-xs flex items-center gap-2">
                    <span className={`badge text-[10px] ${STATUS_COLORS[inc.status]}`}>{STATUS_LABELS[inc.status]}</span>
                    <span>{timeAgo(inc.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Alerts & Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2"><Bell size={18} className="text-[#FF9F43]" /> Alerts</h3>
            <button onClick={() => navigate('/notifications')} className="text-[#35D9FF] text-xs hover:underline">View all</button>
          </div>
          {recentNotifs.length === 0 ? (
            <div className="text-center py-8 text-white/30">
              <Bell size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No new alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotifs.map(n => (
                <div key={n.id} className={`p-3 rounded-xl border ${
                  n.type === 'critical' ? 'bg-red-500/5 border-red-500/20' :
                  n.type === 'warning' ? 'bg-orange-500/5 border-orange-500/20' :
                  'bg-blue-500/5 border-blue-500/20'
                }`}>
                  <div className="text-white/90 text-sm font-medium">{n.title}</div>
                  <div className="text-white/50 text-xs mt-0.5 line-clamp-2">{n.message}</div>
                  <div className="text-white/30 text-xs mt-1">{timeAgo(n.createdAt)}</div>
                </div>
              ))}
            </div>
          )}

          {/* Quick links */}
          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
            <button onClick={() => navigate('/report')} className="btn-primary text-xs py-2 flex items-center justify-center gap-1">
              <AlertTriangle size={13} /> Report
            </button>
            <button onClick={() => navigate('/map')} className="btn-cyan text-xs py-2 flex items-center justify-center gap-1">
              <Map size={13} /> Live Map
            </button>
          </div>
        </motion.div>
      </div>

      {/* Category overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6 mt-6">
        <h3 className="font-bold text-white flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-[#20C997]" /> Active Emergency Categories
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { emoji: '🔥', label: 'Fire', count: state.incidents.filter(i => i.category === 'fire').length },
            { emoji: '🚗', label: 'Road', count: state.incidents.filter(i => i.category === 'road_accident').length },
            { emoji: '🏥', label: 'Medical', count: state.incidents.filter(i => i.category === 'medical').length },
            { emoji: '🌊', label: 'Flood', count: state.incidents.filter(i => i.category === 'flood').length },
            { emoji: '🏚️', label: 'Collapse', count: state.incidents.filter(i => i.category === 'building_collapse').length },
            { emoji: '⚠️', label: 'Other', count: state.incidents.filter(i => i.category === 'other').length },
          ].map((cat, i) => (
            <div key={i} className="text-center p-3 glass-card">
              <div className="text-2xl mb-1">{cat.emoji}</div>
              <div className="text-white font-bold">{cat.count}</div>
              <div className="text-white/40 text-xs">{cat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

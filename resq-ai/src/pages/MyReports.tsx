import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SEVERITY_BG, STATUS_LABELS, STATUS_COLORS, CATEGORY_LABELS, timeAgo } from '../utils/constants';
import { CATEGORY_ICONS } from '../utils/constants';

export function MyReports() {
  const { state } = useApp();
  const navigate = useNavigate();
  const myReports = state.incidents.filter(i => !i.isDemo);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">My Reports</h1>
          <p className="text-white/40 text-sm">{myReports.length} report{myReports.length !== 1 ? 's' : ''} submitted</p>
        </div>
        <button onClick={() => navigate('/report')} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Report
        </button>
      </motion.div>

      {myReports.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-16 text-center">
          <FileText size={48} className="text-white/20 mx-auto mb-4" />
          <h3 className="text-white/60 font-semibold mb-2">No reports yet</h3>
          <p className="text-white/30 text-sm mb-6">Your submitted emergency reports will appear here</p>
          <button onClick={() => navigate('/report')} className="btn-primary flex items-center gap-2 mx-auto">
            <Plus size={16} /> Submit First Report
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {myReports.map((inc, i) => (
            <motion.div
              key={inc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card-hover p-5"
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl">{CATEGORY_ICONS[inc.category]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-white font-semibold truncate">{inc.title}</span>
                    {inc.isDemo && <span className="badge bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[10px]">DEMO</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`badge ${SEVERITY_BG[inc.severity]}`}>{inc.severity}</span>
                    <span className={`badge ${STATUS_COLORS[inc.status]}`}>{STATUS_LABELS[inc.status]}</span>
                    <span className="text-white/30 text-xs">{timeAgo(inc.createdAt)}</span>
                  </div>
                  <div className="text-white/50 text-sm line-clamp-2">{inc.description}</div>
                  <div className="mt-2 text-white/30 text-xs">📍 {inc.location}</div>
                </div>
                <div className="flex-shrink-0 font-mono text-xs text-[#35D9FF]/60 bg-[#35D9FF]/5 px-2 py-1 rounded-lg">
                  {inc.id}
                </div>
              </div>
              {inc.assignedTeamName && (
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-white/40">
                  <span>👥 Assigned:</span>
                  <span className="text-[#35D9FF]">{inc.assignedTeamName}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

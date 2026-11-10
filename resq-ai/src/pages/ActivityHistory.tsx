import { useState } from 'react';
import { motion } from 'framer-motion';
import { History, Search, Download, Clock, User, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { timeAgo } from '../utils/constants';

export function ActivityHistory() {
  const { state } = useApp();
  const [query, setQuery] = useState('');

  const allHistory = [...(state.history ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filtered = query.trim()
    ? allHistory.filter((h) => {
        const q = query.toLowerCase();
        return (
          h.action.toLowerCase().includes(q) ||
          h.details.toLowerCase().includes(q) ||
          h.performedBy.toLowerCase().includes(q) ||
          h.incidentId.toLowerCase().includes(q)
        );
      })
    : allHistory;

  // Group by incidentId preserving newest-first order of first occurrence
  const groupOrder: string[] = [];
  const groups: Record<string, typeof filtered> = {};
  for (const entry of filtered) {
    if (!groups[entry.incidentId]) {
      groups[entry.incidentId] = [];
      groupOrder.push(entry.incidentId);
    }
    groups[entry.incidentId].push(entry);
  }

  const handleExportCSV = () => {
    const headers = ['ID', 'IncidentID', 'Action', 'Details', 'PerformedBy', 'CreatedAt'];
    const rows = filtered.map((h) =>
      [h.id, h.incidentId, h.action, h.details, h.performedBy, h.createdAt]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resq-activity-history-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A78BFA]/20 to-[#A78BFA]/5 border border-[#A78BFA]/30 flex items-center justify-center">
            <History size={22} className="text-[#A78BFA]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Activity History</h1>
            <p className="text-white/40 text-xs">Full audit trail of all incident actions</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-white/30 text-xs">{filtered.length} entries</span>
          <button
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A78BFA]/15 hover:bg-[#A78BFA]/25 border border-[#A78BFA]/30 text-[#A78BFA] text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
      >
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by action, details, performed by, or incident ID…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm outline-none focus:border-[#A78BFA]/50 focus:bg-white/8 transition-all"
          />
        </div>
      </motion.div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-16 text-center"
        >
          <History size={48} className="mx-auto mb-3 text-white/15" />
          <p className="text-white/40 text-sm">
            {query ? 'No entries match your search.' : 'No activity history recorded yet.'}
          </p>
        </motion.div>
      )}

      {/* Grouped Timeline */}
      <div className="space-y-8">
        {groupOrder.map((incidentId, gi) => {
          const entries = groups[incidentId];
          const incident = state.incidents.find((i) => i.id === incidentId);

          return (
            <motion.div
              key={incidentId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.04 }}
            >
              {/* Incident Group Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#A78BFA]/10 border border-[#A78BFA]/20">
                  <FileText size={13} className="text-[#A78BFA]" />
                  <span className="text-[#A78BFA] font-bold text-xs">{incidentId}</span>
                </div>
                {incident && (
                  <span className="text-white/50 text-xs truncate">{incident.title}</span>
                )}
                <span className="ml-auto text-white/25 text-xs">{entries.length} events</span>
              </div>

              {/* Timeline Entries */}
              <div className="relative ml-2">
                {/* Vertical line */}
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-white/8" />

                <div className="space-y-3">
                  {entries.map((entry, ei) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: gi * 0.04 + ei * 0.03 }}
                      className="flex items-start gap-4"
                    >
                      {/* Timeline dot */}
                      <div className="relative z-10 mt-3.5 w-7 h-7 rounded-full bg-[#080F1E] border border-[#A78BFA]/40 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-[#A78BFA]" />
                      </div>

                      {/* Card */}
                      <div className="flex-1 glass-card p-4 hover:border-white/15 transition-all">
                        <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                          <span className="font-bold text-white text-sm">{entry.action}</span>
                          <div className="flex items-center gap-1 text-white/35 text-xs">
                            <Clock size={11} />
                            <span>{timeAgo(entry.createdAt)}</span>
                          </div>
                        </div>

                        <p className="text-white/60 text-xs leading-relaxed mb-3">
                          {entry.details}
                        </p>

                        <div className="flex items-center gap-1.5 text-white/40 text-xs">
                          <User size={11} className="text-[#35D9FF]" />
                          <span className="text-[#35D9FF] font-semibold">{entry.performedBy}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Eye, CheckCircle, Trash2, X,
  AlertTriangle, Clock, MapPin, User, Phone, Sparkles,
  Compass, ArrowUpDown, ChevronRight, Activity, ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Incident, IncidentStatus, PriorityTier } from '../types';
import {
  SEVERITY_BG, STATUS_LABELS, STATUS_COLORS, CATEGORY_LABELS,
  CATEGORY_ICONS, PRIORITY_TIER_BG, PRIORITY_TIER_COLORS,
  timeAgo, formatDate
} from '../utils/constants';
import { calculateIncidentPriority } from '../services/prioritizationEngine';

function IncidentDetailModal({
  incident,
  onClose,
  onUpdateStatus,
  onAssignTeam,
  onOpenDispatch
}: {
  incident: Incident;
  onClose: () => void;
  onUpdateStatus: (status: IncidentStatus) => void;
  onAssignTeam: (teamId: string) => void;
  onOpenDispatch: () => void;
}) {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<'details' | 'priority' | 'history'>('priority');
  
  // Calculate explainable priority score breakdown
  const priorityResult = calculateIncidentPriority(incident);
  const availableTeams = state.teams.filter(t => t.status === 'available');
  const incHistory = state.history.filter(h => h.incidentId === incident.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card w-full max-w-3xl max-h-[92vh] overflow-y-auto custom-scroll border border-white/10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-[#101B30]/60">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-2xl p-2 rounded-xl bg-white/5 border border-white/10">{CATEGORY_ICONS[incident.category]}</span>
              <div>
                <h2 className="text-white font-extrabold text-lg flex items-center gap-2">
                  {incident.title}
                  {incident.isDemo && (
                    <span className="badge bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[10px]">DEMO DATA</span>
                  )}
                </h2>
                <div className="text-white/40 text-xs font-mono">{incident.id}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {/* Priority Tier Badge */}
              <span className={`badge ${PRIORITY_TIER_BG[priorityResult.tier]} font-black text-xs px-2.5 py-1`}>
                ⚡ {priorityResult.tier.toUpperCase()} PRIORITY ({priorityResult.score}/100)
              </span>
              <span className={`badge ${SEVERITY_BG[incident.severity]}`}>{incident.severity.toUpperCase()}</span>
              <span className={`badge ${STATUS_COLORS[incident.status]}`}>{STATUS_LABELS[incident.status]}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 px-6 bg-[#080F1E]/50">
          <button
            onClick={() => setActiveTab('priority')}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'priority'
                ? 'border-[#35D9FF] text-[#35D9FF] bg-[#35D9FF]/5'
                : 'border-transparent text-white/40 hover:text-white/80'
            }`}
          >
            <Sparkles size={14} /> AI Priority Engine (Feature 1)
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'details'
                ? 'border-[#35D9FF] text-[#35D9FF] bg-[#35D9FF]/5'
                : 'border-transparent text-white/40 hover:text-white/80'
            }`}
          >
            <Eye size={14} /> Incident Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-[#35D9FF] text-[#35D9FF] bg-[#35D9FF]/5'
                : 'border-transparent text-white/40 hover:text-white/80'
            }`}
          >
            <Clock size={14} /> Operational Audit Log
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6">
          {activeTab === 'priority' && (
            <div className="space-y-6">
              {/* Highlight Score Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#101B30] to-[#0D1829] border border-white/10 relative overflow-hidden">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">Explainable Priority Engine Score</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-white">{priorityResult.score}</span>
                      <span className="text-white/40 text-sm">/ 100</span>
                      <span className={`ml-3 badge ${PRIORITY_TIER_BG[priorityResult.tier]} font-black`}>
                        {priorityResult.urgencyBadge}
                      </span>
                    </div>
                    <p className="text-white/60 text-xs mt-2 max-w-md">
                      Calculated dynamically using transparent multi-factor weighted evaluation (Severity, Affected Lives, Category Hazard, Aging & Status).
                    </p>
                  </div>

                  {/* Launch Smart Dispatch CTA */}
                  {incident.status !== 'resolved' && (
                    <button
                      onClick={onOpenDispatch}
                      className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#35D9FF] to-[#20C997] text-[#080F1E] font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all"
                    >
                      <Compass size={18} />
                      Recommend Nearest Squad
                    </button>
                  )}
                </div>
              </div>

              {/* Factors Breakdown */}
              <div>
                <h4 className="text-white/80 font-bold text-sm mb-3 flex items-center gap-2">
                  <Activity size={15} className="text-[#35D9FF]" />
                  Weighted Factor Scoring Breakdown
                </h4>
                <div className="space-y-3">
                  {priorityResult.factors.map((factor, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-white font-semibold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#35D9FF]" />
                          {factor.name} <span className="text-white/40">(max {factor.maxScore} pts)</span>
                        </span>
                        <span className="font-mono font-bold text-[#35D9FF]">
                          {factor.score} / {factor.maxScore} pts
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
                        <div
                          className="h-full bg-gradient-to-r from-[#35D9FF] to-[#20C997] rounded-full"
                          style={{ width: `${(factor.score / factor.maxScore) * 100}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-white/50">{factor.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explainable Reasons */}
              <div>
                <h4 className="text-white/80 font-bold text-sm mb-3 flex items-center gap-2">
                  <ShieldAlert size={15} className="text-[#FF9F43]" />
                  Transparent Priority Justification Reasons
                </h4>
                <div className="space-y-2">
                  {priorityResult.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/3 border border-white/5 text-xs text-white/80">
                      <span className="text-[#35D9FF] font-bold">✓</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-white/40 text-xs uppercase tracking-wider mb-2 font-bold">Incident Summary</h4>
                <p className="text-white/90 text-sm leading-relaxed p-4 rounded-xl bg-white/5 border border-white/5">
                  {incident.description}
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-white/40 text-[11px] mb-1">Category</div>
                  <div className="text-white font-semibold text-sm">{CATEGORY_LABELS[incident.category]}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-white/40 text-[11px] mb-1">Affected People</div>
                  <div className="text-white font-semibold text-sm text-[#FF4057]">{incident.affectedPeople} Individuals</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-white/40 text-[11px] mb-1 flex items-center gap-1"><MapPin size={11} />Location</div>
                  <div className="text-white font-semibold text-sm truncate" title={incident.location}>{incident.location}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-white/40 text-[11px] mb-1 flex items-center gap-1"><Clock size={11} />Reported</div>
                  <div className="text-white font-semibold text-sm">{timeAgo(incident.createdAt)}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-white/40 text-[11px] mb-1 flex items-center gap-1"><User size={11} />Reporter</div>
                  <div className="text-white font-semibold text-sm truncate">{incident.reporterName}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-white/40 text-[11px] mb-1 flex items-center gap-1"><Phone size={11} />Contact</div>
                  <div className="text-white font-semibold text-sm">{incident.reporterPhone}</div>
                </div>
              </div>

              {/* AI Analysis / Gemini Triage */}
              {incident.aiAnalysis && (
                <div className="bg-[#35D9FF]/5 border border-[#35D9FF]/20 rounded-xl p-4">
                  <div className="text-[#35D9FF] text-sm font-semibold mb-2 flex items-center gap-2">
                    <Sparkles size={16} /> RESQ Intelligence Copilot Analysis
                  </div>
                  <p className="text-white/80 text-sm mb-3">{incident.aiAnalysis.summary}</p>
                  <div className="space-y-1">
                    {incident.aiAnalysis.riskIndicators.map((r, i) => (
                      <div key={i} className="text-white/60 text-xs flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#FF4057] rounded-full" />
                        {r}
                      </div>
                    ))}
                  </div>
                  {incident.aiAnalysis.method === 'rule_based' && (
                    <div className="mt-3 text-yellow-400/80 text-xs">ℹ️ Rule-based fallback analysis active. Add Gemini API credentials in .env for full LLM multimodal triage.</div>
                  )}
                </div>
              )}

              {/* Photo */}
              {incident.imageUrl && (
                <div>
                  <h4 className="text-white/40 text-xs uppercase tracking-wider mb-2 font-bold">Evidence Photo</h4>
                  <img src={incident.imageUrl} alt="Incident Site Evidence" className="rounded-xl max-h-48 w-full object-cover border border-white/10" />
                </div>
              )}

              {/* Action Controls */}
              <div className="pt-2">
                <h4 className="text-white/40 text-xs uppercase tracking-wider mb-3 font-bold">Dispatcher Lifecycle Controls</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {incident.status === 'reported' && (
                    <button
                      onClick={() => onUpdateStatus('verified')}
                      className="btn-cyan text-xs py-2.5 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={15} /> Verify Incident
                    </button>
                  )}
                  {incident.status !== 'in_progress' && incident.status !== 'resolved' && (
                    <button
                      onClick={() => onUpdateStatus('in_progress')}
                      className="bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 rounded-xl text-xs py-2.5 flex items-center justify-center gap-2 transition-all"
                    >
                      <AlertTriangle size={15} /> Set In Progress
                    </button>
                  )}
                  {incident.status !== 'resolved' && (
                    <button
                      onClick={() => onUpdateStatus('resolved')}
                      className="text-xs py-2.5 flex items-center justify-center gap-2 bg-[#20C997]/15 border border-[#20C997]/40 text-[#20C997] rounded-xl hover:bg-[#20C997]/25 transition-all font-bold"
                    >
                      <CheckCircle size={15} /> Complete & Resolve
                    </button>
                  )}
                  <button
                    onClick={onOpenDispatch}
                    className="col-span-full py-2.5 rounded-xl bg-gradient-to-r from-[#35D9FF]/20 to-[#20C997]/20 border border-[#35D9FF]/40 text-[#35D9FF] hover:bg-[#35D9FF]/30 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Compass size={15} /> Smart Geodesic Dispatch Center (Haversine Recommendation)
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h4 className="text-white/80 font-bold text-sm mb-3">Incident Operational Audit Timeline</h4>
              {incHistory.length > 0 ? (
                <div className="space-y-3">
                  {incHistory.map((h, i) => (
                    <div key={h.id || i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 bg-[#35D9FF] rounded-full mt-1.5 shadow-glow-cyan" />
                        {i < incHistory.length - 1 && <div className="w-px flex-1 bg-white/10 mt-1" />}
                      </div>
                      <div className="pb-3 flex-1 bg-white/3 p-3 rounded-xl border border-white/5">
                        <div className="text-white text-sm font-semibold">{h.action}</div>
                        <div className="text-white/60 text-xs mt-0.5">{h.details}</div>
                        <div className="text-white/30 text-[11px] mt-1 font-mono">{h.performedBy} · {timeAgo(h.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/30">
                  <Clock size={24} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No audit events logged yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function IncidentManagement() {
  const { state, updateIncidentStatus, dispatch } = useApp();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'affected'>('priority');
  const [selected, setSelected] = useState<Incident | null>(null);

  // Filter incidents
  const filtered = state.incidents.filter(inc => {
    const matchSearch = !search ||
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.description.toLowerCase().includes(search.toLowerCase()) ||
      inc.location.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = filterSeverity === 'all' || inc.severity === filterSeverity;
    const matchStatus = filterStatus === 'all' || inc.status === filterStatus;
    const matchCat = filterCategory === 'all' || inc.category === filterCategory;
    const matchTier = filterTier === 'all' || (inc.priorityTier || 'medium') === filterTier;
    return matchSearch && matchSeverity && matchStatus && matchCat && matchTier;
  });

  // Sort incidents
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'priority') {
      const pA = a.priorityScore ?? calculateIncidentPriority(a).score;
      const pB = b.priorityScore ?? calculateIncidentPriority(b).score;
      return pB - pA;
    } else if (sortBy === 'affected') {
      return b.affectedPeople - a.affectedPeople;
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black text-white">Incident Queue & Prioritization</h1>
            <span className="badge bg-[#35D9FF]/10 text-[#35D9FF] border-[#35D9FF]/30 text-xs font-bold">
              ROUND 2 AI ENGINE
            </span>
          </div>
          <p className="text-white/40 text-sm">
            {sorted.length} of {state.incidents.length} incidents ranked by explainable urgency algorithm
          </p>
        </div>

        {/* Action Button: Smart Dispatch */}
        <button
          onClick={() => navigate('/admin/assignments')}
          className="btn-cyan text-sm flex items-center gap-2 py-2.5 px-4 shadow-lg shadow-cyan-500/20"
        >
          <Compass size={16} /> Open Smart Dispatch Center
        </button>
      </motion.div>

      {/* Filter & Sort Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 mb-6 flex flex-wrap gap-3 items-center"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-56">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search incident, title, location..."
            className="input-field pl-9 py-2.5 text-sm"
          />
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-1">
          <ArrowUpDown size={14} className="text-[#35D9FF]" />
          <span className="text-[11px] text-white/40 font-bold">Sort:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer py-1.5"
          >
            <option value="priority" className="bg-[#101B30] text-white">AI Priority (0–100 High First)</option>
            <option value="time" className="bg-[#101B30] text-white">Reported Time (Newest First)</option>
            <option value="affected" className="bg-[#101B30] text-white">Lives Affected (Highest First)</option>
          </select>
        </div>

        {/* Priority Tier Filter */}
        <select
          value={filterTier}
          onChange={e => setFilterTier(e.target.value)}
          className="input-field py-2.5 text-xs w-auto font-semibold"
        >
          <option value="all">All AI Tiers</option>
          <option value="critical">⚡ Critical Urgency</option>
          <option value="high">🔥 High Urgency</option>
          <option value="medium">⚠️ Medium Urgency</option>
          <option value="low">🌱 Low Urgency</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="input-field py-2.5 text-xs w-auto font-semibold"
        >
          <option value="all">All Statuses</option>
          <option value="reported">Reported</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="input-field py-2.5 text-xs w-auto font-semibold"
        >
          <option value="all">All Categories</option>
          <option value="fire">Fire</option>
          <option value="road_accident">Road Accident</option>
          <option value="medical">Medical</option>
          <option value="flood">Flood</option>
          <option value="building_collapse">Building Collapse</option>
          <option value="other">Other</option>
        </select>
      </motion.div>

      {/* Incident Queue Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card overflow-hidden border border-white/10"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/3">
                <th className="px-4 py-3.5 text-white/40 text-[11px] font-extrabold uppercase tracking-wider">AI Priority</th>
                <th className="px-4 py-3.5 text-white/40 text-[11px] font-extrabold uppercase tracking-wider">Incident</th>
                <th className="px-4 py-3.5 text-white/40 text-[11px] font-extrabold uppercase tracking-wider">Category</th>
                <th className="px-4 py-3.5 text-white/40 text-[11px] font-extrabold uppercase tracking-wider">Severity</th>
                <th className="px-4 py-3.5 text-white/40 text-[11px] font-extrabold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 text-white/40 text-[11px] font-extrabold uppercase tracking-wider">Affected</th>
                <th className="px-4 py-3.5 text-white/40 text-[11px] font-extrabold uppercase tracking-wider">Reported</th>
                <th className="px-4 py-3.5 text-white/40 text-[11px] font-extrabold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((inc, i) => {
                const prio = calculateIncidentPriority(inc);
                const isCriticalActive = prio.tier === 'critical' && inc.status !== 'resolved';

                return (
                  <motion.tr
                    key={inc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                      isCriticalActive ? 'bg-[#FF4057]/5' : ''
                    }`}
                    onClick={() => setSelected(inc)}
                  >
                    {/* Priority Score Column */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`badge ${PRIORITY_TIER_BG[prio.tier]} font-black text-xs px-2 py-0.5 min-w-[50px] text-center`}>
                          {prio.score}
                        </span>
                        {isCriticalActive && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Incident Title & ID */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-white text-sm font-semibold max-w-xs truncate flex items-center gap-1.5">
                            {inc.title}
                            {inc.isDemo && (
                              <span className="text-[9px] bg-yellow-500/20 text-yellow-300 px-1 py-0.2 rounded">DEMO</span>
                            )}
                          </div>
                          <div className="text-white/40 text-xs font-mono truncate max-w-xs">{inc.location}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-white/80 flex items-center gap-1.5 whitespace-nowrap">
                        <span>{CATEGORY_ICONS[inc.category]}</span>
                        {CATEGORY_LABELS[inc.category]}
                      </span>
                    </td>

                    {/* Severity */}
                    <td className="px-4 py-3.5">
                      <span className={`badge ${SEVERITY_BG[inc.severity]} text-xs`}>
                        {inc.severity}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span className={`badge ${STATUS_COLORS[inc.status]} text-xs`}>
                        {STATUS_LABELS[inc.status]}
                      </span>
                    </td>

                    {/* Affected People */}
                    <td className="px-4 py-3.5">
                      <span className="text-white font-mono text-xs font-semibold">
                        {inc.affectedPeople}
                      </span>
                    </td>

                    {/* Reported Timestamp */}
                    <td className="px-4 py-3.5">
                      <span className="text-white/50 text-xs whitespace-nowrap">
                        {timeAgo(inc.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Smart Dispatch Button */}
                        {inc.status !== 'resolved' && (
                          <button
                            onClick={() => navigate(`/admin/assignments?incidentId=${inc.id}`)}
                            className="px-2.5 py-1 rounded-lg bg-[#35D9FF]/15 text-[#35D9FF] hover:bg-[#35D9FF]/25 border border-[#35D9FF]/30 text-xs font-bold flex items-center gap-1 transition-all"
                            title="Open Smart Geodesic Dispatch Recommendation"
                          >
                            <Compass size={13} /> Dispatch
                          </button>
                        )}

                        <button
                          onClick={() => setSelected(inc)}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                          title="View Score & Incident Details"
                        >
                          <Eye size={15} />
                        </button>

                        {inc.status !== 'resolved' && (
                          <button
                            onClick={() => updateIncidentStatus(inc.id, 'resolved', state.user?.name)}
                            className="p-1.5 hover:bg-[#20C997]/15 rounded-lg text-white/50 hover:text-[#20C997] transition-colors"
                            title="Mark as Resolved (frees assigned squad)"
                          >
                            <CheckCircle size={15} />
                          </button>
                        )}

                        {!inc.isDemo && (
                          <button
                            onClick={() => dispatch({ type: 'DELETE_INCIDENT', payload: inc.id })}
                            className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/30 hover:text-[#FF4057] transition-colors"
                            title="Delete record"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {sorted.length === 0 && (
            <div className="text-center py-16 text-white/30">
              <Search size={32} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">No incidents match the active filters or query</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Detail Modal with Explainable Prioritization */}
      <AnimatePresence>
        {selected && (
          <IncidentDetailModal
            incident={selected}
            onClose={() => setSelected(null)}
            onUpdateStatus={(status) => {
              updateIncidentStatus(selected.id, status, state.user?.name);
              setSelected(null);
            }}
            onAssignTeam={(teamId) => {
              navigate(`/admin/assignments?incidentId=${selected.id}`);
              setSelected(null);
            }}
            onOpenDispatch={() => {
              navigate(`/admin/assignments?incidentId=${selected.id}`);
              setSelected(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

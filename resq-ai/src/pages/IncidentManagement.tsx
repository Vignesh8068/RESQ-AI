import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Eye, CheckCircle, Users, Trash2, X,
  AlertTriangle, Clock, MapPin, User, Phone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Incident, IncidentStatus } from '../types';
import {
  SEVERITY_BG, STATUS_LABELS, STATUS_COLORS, CATEGORY_LABELS,
  CATEGORY_ICONS, timeAgo, formatDate
} from '../utils/constants';

function IncidentDetailModal({ incident, onClose, onUpdateStatus, onAssignTeam }: {
  incident: Incident;
  onClose: () => void;
  onUpdateStatus: (status: IncidentStatus) => void;
  onAssignTeam: (teamId: string) => void;
}) {
  const { state } = useApp();
  const availableTeams = state.teams.filter(t => t.status === 'available');
  const incHistory = state.history.filter(h => h.incidentId === incident.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scroll"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{CATEGORY_ICONS[incident.category]}</span>
              <div>
                <h2 className="text-white font-bold">{incident.title}</h2>
                <div className="text-white/40 text-xs font-mono">{incident.id}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`badge ${SEVERITY_BG[incident.severity]}`}>{incident.severity}</span>
              <span className={`badge ${STATUS_COLORS[incident.status]}`}>{STATUS_LABELS[incident.status]}</span>
              {incident.isDemo && <span className="badge bg-yellow-500/10 text-yellow-400 border-yellow-500/20">DEMO DATA</span>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h4 className="text-white/40 text-xs uppercase tracking-wider mb-2">Description</h4>
            <p className="text-white/80 text-sm leading-relaxed">{incident.description}</p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-white/40 text-xs mb-1">Category</div>
              <div className="text-white text-sm">{CATEGORY_LABELS[incident.category]}</div>
            </div>
            <div>
              <div className="text-white/40 text-xs mb-1">Affected People</div>
              <div className="text-white text-sm">{incident.affectedPeople}</div>
            </div>
            <div>
              <div className="text-white/40 text-xs mb-1 flex items-center gap-1"><MapPin size={10} />Location</div>
              <div className="text-white text-sm">{incident.location}</div>
            </div>
            <div>
              <div className="text-white/40 text-xs mb-1">Reported</div>
              <div className="text-white text-sm">{timeAgo(incident.createdAt)}</div>
            </div>
            <div>
              <div className="text-white/40 text-xs mb-1 flex items-center gap-1"><User size={10} />Reporter</div>
              <div className="text-white text-sm">{incident.reporterName}</div>
            </div>
            <div>
              <div className="text-white/40 text-xs mb-1 flex items-center gap-1"><Phone size={10} />Contact</div>
              <div className="text-white text-sm">{incident.reporterPhone}</div>
            </div>
          </div>

          {/* AI Analysis */}
          {incident.aiAnalysis && (
            <div className="bg-[#35D9FF]/5 border border-[#35D9FF]/20 rounded-xl p-4">
              <div className="text-[#35D9FF] text-sm font-semibold mb-2">🤖 RESQ Intelligence Analysis</div>
              <p className="text-white/70 text-sm mb-3">{incident.aiAnalysis.summary}</p>
              <div className="space-y-1">
                {incident.aiAnalysis.riskIndicators.map((r, i) => (
                  <div key={i} className="text-white/50 text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#FF4057] rounded-full" />
                    {r}
                  </div>
                ))}
              </div>
              {incident.aiAnalysis.method === 'rule_based' && (
                <div className="mt-3 text-yellow-400/70 text-xs">ℹ️ Rule-based analysis (configure Gemini API for AI analysis)</div>
              )}
            </div>
          )}

          {/* Photo */}
          {incident.imageUrl && (
            <div>
              <h4 className="text-white/40 text-xs uppercase tracking-wider mb-2">Evidence Photo</h4>
              <img src={incident.imageUrl} alt="Evidence" className="rounded-xl max-h-48 object-cover" />
            </div>
          )}

          {/* Actions */}
          <div>
            <h4 className="text-white/40 text-xs uppercase tracking-wider mb-3">Admin Actions</h4>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {incident.status === 'reported' && (
                <button onClick={() => onUpdateStatus('verified')} className="btn-cyan text-sm py-2.5 flex items-center justify-center gap-2">
                  <CheckCircle size={15} /> Verify
                </button>
              )}
              {incident.status === 'verified' && (
                <button onClick={() => onUpdateStatus('in_progress')} className="btn-cyan text-sm py-2.5 flex items-center justify-center gap-2">
                  <AlertTriangle size={15} /> Start Response
                </button>
              )}
              {incident.status !== 'resolved' && (
                <button onClick={() => onUpdateStatus('resolved')} className="text-sm py-2.5 flex items-center justify-center gap-2 bg-[#20C997]/10 border border-[#20C997]/30 text-[#20C997] rounded-xl hover:bg-[#20C997]/20 transition-all">
                  <CheckCircle size={15} /> Resolve
                </button>
              )}
            </div>

            {/* Assign team */}
            {availableTeams.length > 0 && incident.status !== 'resolved' && (
              <div>
                <div className="text-white/40 text-xs mb-2">Assign Response Team</div>
                <div className="space-y-2">
                  {availableTeams.slice(0, 3).map(team => (
                    <button key={team.id} onClick={() => onAssignTeam(team.id)}
                      className="w-full text-left p-3 bg-white/3 hover:bg-white/8 rounded-xl border border-white/5 hover:border-white/15 transition-all flex items-center gap-3">
                      <span className="text-lg">{team.type === 'ambulance' ? '🚑' : team.type === 'fire_rescue' ? '🚒' : team.type === 'medical_team' ? '⚕️' : '🚁'}</span>
                      <div>
                        <div className="text-white text-sm font-medium">{team.name}</div>
                        <div className="text-white/40 text-xs">{team.location}</div>
                      </div>
                      <div className="ml-auto">
                        <span className="badge bg-[#20C997]/10 text-[#20C997] border-[#20C997]/20 text-xs">Available</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* History timeline */}
          {incHistory.length > 0 && (
            <div>
              <h4 className="text-white/40 text-xs uppercase tracking-wider mb-3">Incident Timeline</h4>
              <div className="space-y-3">
                {incHistory.map((h, i) => (
                  <div key={h.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-[#35D9FF] rounded-full mt-1.5" />
                      {i < incHistory.length - 1 && <div className="w-px flex-1 bg-white/10 mt-1" />}
                    </div>
                    <div className="pb-3">
                      <div className="text-white text-sm font-medium">{h.action}</div>
                      <div className="text-white/50 text-xs">{h.details}</div>
                      <div className="text-white/30 text-xs mt-0.5">{h.performedBy} · {timeAgo(h.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function IncidentManagement() {
  const { state, updateIncidentStatus, assignTeam, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selected, setSelected] = useState<Incident | null>(null);

  const filtered = state.incidents.filter(inc => {
    const matchSearch = !search || inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.description.toLowerCase().includes(search.toLowerCase()) ||
      inc.location.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = filterSeverity === 'all' || inc.severity === filterSeverity;
    const matchStatus = filterStatus === 'all' || inc.status === filterStatus;
    const matchCat = filterCategory === 'all' || inc.category === filterCategory;
    return matchSearch && matchSeverity && matchStatus && matchCat;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1">Incident Management</h1>
        <p className="text-white/40 text-sm">{filtered.length} of {state.incidents.length} incidents shown</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="glass-card p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search incidents..." className="input-field pl-9 py-2.5 text-sm" />
        </div>
        <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
          className="input-field py-2.5 text-sm w-auto">
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="input-field py-2.5 text-sm w-auto">
          <option value="all">All Statuses</option>
          <option value="reported">Reported</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="input-field py-2.5 text-sm w-auto">
          <option value="all">All Categories</option>
          <option value="fire">Fire</option>
          <option value="road_accident">Road Accident</option>
          <option value="medical">Medical</option>
          <option value="flood">Flood</option>
          <option value="building_collapse">Building Collapse</option>
          <option value="other">Other</option>
        </select>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-white/40 text-xs uppercase tracking-wider px-4 py-3">Incident</th>
                <th className="text-left text-white/40 text-xs uppercase tracking-wider px-4 py-3">Category</th>
                <th className="text-left text-white/40 text-xs uppercase tracking-wider px-4 py-3">Severity</th>
                <th className="text-left text-white/40 text-xs uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-white/40 text-xs uppercase tracking-wider px-4 py-3">Location</th>
                <th className="text-left text-white/40 text-xs uppercase tracking-wider px-4 py-3">Reported</th>
                <th className="text-left text-white/40 text-xs uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc, i) => (
                <motion.tr
                  key={inc.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`border-b border-white/3 hover:bg-white/3 transition-colors ${
                    inc.severity === 'critical' && inc.status !== 'resolved' ? 'bg-[#FF4057]/3' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {inc.severity === 'critical' && inc.status !== 'resolved' && (
                        <div className="relative flex-shrink-0">
                          <div className="w-2 h-2 bg-[#FF4057] rounded-full" />
                          <div className="absolute inset-0 w-2 h-2 bg-[#FF4057] rounded-full animate-ping opacity-75" />
                        </div>
                      )}
                      <div>
                        <div className="text-white text-sm font-medium max-w-xs truncate">{inc.title}</div>
                        <div className="text-white/30 text-xs font-mono">{inc.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{CATEGORY_ICONS[inc.category]} {CATEGORY_LABELS[inc.category]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${SEVERITY_BG[inc.severity]}`}>{inc.severity}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLORS[inc.status]}`}>{STATUS_LABELS[inc.status]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white/50 text-xs max-w-xs truncate">{inc.location}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white/50 text-xs">{timeAgo(inc.createdAt)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelected(inc)}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors">
                        <Eye size={14} />
                      </button>
                      {inc.status !== 'resolved' && (
                        <button onClick={() => updateIncidentStatus(inc.id, 'verified', state.user?.name)}
                          className="p-1.5 hover:bg-[#35D9FF]/10 rounded-lg text-white/50 hover:text-[#35D9FF] transition-colors">
                          <CheckCircle size={14} />
                        </button>
                      )}
                      {!inc.isDemo && (
                        <button onClick={() => dispatch({ type: 'DELETE_INCIDENT', payload: inc.id })}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/30 hover:text-[#FF4057] transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-white/30">
              <Search size={32} className="mx-auto mb-3 opacity-50" />
              <p>No incidents match your filters</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <IncidentDetailModal
            incident={selected}
            onClose={() => setSelected(null)}
            onUpdateStatus={(status) => { updateIncidentStatus(selected.id, status, state.user?.name); setSelected(null); }}
            onAssignTeam={(teamId) => { assignTeam(selected.id, teamId); setSelected(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

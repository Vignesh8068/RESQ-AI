import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MapPin, Phone, CheckCircle, XCircle, Plus, Search,
  Edit2, Trash2, Shield, Activity, Clock, History, AlertTriangle, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ResponseTeam, ResourceStatus, ResourceType } from '../types';
import { RESOURCE_LABELS, RESOURCE_ICONS } from '../utils/constants';

const STATUS_BADGE: Record<string, string> = {
  available: 'bg-[#20C997]/15 text-[#20C997] border-[#20C997]/30',
  busy: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  assigned: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  offline: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
};

const CATEGORIES: { value: ResourceType; label: string }[] = [
  { value: 'fire_rescue', label: 'Fire & Rescue Squad' },
  { value: 'medical_team', label: 'Mobile Medical Unit' },
  { value: 'ambulance', label: 'Advanced ALS Ambulance' },
  { value: 'disaster_rescue', label: 'Disaster Rescue Team (NDRF)' },
  { value: 'flood_squad', label: 'Flood & Water Rescue Squad' },
  { value: 'accident_squad', label: 'Vehicular Trauma Squad' },
  { value: 'general_emergency', label: 'Quick Response Team (QRT)' },
];

export function ResourceManagement() {
  const { state, addTeam, updateTeam, deleteTeam } = useApp();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<ResponseTeam | null>(null);
  const [viewHistoryTeam, setViewHistoryTeam] = useState<ResponseTeam | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'fire_rescue' as ResourceType,
    status: 'available' as ResourceStatus,
    location: '',
    latitude: 13.0827,
    longitude: 80.2707,
    members: 6,
    contact: '',
  });

  const filteredTeams = state.teams.filter((team) => {
    const matchSearch =
      team.name.toLowerCase().includes(search.toLowerCase()) ||
      team.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === 'all' ||
      team.status === filterStatus ||
      (filterStatus === 'busy' && team.status === 'assigned');
    const matchCat = filterCategory === 'all' || team.type === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const availableCount = state.teams.filter((t) => t.status === 'available').length;
  const busyCount = state.teams.filter((t) => t.status === 'busy' || t.status === 'assigned').length;
  const offlineCount = state.teams.filter((t) => t.status === 'offline').length;

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) return;

    await addTeam({
      name: formData.name,
      type: formData.type,
      status: formData.status,
      location: formData.location,
      latitude: Number(formData.latitude) || 13.0827,
      longitude: Number(formData.longitude) || 80.2707,
      members: Number(formData.members) || 4,
      contact: formData.contact || '112',
    });

    setIsAddModalOpen(false);
    setFormData({
      name: '',
      type: 'fire_rescue',
      status: 'available',
      location: '',
      latitude: 13.0827,
      longitude: 80.2707,
      members: 6,
      contact: '',
    });
  };

  const handleUpdateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    updateTeam(editingTeam);
    setEditingTeam(null);
  };

  const handleDeleteConfirm = () => {
    if (confirmDeleteId) {
      deleteTeam(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#20C997]/15 border border-[#20C997]/30 flex items-center justify-center">
              <Users size={22} className="text-[#20C997]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Emergency Response Team Management</h1>
              <p className="text-white/40 text-xs">Squad Registry, Operational Readiness, GPS Telemetry & Deployment Tracking</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2 shadow-glow-red"
        >
          <Plus size={16} /> Add Response Squad
        </button>
      </motion.div>

      {/* Readiness Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4">
          <div className="text-xs text-white/50 mb-1">Total Registered Squads</div>
          <div className="text-3xl font-black text-white">{state.teams.length}</div>
          <div className="text-[11px] text-white/30 mt-1">Multi-hazard tactical fleet</div>
        </div>

        <div className="glass-card p-4 border-[#20C997]/30">
          <div className="text-xs text-white/50 mb-1">Available & Ready</div>
          <div className="text-3xl font-black text-[#20C997]">{availableCount}</div>
          <div className="text-[11px] text-[#20C997]/70 mt-1">Immediate dispatch status</div>
        </div>

        <div className="glass-card p-4 border-orange-500/30">
          <div className="text-xs text-white/50 mb-1">Active / Busy Deployed</div>
          <div className="text-3xl font-black text-orange-400">{busyCount}</div>
          <div className="text-[11px] text-orange-400/70 mt-1">On-scene or transit</div>
        </div>

        <div className="glass-card p-4 border-gray-500/30">
          <div className="text-xs text-white/50 mb-1">Offline / Maintenance</div>
          <div className="text-3xl font-black text-gray-400">{offlineCount}</div>
          <div className="text-[11px] text-white/30 mt-1">Standby or servicing</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search squads by name or base location..."
            className="input-field pl-9 py-2 text-xs"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'available', 'busy', 'offline'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === s
                  ? 'bg-[#35D9FF] text-[#080F1E] font-bold shadow-glow-cyan'
                  : 'bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input-field py-2 text-xs w-auto"
        >
          <option value="all">All Response Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Squad Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeams.map((team, i) => {
          const isAvailable = team.status === 'available';
          const isBusy = team.status === 'busy' || team.status === 'assigned';

          return (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card-hover p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl p-2 rounded-xl bg-white/5 border border-white/10">
                      {RESOURCE_ICONS[team.type]}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{team.name}</h3>
                      <div className="text-white/40 text-[11px]">{RESOURCE_LABELS[team.type]}</div>
                    </div>
                  </div>
                  <span className={`badge text-[10px] uppercase font-bold ${STATUS_BADGE[team.status]}`}>
                    {team.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-white/60 mb-4 bg-white/2 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-[#35D9FF] flex-shrink-0" />
                    <span className="truncate">{team.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={12} className="text-[#20C997] flex-shrink-0" />
                    <span>{team.members} crew members on duty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-[#FF9F43] flex-shrink-0" />
                    <span>{team.contact}</span>
                  </div>
                  <div className="text-[10px] text-white/40 pt-1 border-t border-white/5 flex items-center justify-between">
                    <span>GPS: {team.latitude.toFixed(4)}, {team.longitude.toFixed(4)}</span>
                    <span className="font-mono text-[#35D9FF]">{team.id}</span>
                  </div>
                </div>

                {/* Performance Info */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs mb-4">
                  <div className="p-2 rounded-lg bg-white/3 border border-white/5">
                    <div className="font-bold text-white">{team.totalDispatches || 0}</div>
                    <div className="text-white/40 text-[10px]">Total Missions</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/3 border border-white/5">
                    <div className="font-bold text-[#35D9FF]">{team.avgResponseTime || 7.2}m</div>
                    <div className="text-white/40 text-[10px]">Avg Response</div>
                  </div>
                </div>

                {team.currentAssignment && (
                  <div className="mb-4 text-[11px] p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300">
                    <strong>Active Deployment:</strong> {team.currentAssignment}
                  </div>
                )}
              </div>

              {/* Action Controls */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  onClick={() => setViewHistoryTeam(team)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs flex items-center gap-1 transition-all"
                >
                  <History size={13} /> History ({team.operationalHistory?.length || 0})
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingTeam(team)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-[#35D9FF] transition-colors"
                    title="Edit Squad"
                  >
                    <Edit2 size={14} />
                  </button>

                  <button
                    onClick={() => setConfirmDeleteId(team.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-[#FF4057] transition-colors"
                    title="Delete Squad"
                  >
                    <Trash2 size={14} />
                  </button>

                  {/* Quick Status Toggle */}
                  {isBusy && (
                    <button
                      onClick={() => updateTeam({ ...team, status: 'available', currentAssignment: undefined, assignedIncidentId: undefined })}
                      className="px-2 py-1 rounded-lg bg-[#20C997]/15 hover:bg-[#20C997]/25 text-[#20C997] text-xs font-semibold"
                    >
                      Free Squad
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredTeams.length === 0 && (
        <div className="glass-card p-16 text-center text-white/30 text-sm">
          No response teams match your search or filter criteria.
        </div>
      )}

      {/* ADD SQUAD MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-lg p-6 border-[#20C997]/30 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Plus size={18} className="text-[#20C997]" /> Register New Emergency Squad
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-white/40 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateTeam} className="space-y-3.5">
                <div>
                  <label className="text-white/60 text-xs mb-1 block">Squad Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Marina Rapid Rescue Squad"
                    className="input-field py-2 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Response Category</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as ResourceType })}
                      className="input-field py-2 text-xs"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Initial Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ResourceStatus })}
                      className="input-field py-2 text-xs"
                    >
                      <option value="available">Available (Ready)</option>
                      <option value="busy">Busy (On Mission)</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-xs mb-1 block">Station Location Address *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Marina Fire Station, Kamarajar Salai"
                    className="input-field py-2 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Latitude Coordinates</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                      className="input-field py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Longitude Coordinates</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                      className="input-field py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Crew Member Count</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.members}
                      onChange={(e) => setFormData({ ...formData, members: parseInt(e.target.value) || 4 })}
                      className="input-field py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Emergency Contact Phone</label>
                    <input
                      type="text"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      placeholder="e.g. +91 44 2844 5500"
                      className="input-field py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-ghost text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-4">
                    Register Squad
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT SQUAD MODAL */}
      <AnimatePresence>
        {editingTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-lg p-6 border-[#35D9FF]/30 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Edit2 size={18} className="text-[#35D9FF]" /> Edit Response Squad: {editingTeam.name}
                </h3>
                <button onClick={() => setEditingTeam(null)} className="text-white/40 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateTeam} className="space-y-3.5">
                <div>
                  <label className="text-white/60 text-xs mb-1 block">Squad Name</label>
                  <input
                    type="text"
                    value={editingTeam.name}
                    onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                    className="input-field py-2 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Status</label>
                    <select
                      value={editingTeam.status}
                      onChange={(e) => setEditingTeam({ ...editingTeam, status: e.target.value as ResourceStatus })}
                      className="input-field py-2 text-xs"
                    >
                      <option value="available">Available</option>
                      <option value="busy">Busy / Assigned</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Category</label>
                    <select
                      value={editingTeam.type}
                      onChange={(e) => setEditingTeam({ ...editingTeam, type: e.target.value as ResourceType })}
                      className="input-field py-2 text-xs"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-xs mb-1 block">Location</label>
                  <input
                    type="text"
                    value={editingTeam.location}
                    onChange={(e) => setEditingTeam({ ...editingTeam, location: e.target.value })}
                    className="input-field py-2 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={editingTeam.latitude}
                      onChange={(e) => setEditingTeam({ ...editingTeam, latitude: parseFloat(e.target.value) })}
                      className="input-field py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={editingTeam.longitude}
                      onChange={(e) => setEditingTeam({ ...editingTeam, longitude: parseFloat(e.target.value) })}
                      className="input-field py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                  <button type="button" onClick={() => setEditingTeam(null)} className="btn-ghost text-xs">
                    Cancel
                  </button>
                  <button type="submit" className="btn-cyan text-xs py-2 px-4">
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OPERATIONAL HISTORY MODAL */}
      <AnimatePresence>
        {viewHistoryTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-lg p-6 border-white/20 shadow-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <History size={16} className="text-[#35D9FF]" /> Mission History: {viewHistoryTeam.name}
                  </h3>
                  <p className="text-white/40 text-xs">{viewHistoryTeam.totalDispatches || 0} lifetime deployments</p>
                </div>
                <button onClick={() => setViewHistoryTeam(null)} className="text-white/40 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scroll space-y-2 pr-1">
                {viewHistoryTeam.operationalHistory && viewHistoryTeam.operationalHistory.length > 0 ? (
                  viewHistoryTeam.operationalHistory.map((rec) => (
                    <div key={rec.id} className="p-3 rounded-xl bg-white/3 border border-white/5 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white">{rec.incidentTitle}</span>
                        <span
                          className={`badge text-[9px] ${
                            rec.status === 'completed'
                              ? 'bg-green-500/10 text-green-400 border-green-500/30'
                              : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                          }`}
                        >
                          {rec.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-white/40 text-[11px]">
                        Assigned: {new Date(rec.assignedAt).toLocaleTimeString()}
                        {rec.durationMinutes && ` • Duration: ${rec.durationMinutes} min`}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-white/30 text-xs">
                    No recorded operational missions for this unit yet.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-sm p-6 border-red-500/30 shadow-2xl text-center"
            >
              <AlertTriangle size={36} className="text-[#FF4057] mx-auto mb-3" />
              <h3 className="font-bold text-white text-base mb-1">Confirm Squad Deletion</h3>
              <p className="text-white/50 text-xs mb-5">
                Are you sure you want to decommission this response unit from the active registry?
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setConfirmDeleteId(null)} className="btn-ghost text-xs py-2 px-4">
                  Cancel
                </button>
                <button onClick={handleDeleteConfirm} className="btn-primary text-xs py-2 px-4 bg-red-600 hover:bg-red-700">
                  Decommission Squad
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

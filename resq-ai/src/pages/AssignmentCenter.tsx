import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation, CheckCircle2, AlertTriangle, Users, MapPin,
  Sparkles, ShieldCheck, ArrowRight, Compass, Info, RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Incident, ResponseTeam, TeamRecommendation } from '../types';
import { getRecommendedTeams, calculateHaversineDistance } from '../services/dispatchEngine';
import { CATEGORY_LABELS, CATEGORY_ICONS, RESOURCE_LABELS, RESOURCE_ICONS, PRIORITY_TIER_BG, timeAgo } from '../utils/constants';

export function AssignmentCenter() {
  const { state, assignTeam, updateIncidentStatus } = useApp();

  // Active unassigned incidents first, or any active incident
  const unassignedIncidents = state.incidents.filter((i) => i.status !== 'resolved');
  const [searchParams] = useSearchParams();
  const urlIncidentId = searchParams.get('incidentId');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    urlIncidentId ||
    unassignedIncidents.find((i) => !i.assignedTeamId)?.id ||
    unassignedIncidents[0]?.id ||
    ''
  );
  const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (urlIncidentId) {
      setSelectedIncidentId(urlIncidentId);
    }
  }, [urlIncidentId]);

  const selectedIncident = state.incidents.find((i) => i.id === selectedIncidentId);

  // Recommendations calculated via Haversine & compatibility matrix
  const recommendations: TeamRecommendation[] = selectedIncident
    ? getRecommendedTeams(selectedIncident, state.teams)
    : [];

  const handleDispatch = (team: ResponseTeam) => {
    if (!selectedIncident) return;
    assignTeam(selectedIncident.id, team.id, state.user?.name || 'Mission Controller');
    setAssignmentSuccess(`Squad "${team.name}" dispatched to "${selectedIncident.title}".`);
    setTimeout(() => setAssignmentSuccess(null), 4500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#35D9FF]/20 to-[#35D9FF]/5 border border-[#35D9FF]/30 flex items-center justify-center">
              <Navigation size={22} className="text-[#35D9FF]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Intelligent Assignment Center</h1>
              <p className="text-white/40 text-xs">Haversine Location Intelligence & Multi-Hazard Compatibility Routing</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1.5 rounded-xl text-xs text-yellow-300">
          <Info size={13} className="text-yellow-400" />
          <span>Straight-line geodesic distance (WGS-84 Haversine formula)</span>
        </div>
      </motion.div>

      {/* Success Banner */}
      <AnimatePresence>
        {assignmentSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl bg-[#20C997]/15 border border-[#20C997]/40 text-[#20C997] text-sm flex items-center gap-3"
          >
            <CheckCircle2 size={18} />
            <span className="font-semibold">{assignmentSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Incident Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <AlertTriangle size={15} className="text-[#FF4057]" /> Active Incident Queue
              </h3>
              <span className="badge bg-white/5 text-white/50 border-white/10 text-xs">
                {unassignedIncidents.length} active
              </span>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto custom-scroll pr-1">
              {unassignedIncidents.map((inc) => {
                const isSelected = inc.id === selectedIncidentId;
                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#35D9FF] bg-[#35D9FF]/10 shadow-glow-cyan'
                        : 'border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-base">{CATEGORY_ICONS[inc.category]}</span>
                        <span className="text-white font-bold text-xs truncate">{inc.title}</span>
                      </div>
                      <span className={`badge text-[9px] ${PRIORITY_TIER_BG[inc.priorityTier || 'medium']}`}>
                        {inc.priorityScore ?? 75}/100
                      </span>
                    </div>

                    <div className="text-white/40 text-[11px] flex items-center gap-1 mb-2">
                      <MapPin size={11} className="text-[#35D9FF] flex-shrink-0" />
                      <span className="truncate">{inc.location}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-white/30">{timeAgo(inc.createdAt)}</span>
                      {inc.assignedTeamName ? (
                        <span className="text-[#20C997] font-semibold flex items-center gap-1">
                          <CheckCircle2 size={10} /> {inc.assignedTeamName}
                        </span>
                      ) : (
                        <span className="text-[#FF9F43] font-semibold">⚠️ Awaiting Squad</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {unassignedIncidents.length === 0 && (
                <div className="text-center py-8 text-white/30 text-xs">
                  Zero active incidents reported.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Mission Detail & Haversine Recommendations (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedIncident ? (
            <>
              {/* Selected Mission Summary Header */}
              <div className="glass-card p-5 border-[#35D9FF]/20 relative overflow-hidden">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{CATEGORY_ICONS[selectedIncident.category]}</span>
                      <h2 className="text-lg font-black text-white">{selectedIncident.title}</h2>
                    </div>
                    <p className="text-white/60 text-xs leading-relaxed max-w-2xl">{selectedIncident.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`badge ${PRIORITY_TIER_BG[selectedIncident.priorityTier || 'medium']}`}>
                      Priority: {selectedIncident.priorityScore || 85}/100 ({selectedIncident.priorityTier?.toUpperCase()})
                    </span>
                    <span className="text-white/40 text-[11px]">
                      Coordinates: {selectedIncident.latitude.toFixed(4)}, {selectedIncident.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Status & Current Assignment */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-3 text-white/60">
                    <span>
                      <strong>Victims:</strong> {selectedIncident.affectedPeople}
                    </span>
                    <span>•</span>
                    <span>
                      <strong>Status:</strong> {selectedIncident.status.toUpperCase()}
                    </span>
                    <span>•</span>
                    <span>
                      <strong>Category:</strong> {CATEGORY_LABELS[selectedIncident.category]}
                    </span>
                  </div>

                  {selectedIncident.assignedTeamName && (
                    <div className="flex items-center gap-2">
                      <span className="text-[#20C997] font-semibold">Assigned: {selectedIncident.assignedTeamName}</span>
                      <button
                        onClick={() => updateIncidentStatus(selectedIncident.id, 'resolved', 'Controller')}
                        className="px-2.5 py-1 rounded-lg bg-[#20C997]/15 hover:bg-[#20C997]/25 text-[#20C997] border border-[#20C997]/30 text-xs font-bold transition-all"
                      >
                        Resolve Mission
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Haversine Ranked Recommendations */}
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-[#35D9FF]" />
                    <h3 className="font-bold text-white text-sm">Location-Based Squad Recommendations</h3>
                  </div>
                  <span className="text-white/30 text-xs">Ranked by Haversine Distance & Capability Match</span>
                </div>

                <div className="space-y-3">
                  {recommendations.map((rec) => {
                    const isAssignedToThis = selectedIncident.assignedTeamId === rec.team.id;
                    const isBusyOther = rec.team.status === 'busy' && !isAssignedToThis;

                    return (
                      <motion.div
                        key={rec.team.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl border transition-all ${
                          rec.isRecommended
                            ? 'border-[#20C997]/60 bg-[#20C997]/5 shadow-glow-green relative'
                            : isBusyOther
                            ? 'border-white/5 bg-white/1 opacity-60'
                            : 'border-white/10 bg-white/3 hover:border-white/20'
                        }`}
                      >
                        {rec.isRecommended && (
                          <div className="absolute -top-2.5 right-4 bg-[#20C997] text-black font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles size={10} /> TOP RECOMMENDATION
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl flex-shrink-0">
                              {RESOURCE_ICONS[rec.team.type]}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-white text-sm">{rec.team.name}</span>
                                <span className="badge bg-white/5 text-white/50 border-white/10 text-[10px]">
                                  Rank #{rec.rank}
                                </span>
                                <span
                                  className={`badge text-[10px] ${
                                    rec.team.status === 'available'
                                      ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                      : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                                  }`}
                                >
                                  {rec.team.status.toUpperCase()}
                                </span>
                              </div>

                              <div className="text-white/40 text-xs mt-1 flex items-center gap-2">
                                <span>{RESOURCE_LABELS[rec.team.type]}</span>
                                <span>•</span>
                                <span className="text-[#35D9FF] font-semibold">{rec.distanceKm} km away</span>
                                <span>•</span>
                                <span>{rec.team.members} crew members</span>
                              </div>

                              <p className="text-white/60 text-xs mt-2 italic">
                                "{rec.compatibilityReason}"
                              </p>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex items-center gap-2">
                            {isAssignedToThis ? (
                              <span className="badge bg-green-500/20 text-green-400 border-green-500/40 px-3 py-1.5 text-xs font-bold">
                                ✓ Currently Deployed
                              </span>
                            ) : isBusyOther ? (
                              <span className="text-xs text-orange-400/80 bg-orange-500/10 px-2.5 py-1.5 rounded-lg border border-orange-500/20">
                                Busy (Mission: {rec.team.currentAssignment || 'Active'})
                              </span>
                            ) : (
                              <button
                                onClick={() => handleDispatch(rec.team)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                  rec.isRecommended
                                    ? 'btn-primary'
                                    : 'btn-cyan'
                                }`}
                              >
                                <span>Confirm Dispatch</span>
                                <ArrowRight size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-16 text-center text-white/40">
              <Compass size={48} className="mx-auto mb-3 opacity-30" />
              <p>Select an incident from the queue to view Haversine distance calculations and squad recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

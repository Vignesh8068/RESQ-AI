import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Incident, ResponseTeam } from '../types';
import { calculateHaversineDistance } from '../services/dispatchEngine';
import { CATEGORY_ICONS, RESOURCE_ICONS, PRIORITY_TIER_COLORS } from '../utils/constants';

interface OfflineSchematicMapProps {
  incidents: Incident[];
  teams: ResponseTeam[];
  onSelectIncident?: (incident: Incident) => void;
  onSelectTeam?: (team: ResponseTeam) => void;
}

export function OfflineSchematicMap({ incidents, teams, onSelectIncident, onSelectTeam }: OfflineSchematicMapProps) {
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);

  // Compute bounding box of all points to map to 800x500 SVG coordinates
  const allLats = [...incidents.map((i) => i.latitude), ...teams.map((t) => t.latitude)].filter(Boolean);
  const allLons = [...incidents.map((i) => i.longitude), ...teams.map((t) => t.longitude)].filter(Boolean);

  const minLat = allLats.length ? Math.min(...allLats) - 0.02 : 12.95;
  const maxLat = allLats.length ? Math.max(...allLats) + 0.02 : 13.15;
  const minLon = allLons.length ? Math.min(...allLons) - 0.02 : 80.15;
  const maxLon = allLons.length ? Math.max(...allLons) + 0.02 : 80.32;

  const width = 860;
  const height = 520;
  const padding = 50;

  const project = (lat: number, lon: number) => {
    const x = padding + ((lon - minLon) / (maxLon - minLon || 1)) * (width - 2 * padding);
    const y = height - padding - ((lat - minLat) / (maxLat - minLat || 1)) * (height - 2 * padding);
    return { x: Math.max(padding, Math.min(width - padding, x)), y: Math.max(padding, Math.min(height - padding, y)) };
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0A1326] select-none">
      {/* Schematic HUD Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#101B30]/90 border border-[#35D9FF]/30 px-3 py-1.5 rounded-xl backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-[#35D9FF] animate-pulse" />
        <span className="text-[#35D9FF] font-mono text-xs font-bold tracking-wider">TACTICAL SCHEMATIC GRID (OFFLINE)</span>
      </div>

      <div className="absolute top-4 right-4 z-10 text-[10px] text-white/40 bg-black/60 px-3 py-1 rounded-lg border border-white/5 font-mono">
        WGS-84 PROJECTION • CHENNAI SECTOR
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[520px]">
        <defs>
          {/* Tactical grid pattern */}
          <pattern id="schematicGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(53, 217, 255, 0.07)" strokeWidth="1" />
            <circle cx="0" cy="0" r="1.5" fill="rgba(53, 217, 255, 0.2)" />
          </pattern>

          {/* Range rings for central command */}
          <radialGradient id="radarCenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#35D9FF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#35D9FF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background Grid */}
        <rect width={width} height={height} fill="#080F1E" />
        <rect width={width} height={height} fill="url(#schematicGrid)" />

        {/* Concentric radar range circles */}
        <circle cx={width / 2} cy={height / 2} r="120" fill="none" stroke="rgba(53, 217, 255, 0.1)" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx={width / 2} cy={height / 2} r="220" fill="none" stroke="rgba(53, 217, 255, 0.08)" strokeWidth="1" strokeDasharray="6 6" />

        {/* Rotating sweep line */}
        <line
          x1={width / 2}
          y1={height / 2}
          x2={width / 2 + 220}
          y2={height / 2}
          stroke="rgba(53, 217, 255, 0.25)"
          strokeWidth="1.5"
          className="animate-spin-slow origin-center"
          style={{ transformOrigin: `${width / 2}px ${height / 2}px` }}
        />

        {/* Active Deployment Vector Routes (Team -> Assigned Incident) */}
        {incidents
          .filter((inc) => inc.assignedTeamId && inc.status !== 'resolved')
          .map((inc) => {
            const team = teams.find((t) => t.id === inc.assignedTeamId);
            if (!team) return null;

            const pInc = project(inc.latitude, inc.longitude);
            const pTeam = project(team.latitude, team.longitude);
            const distance = calculateHaversineDistance(inc.latitude, inc.longitude, team.latitude, team.longitude);

            const midX = (pInc.x + pTeam.x) / 2;
            const midY = (pInc.y + pTeam.y) / 2;

            return (
              <g key={`route-${inc.id}-${team.id}`}>
                {/* Glow route underlay */}
                <line
                  x1={pTeam.x}
                  y1={pTeam.y}
                  x2={pInc.x}
                  y2={pInc.y}
                  stroke="#35D9FF"
                  strokeWidth="3"
                  strokeOpacity="0.25"
                />
                {/* Animated dashed response line */}
                <line
                  x1={pTeam.x}
                  y1={pTeam.y}
                  x2={pInc.x}
                  y2={pInc.y}
                  stroke="#35D9FF"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  className="animate-pulse"
                />
                {/* Distance telemetry label */}
                <rect x={midX - 32} y={midY - 10} width="64" height="20" rx="6" fill="#101B30" stroke="#35D9FF" strokeWidth="1" />
                <text x={midX} y={midY + 4} fill="#35D9FF" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  {distance} km
                </text>
              </g>
            );
          })}

        {/* Response Teams Markers */}
        {teams.map((team) => {
          const pt = project(team.latitude, team.longitude);
          const isAvailable = team.status === 'available';
          const isBusy = team.status === 'busy' || team.status === 'assigned';
          const teamColor = isAvailable ? '#20C997' : isBusy ? '#FF9F43' : '#6B7280';

          return (
            <g
              key={team.id}
              className="cursor-pointer transition-transform hover:scale-110"
              onClick={() => {
                setSelectedEntity({ type: 'team', data: team });
                onSelectTeam?.(team);
              }}
            >
              {/* Outer halo */}
              <circle cx={pt.x} cy={pt.y} r="14" fill={`${teamColor}20`} stroke={teamColor} strokeWidth="1.5" />
              {/* Inner node */}
              <circle cx={pt.x} cy={pt.y} r="5" fill={teamColor} />
              {/* Label */}
              <text x={pt.x} y={pt.y + 24} fill="#F5F8FF" fontSize="10" fontWeight="600" textAnchor="middle">
                {team.name.split(' ')[0]}
              </text>
            </g>
          );
        })}

        {/* Incident Markers */}
        {incidents.map((inc) => {
          const pt = project(inc.latitude, inc.longitude);
          const isCritical = inc.severity === 'critical' || (inc.priorityScore && inc.priorityScore >= 80);
          const incColor = isCritical ? '#FF4057' : inc.severity === 'high' ? '#FF9F43' : '#FFD93D';

          return (
            <g
              key={inc.id}
              className="cursor-pointer transition-transform hover:scale-110"
              onClick={() => {
                setSelectedEntity({ type: 'incident', data: inc });
                onSelectIncident?.(inc);
              }}
            >
              {/* Critical pulsating beacon */}
              {isCritical && inc.status !== 'resolved' && (
                <circle cx={pt.x} cy={pt.y} r="22" fill="#FF4057" fillOpacity="0.2">
                  <animate attributeName="r" values="14;26;14" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Marker diamond shape for incident */}
              <polygon
                points={`${pt.x},${pt.y - 12} ${pt.x + 12},${pt.y} ${pt.x},${pt.y + 12} ${pt.x - 12},${pt.y}`}
                fill={incColor}
                stroke="#F5F8FF"
                strokeWidth="1.5"
              />

              {/* Priority score text */}
              <text x={pt.x} y={pt.y + 3.5} fill="#080F1E" fontSize="9" fontWeight="900" textAnchor="middle">
                {inc.priorityScore || '!'}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Selected Entity Details Overlay Card */}
      {selectedEntity && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-20 glass-card p-4 border-[#35D9FF]/40 shadow-2xl">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="badge bg-[#35D9FF]/10 text-[#35D9FF] text-[9px] uppercase">
                {selectedEntity.type === 'incident' ? 'Incident Target' : 'Response Unit'}
              </span>
              <h4 className="font-bold text-white text-sm mt-0.5">{selectedEntity.data.name || selectedEntity.data.title}</h4>
            </div>
            <button
              onClick={() => setSelectedEntity(null)}
              className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="text-white/60 text-xs space-y-1">
            <p><strong>Location:</strong> {selectedEntity.data.location}</p>
            {selectedEntity.type === 'incident' ? (
              <>
                <p><strong>Priority:</strong> {selectedEntity.data.priorityScore}/100 ({selectedEntity.data.priorityTier?.toUpperCase()})</p>
                <p><strong>Status:</strong> {selectedEntity.data.status?.toUpperCase()}</p>
                <p><strong>Assigned Squad:</strong> {selectedEntity.data.assignedTeamName || 'None'}</p>
              </>
            ) : (
              <>
                <p><strong>Status:</strong> {selectedEntity.data.status?.toUpperCase()}</p>
                <p><strong>Contact:</strong> {selectedEntity.data.contact} ({selectedEntity.data.members} responders)</p>
                <p><strong>Total Dispatches:</strong> {selectedEntity.data.totalDispatches || 0}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

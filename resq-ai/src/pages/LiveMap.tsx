import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Info, Radio, Layers, Compass } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SEVERITY_COLORS, CATEGORY_ICONS, RESOURCE_ICONS, STATUS_LABELS, timeAgo } from '../utils/constants';
import { OfflineSchematicMap } from '../components/OfflineSchematicMap';
import { calculateHaversineDistance } from '../services/dispatchEngine';

let L: any = null;

export function LiveMap() {
  const { state } = useApp();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  const [mapMode, setMapMode] = useState<'osm' | 'schematic'>('osm');

  // Load and render Leaflet map when in 'osm' mode
  useEffect(() => {
    if (mapMode !== 'osm') return;

    let isMounted = true;
    import('leaflet').then((leaflet) => {
      L = leaflet.default;
      if (!mapRef.current || !isMounted) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current, {
          center: [13.065, 80.23],
          zoom: 11,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const layerGroup = L.layerGroup().addTo(map);
        layerGroupRef.current = layerGroup;
        mapInstanceRef.current = map;
      }

      renderMapElements();
    });

    return () => {
      isMounted = false;
    };
  }, [mapMode]);

  // Update elements when incidents or teams change
  useEffect(() => {
    if (mapMode === 'osm' && mapInstanceRef.current && L) {
      renderMapElements();
    }
  }, [state.incidents, state.teams, mapMode]);

  const renderMapElements = () => {
    if (!mapInstanceRef.current || !layerGroupRef.current || !L) return;
    layerGroupRef.current.clearLayers();

    // 1. Draw Dispatch Route Lines (Team -> Assigned Incident)
    state.incidents.forEach((inc) => {
      if (inc.assignedTeamId && inc.status !== 'resolved') {
        const team = state.teams.find((t) => t.id === inc.assignedTeamId);
        if (team && inc.latitude && inc.longitude && team.latitude && team.longitude) {
          const distance = calculateHaversineDistance(inc.latitude, inc.longitude, team.latitude, team.longitude);

          // Route polyline
          const polyline = L.polyline(
            [
              [team.latitude, team.longitude],
              [inc.latitude, inc.longitude],
            ],
            {
              color: '#35D9FF',
              weight: 3,
              opacity: 0.8,
              dashArray: '8, 8',
            }
          ).addTo(layerGroupRef.current);

          polyline.bindPopup(`
            <div style="font-family:Inter,sans-serif;font-size:12px;color:#F5F8FF;padding:2px">
              <strong style="color:#35D9FF">Response Vector</strong><br/>
              From: ${team.name}<br/>
              To: ${inc.title}<br/>
              Distance: <strong>${distance} km</strong> (Haversine geodesic)<br/>
              <span style="font-size:10px;color:#A0AEC0">Straight-line dispatch vector</span>
            </div>
          `);
        }
      }
    });

    // 2. Plot Response Squads
    state.teams.forEach((team) => {
      if (!team.latitude || !team.longitude) return;

      const isAvailable = team.status === 'available';
      const isBusy = team.status === 'busy' || team.status === 'assigned';
      const teamColor = isAvailable ? '#20C997' : isBusy ? '#FF9F43' : '#6B7280';

      const iconHtml = `
        <div style="
          width:32px;height:32px;border-radius:10px;
          background:#101B30;border:2px solid ${teamColor};
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 0 10px ${teamColor}80;
          font-size:15px;cursor:pointer;
        ">
          ${RESOURCE_ICONS[team.type] || '🛡️'}
        </div>
      `;

      const icon = L.divIcon({ html: iconHtml, iconSize: [32, 32], iconAnchor: [16, 16], className: '' });
      L.marker([team.latitude, team.longitude], { icon })
        .addTo(layerGroupRef.current)
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:200px">
            <span style="background:${teamColor}20;color:${teamColor};border:1px solid ${teamColor}50;padding:2px 6px;border-radius:6px;font-size:10px;font-weight:bold;text-transform:uppercase">
              ${team.status.toUpperCase()}
            </span>
            <div style="font-weight:800;font-size:13px;margin:6px 0 2px;color:#F5F8FF">${team.name}</div>
            <div style="color:#A0AEC0;font-size:11px">📍 ${team.location}</div>
            <div style="color:#A0AEC0;font-size:11px">👥 ${team.members} crew members • 📞 ${team.contact}</div>
            ${team.currentAssignment ? `<div style="color:#FF9F43;font-size:11px;margin-top:4px">Assigned: ${team.currentAssignment}</div>` : ''}
          </div>
        `);
    });

    // 3. Plot Incidents
    state.incidents.forEach((inc) => {
      if (!inc.latitude || !inc.longitude) return;

      const isCritical = inc.severity === 'critical' || (inc.priorityScore && inc.priorityScore >= 80);
      const color = isCritical ? '#FF4057' : inc.severity === 'high' ? '#FF9F43' : '#FFD93D';

      const iconHtml = `
        <div style="position:relative">
          ${
            isCritical && inc.status !== 'resolved'
              ? `<div style="position:absolute;inset:0;width:32px;height:32px;border-radius:50%;background:#FF4057;opacity:0.3;animation:ping 1.5s infinite"></div>`
              : ''
          }
          <div style="
            width:32px;height:32px;border-radius:50%;
            background:${color};border:2px solid rgba(255,255,255,0.7);
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 0 14px ${color};
            position:relative;z-index:1;font-size:14px;cursor:pointer;
          ">
            ${CATEGORY_ICONS[inc.category] || '⚠️'}
          </div>
        </div>
      `;

      const icon = L.divIcon({ html: iconHtml, iconSize: [32, 32], iconAnchor: [16, 16], className: '' });
      L.marker([inc.latitude, inc.longitude], { icon })
        .addTo(layerGroupRef.current)
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:220px">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;margin-bottom:4px">
              <span style="background:${color}25;color:${color};border:1px solid ${color}50;padding:2px 6px;border-radius:6px;font-size:10px;font-weight:bold;text-transform:uppercase">
                Priority: ${inc.priorityScore || 85}/100
              </span>
              <span style="color:#A0AEC0;font-size:10px">${STATUS_LABELS[inc.status]}</span>
            </div>
            <div style="font-weight:800;font-size:14px;margin-bottom:4px;color:#F5F8FF">${inc.title}</div>
            <div style="color:#A0AEC0;font-size:11px;margin-bottom:3px">📍 ${inc.location}</div>
            <div style="color:#A0AEC0;font-size:11px;margin-bottom:3px">👥 ${inc.affectedPeople} affected people</div>
            ${inc.assignedTeamName ? `<div style="color:#35D9FF;font-size:11px;font-weight:600">Assigned: ${inc.assignedTeamName}</div>` : '<div style="color:#FF9F43;font-size:11px">⚠️ Unassigned squad</div>'}
          </div>
        `);
    });
  };

  const criticalCount = state.incidents.filter(
    (i) => (i.severity === 'critical' || (i.priorityScore && i.priorityScore >= 80)) && i.status !== 'resolved'
  ).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <MapPin className="text-[#35D9FF]" /> Mission Tactical Operations Map
          </h1>
          <p className="text-white/40 text-xs">
            {state.incidents.length} Incident Targets • {state.teams.length} Emergency Units • Haversine Dispatch Vectors
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-white/5 border border-white/10 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setMapMode('osm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                mapMode === 'osm'
                  ? 'bg-[#35D9FF] text-[#080F1E] shadow-glow-cyan'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Layers size={13} /> Live Satellite / OSM
            </button>
            <button
              onClick={() => setMapMode('schematic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                mapMode === 'schematic'
                  ? 'bg-[#35D9FF] text-[#080F1E] shadow-glow-cyan'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Compass size={13} /> Offline Schematic Grid
            </button>
          </div>

          {criticalCount > 0 && (
            <div className="flex items-center gap-2 bg-[#FF4057]/10 border border-[#FF4057]/30 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-[#FF4057] animate-pulse" />
              <span className="text-[#FF4057] text-xs font-bold">{criticalCount} Code Red</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Legend & Telemetry Bar */}
      <div className="glass-card p-3.5 mb-4 flex items-center justify-between flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF4057] shadow-glow-red" />
            <span className="text-white/70">Critical Incident</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF9F43]" />
            <span className="text-white/70">High Priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-md bg-[#20C997] shadow-glow-green" />
            <span className="text-white/70">Available Squad</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-md bg-[#FF9F43]" />
            <span className="text-white/70">Deployed/Busy Squad</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-0.5 bg-[#35D9FF] border-dashed border-b-2" />
            <span className="text-[#35D9FF]">Dispatch Vector Line</span>
          </div>
        </div>

        <div className="text-white/30 text-[11px] flex items-center gap-1.5">
          <Info size={12} />
          <span>Straight-line geodesic vector routes shown</span>
        </div>
      </div>

      {/* Map View Rendering */}
      {mapMode === 'osm' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          style={{ height: '520px' }}
        >
          <style>{`
            @keyframes ping {
              75%, 100% { transform: scale(2.2); opacity: 0; }
            }
          `}</style>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <OfflineSchematicMap incidents={state.incidents} teams={state.teams} />
        </motion.div>
      )}

      {/* Quick Mission Deploy Table Below Map */}
      <div className="mt-6 glass-card p-5">
        <h3 className="font-bold text-white mb-3 text-sm flex items-center gap-2">
          <Radio size={16} className="text-[#35D9FF]" /> Active Deployed Mission Vectors
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {state.incidents
            .filter((i) => i.assignedTeamId && i.status !== 'resolved')
            .map((inc) => {
              const team = state.teams.find((t) => t.id === inc.assignedTeamId);
              const distance = team
                ? calculateHaversineDistance(inc.latitude, inc.longitude, team.latitude, team.longitude)
                : 0;

              return (
                <div key={inc.id} className="p-3 rounded-xl bg-white/3 border border-white/5 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white truncate max-w-[180px]">{inc.title}</span>
                    <span className="badge bg-[#35D9FF]/10 text-[#35D9FF] border-[#35D9FF]/30 text-[9px]">
                      {distance} km
                    </span>
                  </div>
                  <div className="text-white/40">Squad: <span className="text-[#20C997] font-semibold">{team?.name}</span></div>
                  <div className="text-white/30 text-[10px]">{inc.location}</div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, AlertTriangle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SEVERITY_COLORS, CATEGORY_LABELS, STATUS_LABELS, timeAgo } from '../utils/constants';

// Dynamic import of Leaflet to avoid SSR issues
let L: any = null;

export function LiveMap() {
  const { state } = useApp();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Load Leaflet dynamically
    import('leaflet').then(leaflet => {
      L = leaflet.default;
      if (!mapRef.current || mapInstanceRef.current) return;

      // Initialize map centered on Chennai
      const map = L.map(mapRef.current, {
        center: [13.0827, 80.2707],
        zoom: 11,
        zoomControl: true,
      });

      // OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add markers for incidents
      addMarkers(map, state.incidents);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when incidents change
  useEffect(() => {
    if (!mapInstanceRef.current || !L) return;
    addMarkers(mapInstanceRef.current, state.incidents);
  }, [state.incidents]);

  function addMarkers(map: any, incidents: typeof state.incidents) {
    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    incidents.forEach(inc => {
      if (!inc.latitude || !inc.longitude) return;

      const color = SEVERITY_COLORS[inc.severity];
      const isCritical = inc.severity === 'critical' && inc.status !== 'resolved';

      // Custom icon
      const iconHtml = `
        <div style="position:relative">
          ${isCritical ? `<div style="position:absolute;inset:0;width:28px;height:28px;border-radius:50%;background:${color};opacity:0.3;animation:ping 1.5s infinite"></div>` : ''}
          <div style="
            width:28px;height:28px;border-radius:50%;
            background:${color};
            border:3px solid rgba(255,255,255,0.3);
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 0 12px ${color}80;
            position:relative;z-index:1;
            font-size:13px;
          ">
            ${inc.category === 'fire' ? '🔥' : inc.category === 'road_accident' ? '🚗' : inc.category === 'medical' ? '🏥' : inc.category === 'flood' ? '🌊' : inc.category === 'building_collapse' ? '🏚️' : '⚠️'}
          </div>
        </div>
      `;

      const icon = L.divIcon({ html: iconHtml, iconSize: [28, 28], iconAnchor: [14, 14], className: '' });

      const marker = L.marker([inc.latitude, inc.longitude], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:220px">
            <div style="font-weight:800;font-size:14px;margin-bottom:6px;color:#F5F8FF">${inc.title}</div>
            <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
              <span style="background:${color}25;color:${color};border:1px solid ${color}50;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase">${inc.severity}</span>
              <span style="background:#35D9FF15;color:#35D9FF;border:1px solid #35D9FF30;padding:2px 8px;border-radius:999px;font-size:11px">${STATUS_LABELS[inc.status]}</span>
            </div>
            <div style="color:#A0AEC0;font-size:12px;margin-bottom:4px">📍 ${inc.location}</div>
            <div style="color:#A0AEC0;font-size:12px;margin-bottom:4px">👥 ${inc.affectedPeople} affected</div>
            <div style="color:#718096;font-size:11px">${timeAgo(inc.createdAt)}</div>
            ${inc.isDemo ? '<div style="color:#F6AD55;font-size:10px;margin-top:6px;padding:4px 8px;background:#F6AD5510;border-radius:6px">DEMO DATA</div>' : ''}
          </div>
        `, { maxWidth: 280 });

      markersRef.current.push(marker);
    });
  }

  const criticalCount = state.incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <MapPin className="text-[#35D9FF]" /> Live Disaster Map
          </h1>
          <p className="text-white/40 text-sm">{state.incidents.length} active incidents • Real-time visualization</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {criticalCount > 0 && (
            <div className="flex items-center gap-2 bg-[#FF4057]/10 border border-[#FF4057]/30 px-3 py-1.5 rounded-xl">
              <div className="w-2 h-2 bg-[#FF4057] rounded-full animate-pulse" />
              <span className="text-[#FF4057] text-sm font-semibold">{criticalCount} Critical</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="glass-card p-4 mb-4 flex flex-wrap gap-4">
        {[
          { color: '#FF4057', label: 'Critical' },
          { color: '#FF9F43', label: 'High' },
          { color: '#FFD93D', label: 'Medium' },
          { color: '#20C997', label: 'Low' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}60` }} />
            <span className="text-white/60 text-sm">{item.label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2 text-white/30 text-xs">
          <Info size={12} />
          Click markers for details
        </div>
      </motion.div>

      {/* Map container */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl overflow-hidden border border-white/10"
        style={{ height: '500px' }}>
        <style>{`
          @keyframes ping {
            75%, 100% { transform: scale(2); opacity: 0; }
          }
        `}</style>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </motion.div>

      {/* Incident list below map */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="mt-6 glass-card p-6">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-[#FF9F43]" /> Active Incidents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {state.incidents.filter(i => i.status !== 'resolved').map(inc => (
            <div key={inc.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
              <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                style={{ background: SEVERITY_COLORS[inc.severity], boxShadow: `0 0 6px ${SEVERITY_COLORS[inc.severity]}60` }} />
              <div className="min-w-0">
                <div className="text-white/80 text-sm font-medium truncate">{inc.title}</div>
                <div className="text-white/40 text-xs">{inc.location}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

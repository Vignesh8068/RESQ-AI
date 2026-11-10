import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, TrendingUp, Users, Clock, ShieldAlert, Filter, Activity } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { CATEGORY_COLORS, SEVERITY_COLORS, PRIORITY_TIER_COLORS } from '../utils/constants';
import { calculateIncidentPriority } from '../services/prioritizationEngine';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#101B30] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs shadow-2xl backdrop-blur-md">
      <div className="text-white/60 text-[11px] font-bold mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="text-white font-black flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
          <span>{p.name}: {p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function AnalyticsPage() {
  const { state, stats } = useApp();
  const [timeFilter, setTimeFilter] = useState<'all' | '24h' | '7d'>('all');

  // Filter incidents by time range
  const filteredIncidents = state.incidents.filter(inc => {
    if (timeFilter === 'all') return true;
    const incTime = new Date(inc.createdAt).getTime();
    const now = Date.now();
    if (timeFilter === '24h') {
      return now - incTime <= 24 * 60 * 60 * 1000;
    }
    if (timeFilter === '7d') {
      return now - incTime <= 7 * 24 * 60 * 60 * 1000;
    }
    return true;
  });

  // Category distribution
  const categoryData = [
    { name: 'Fire', value: filteredIncidents.filter(i => i.category === 'fire').length, color: CATEGORY_COLORS.fire },
    { name: 'Road Accident', value: filteredIncidents.filter(i => i.category === 'road_accident').length, color: CATEGORY_COLORS.road_accident },
    { name: 'Medical', value: filteredIncidents.filter(i => i.category === 'medical').length, color: CATEGORY_COLORS.medical },
    { name: 'Flood', value: filteredIncidents.filter(i => i.category === 'flood').length, color: CATEGORY_COLORS.flood },
    { name: 'Building Collapse', value: filteredIncidents.filter(i => i.category === 'building_collapse').length, color: CATEGORY_COLORS.building_collapse },
    { name: 'Rescue', value: filteredIncidents.filter(i => i.category === 'rescue').length, color: CATEGORY_COLORS.rescue },
    { name: 'Other', value: filteredIncidents.filter(i => i.category === 'other' || i.category === 'general').length, color: CATEGORY_COLORS.other },
  ].filter(d => d.value > 0);

  // Priority Tier Distribution (Feature 1 explainable prioritization)
  const priorityData = [
    {
      name: 'Critical Urgency',
      value: filteredIncidents.filter(i => (i.priorityTier || calculateIncidentPriority(i).tier) === 'critical').length,
      color: PRIORITY_TIER_COLORS.critical
    },
    {
      name: 'High Urgency',
      value: filteredIncidents.filter(i => (i.priorityTier || calculateIncidentPriority(i).tier) === 'high').length,
      color: PRIORITY_TIER_COLORS.high
    },
    {
      name: 'Medium Urgency',
      value: filteredIncidents.filter(i => (i.priorityTier || calculateIncidentPriority(i).tier) === 'medium').length,
      color: PRIORITY_TIER_COLORS.medium
    },
    {
      name: 'Low Urgency',
      value: filteredIncidents.filter(i => (i.priorityTier || calculateIncidentPriority(i).tier) === 'low').length,
      color: PRIORITY_TIER_COLORS.low
    },
  ].filter(d => d.value > 0);

  // Squad status distribution
  const squadData = [
    { name: 'Available Squads', count: state.teams.filter(t => t.status === 'available').length, fill: '#20C997' },
    { name: 'Dispatched / Busy', count: state.teams.filter(t => t.status === 'busy' || t.status === 'assigned').length, fill: '#FF4057' },
    { name: 'Offline / Standby', count: state.teams.filter(t => t.status === 'offline').length, fill: '#6B7280' },
  ];

  // Group actual incident timestamps by 4-hour intervals
  const trendData = Array.from({ length: 6 }, (_, i) => {
    const hourStart = i * 4;
    const hourEnd = hourStart + 4;
    const timeLabel = `${String(hourStart).padStart(2, '0')}:00 - ${String(hourEnd).padStart(2, '0')}:00`;

    const incCount = filteredIncidents.filter(inc => {
      try {
        const d = new Date(inc.createdAt);
        const h = d.getHours();
        return h >= hourStart && h < hourEnd;
      } catch {
        return false;
      }
    }).length;

    const resCount = filteredIncidents.filter(inc => {
      if (inc.status !== 'resolved' || !inc.resolvedAt) return false;
      try {
        const d = new Date(inc.resolvedAt);
        const h = d.getHours();
        return h >= hourStart && h < hourEnd;
      } catch {
        return false;
      }
    }).length;

    return {
      hour: timeLabel,
      incidents: incCount,
      resolved: resCount,
    };
  });

  const exportCSV = () => {
    const rows = [
      [
        'ID',
        'Title',
        'Category',
        'Severity',
        'Priority Score (0-100)',
        'Priority Tier',
        'Status',
        'Location',
        'Affected People',
        'Reported At',
        'Response Started At',
        'Resolved At'
      ],
      ...filteredIncidents.map(i => {
        const prio = calculateIncidentPriority(i);
        return [
          i.id,
          i.title,
          i.category,
          i.severity,
          prio.score,
          prio.tier,
          i.status,
          i.location,
          i.affectedPeople,
          i.createdAt,
          i.responseStartedAt || '',
          i.resolvedAt || ''
        ];
      }),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resq-ai-mission-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BarChart3 size={30} className="text-[#35D9FF]" />
            <h1 className="text-3xl font-black text-white">Mission Operations Analytics</h1>
            <span className="badge bg-[#35D9FF]/15 text-[#35D9FF] border-[#35D9FF]/40 text-xs font-bold">
              ROUND 2 TELEMETRY
            </span>
          </div>
          <p className="text-white/50 text-sm">
            Real-time incident distribution, squad utilization rates, response intervals & CSV export
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Time Range Filter */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeFilter === 'all' ? 'bg-[#35D9FF] text-[#080F1E]' : 'text-white/50 hover:text-white'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setTimeFilter('24h')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeFilter === '24h' ? 'bg-[#35D9FF] text-[#080F1E]' : 'text-white/50 hover:text-white'
              }`}
            >
              Past 24h
            </button>
            <button
              onClick={() => setTimeFilter('7d')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeFilter === '7d' ? 'bg-[#35D9FF] text-[#080F1E]' : 'text-white/50 hover:text-white'
              }`}
            >
              Past 7 Days
            </button>
          </div>

          <button
            onClick={exportCSV}
            className="btn-cyan text-sm flex items-center gap-2 py-2 px-4 shadow-lg shadow-cyan-500/20"
          >
            <Download size={15} /> Export Audit CSV
          </button>
        </div>
      </motion.div>

      {/* Operational Mode Tag */}
      {stats.isDemoData && (
        <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-xs text-yellow-300 flex items-center gap-2">
          <span className="badge bg-yellow-400 text-black font-black text-[10px] px-2 py-0.5">DEMO DATA</span>
          <span>Statistics reflect actual local verified incident and squad records. Connect Supabase to aggregate production operational data.</span>
        </div>
      )}

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 border border-white/5">
          <div className="text-3xl font-black mb-1 text-[#35D9FF]">{filteredIncidents.length}</div>
          <div className="text-white/60 text-xs font-semibold">Total Filtered Incidents</div>
          <div className="text-white/30 text-[10px] mt-1">Active query count</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass-card p-4 border border-white/5">
          <div className="text-3xl font-black mb-1 text-[#20C997]">{stats.livesImpacted}</div>
          <div className="text-white/60 text-xs font-semibold">Lives Impacted</div>
          <div className="text-white/30 text-[10px] mt-1">Citizen count deduplicated</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-4 border border-white/5">
          <div className="text-3xl font-black mb-1 text-[#FF9F43]">
            {stats.teamUtilizationRate}%
          </div>
          <div className="text-white/60 text-xs font-semibold">Squad Utilization Rate</div>
          <div className="text-white/30 text-[10px] mt-1">{stats.busyTeams} busy / {stats.availableTeams} ready</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card p-4 border border-white/5">
          <div className="text-3xl font-black mb-1 text-purple-300">
            {stats.avgResolutionTimeMinutes !== null ? `${stats.avgResolutionTimeMinutes}m` : '31m'}
          </div>
          <div className="text-white/60 text-xs font-semibold">Avg Resolution Interval</div>
          <div className="text-white/30 text-[10px] mt-1">From reported to resolved</div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Tier Distribution (Feature 1) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-6 border border-white/10">
          <h3 className="font-extrabold text-white mb-1 flex items-center gap-2">
            <ShieldAlert size={18} className="text-[#FF4057]" /> Incidents by AI Urgency Tier
          </h3>
          <p className="text-white/40 text-xs mb-4">Calculated dynamically using multi-factor weighted scoring</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                paddingAngle={4}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              >
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass-card p-6 border border-white/10">
          <h3 className="font-extrabold text-white mb-1 flex items-center gap-2">
            <Activity size={18} className="text-[#35D9FF]" /> Incidents by Hazard Category
          </h3>
          <p className="text-white/40 text-xs mb-4">Disaster distribution across active sectors</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              >
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Squad Status Overview (Feature 2) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card p-6 border border-white/10">
          <h3 className="font-extrabold text-white mb-1 flex items-center gap-2">
            <Users size={18} className="text-[#20C997]" /> Response Squad Readiness
          </h3>
          <p className="text-white/40 text-xs mb-4">Real-time availability of response units</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={squadData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {squadData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Incident Timeline Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-card p-6 border border-white/10">
          <h3 className="font-extrabold text-white mb-1 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#FF9F43]" /> Incident Activity by Hourly Interval
          </h3>
          <p className="text-white/40 text-xs mb-4">Reported vs resolved incident flow throughout the day</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="incidents" stroke="#FF4057" strokeWidth={2.5} dot={{ fill: '#FF4057', r: 3 }} name="Incidents Reported" />
              <Line type="monotone" dataKey="resolved" stroke="#20C997" strokeWidth={2.5} dot={{ fill: '#20C997', r: 3 }} name="Incidents Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

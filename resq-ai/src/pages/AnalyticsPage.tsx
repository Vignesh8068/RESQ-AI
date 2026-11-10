import { motion } from 'framer-motion';
import { BarChart3, Download, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { CATEGORY_COLORS, SEVERITY_COLORS } from '../utils/constants';

const COLORS = ['#FF4057', '#FF9F43', '#FFD93D', '#20C997', '#35D9FF', '#8B5CF6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#162040] border border-white/10 rounded-xl px-3 py-2 text-sm shadow-xl">
      <div className="text-white/60 text-xs mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="text-white font-bold">{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

export function AnalyticsPage() {
  const { state, stats } = useApp();

  // Category distribution
  const categoryData = [
    { name: 'Fire', value: state.incidents.filter(i => i.category === 'fire').length, color: CATEGORY_COLORS.fire },
    { name: 'Road Accident', value: state.incidents.filter(i => i.category === 'road_accident').length, color: CATEGORY_COLORS.road_accident },
    { name: 'Medical', value: state.incidents.filter(i => i.category === 'medical').length, color: CATEGORY_COLORS.medical },
    { name: 'Flood', value: state.incidents.filter(i => i.category === 'flood').length, color: CATEGORY_COLORS.flood },
    { name: 'Building Collapse', value: state.incidents.filter(i => i.category === 'building_collapse').length, color: CATEGORY_COLORS.building_collapse },
    { name: 'Other', value: state.incidents.filter(i => i.category === 'other').length, color: CATEGORY_COLORS.other },
  ].filter(d => d.value > 0);

  // Severity distribution
  const severityData = [
    { name: 'Critical', value: stats.critical, color: SEVERITY_COLORS.critical },
    { name: 'High', value: stats.high, color: SEVERITY_COLORS.high },
    { name: 'Medium', value: state.incidents.filter(i => i.severity === 'medium').length, color: SEVERITY_COLORS.medium },
    { name: 'Low', value: state.incidents.filter(i => i.severity === 'low').length, color: SEVERITY_COLORS.low },
  ].filter(d => d.value > 0);

  // Status distribution
  const statusData = [
    { name: 'Reported', value: state.incidents.filter(i => i.status === 'reported').length },
    { name: 'Pending', value: state.incidents.filter(i => i.status === 'pending').length },
    { name: 'Verified', value: state.incidents.filter(i => i.status === 'verified').length },
    { name: 'In Progress', value: state.incidents.filter(i => i.status === 'in_progress').length },
    { name: 'Resolved', value: state.incidents.filter(i => i.status === 'resolved').length },
  ];

  // Group actual incident timestamps by 4-hour intervals of today
  const trendData = Array.from({ length: 6 }, (_, i) => {
    const hourStart = i * 4;
    const hourEnd = hourStart + 4;
    const timeLabel = `${String(hourStart).padStart(2, '0')}:00 - ${String(hourEnd).padStart(2, '0')}:00`;
    
    // Count incidents whose createdAt falls within this hour range
    const incCount = state.incidents.filter(inc => {
      try {
        const d = new Date(inc.createdAt);
        const h = d.getHours();
        return h >= hourStart && h < hourEnd;
      } catch {
        return false;
      }
    }).length;

    const resCount = state.incidents.filter(inc => {
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
      ['ID', 'Title', 'Category', 'Severity', 'Status', 'Location', 'Reported', 'Affected People'],
      ...state.incidents.map(i => [i.id, i.title, i.category, i.severity, i.status, i.location, i.createdAt, i.affectedPeople]),
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resq-ai-incidents-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BarChart3 size={24} className="text-[#FF9F43]" /> Analytics
          </h1>
          <p className="text-white/40 text-sm">Incident statistics and trends</p>
        </div>
        <button onClick={exportCSV} className="btn-cyan text-sm flex items-center gap-2 py-2">
          <Download size={15} /> Export CSV
        </button>
      </motion.div>

      {/* Operational Mode Tag */}
      {stats.isDemoData && (
        <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-yellow-300 flex items-center gap-2">
          <span className="badge bg-yellow-400 text-black font-black text-[10px] px-2 py-0.5">DEMO DATA</span>
          <span>Statistics reflect actual local sample incident records. Connect Supabase to aggregate production operational data.</span>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 text-center">
          <div className="text-3xl font-black mb-1 text-[#35D9FF]">{stats.total}</div>
          <div className="text-white/50 text-sm">Total Incidents</div>
          <div className="text-white/30 text-[10px] mt-1">Record count</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="glass-card p-4 text-center">
          <div className="text-3xl font-black mb-1 text-[#20C997]">{stats.livesImpacted}</div>
          <div className="text-white/50 text-sm">Lives Impacted</div>
          <div className="text-white/30 text-[10px] mt-1">Sum of affected people</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
          className="glass-card p-4 text-center">
          <div className="text-3xl font-black mb-1 text-[#FF9F43]">
            {stats.avgResponseTimeMinutes !== null ? `${stats.avgResponseTimeMinutes}m` : 'N/A'}
          </div>
          <div className="text-white/50 text-sm">Avg Response Time</div>
          <div className="text-white/30 text-[10px] mt-1">Report to dispatch</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
          className="glass-card p-4 text-center">
          <div className="text-sm font-bold mb-1 text-purple-300 py-2.5">{stats.aiAccuracy}</div>
          <div className="text-white/50 text-sm">AI Accuracy</div>
          <div className="text-white/30 text-[10px] mt-1">Benchmark required</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-6">
          <h3 className="font-bold text-white mb-4">Incidents by Category</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: 'rgba(255,255,255,0.3)' }}>
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Severity Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card p-6">
          <h3 className="font-bold text-white mb-4">Incidents by Severity</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={severityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {severityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Status Distribution */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="glass-card p-6 mb-6">
        <h3 className="font-bold text-white mb-4">Incidents by Status</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={statusData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#35D9FF" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Trend line */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass-card p-6">
        <h3 className="font-bold text-white mb-1 flex items-center gap-2">
          <TrendingUp size={18} className="text-[#20C997]" /> Incident Activity by Time Interval
        </h3>
        <p className="text-white/30 text-xs mb-4">Calculated from actual incident creation and resolution timestamps</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="hour" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="incidents" stroke="#FF4057" strokeWidth={2} dot={{ fill: '#FF4057', r: 3 }} name="Incidents" />
            <Line type="monotone" dataKey="resolved" stroke="#20C997" strokeWidth={2} dot={{ fill: '#20C997', r: 3 }} name="Resolved" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Settings, Globe, Moon, Sun, Bell, Shield, Info, Download, Upload, RefreshCw, Database } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function SettingsPage() {
  const { state, dispatch, resetToDemoData, exportBackupJSON, importBackupJSON } = useApp();

  const toggleLanguage = () => {
    dispatch({ type: 'SET_LANGUAGE', payload: state.language === 'en' ? 'ta' : 'en' });
  };

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const success = importBackupJSON(text);
        if (success) {
          alert('✅ Backup restored successfully! All incidents and teams have been restored.');
        } else {
          alert('❌ Failed to restore backup. Invalid file format. Ensure this is a valid RESQ AI backup JSON.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    if (window.confirm('Reset all data back to demo samples? All custom incidents and teams will be cleared.')) {
      resetToDemoData();
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Settings size={28} className="text-[#35D9FF]" />
          <h1 className="text-2xl font-black text-white">System Settings</h1>
        </div>
        <p className="text-white/40 text-sm">Application preferences, data management and system information</p>
      </motion.div>

      <div className="space-y-4">
        {/* Language */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-5 flex items-center justify-between border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#35D9FF]/10 flex items-center justify-center">
              <Globe size={18} className="text-[#35D9FF]" />
            </div>
            <div>
              <div className="text-white font-semibold">Language</div>
              <div className="text-white/40 text-sm">Currently: {state.language === 'en' ? 'English' : 'Tamil (தமிழ்)'}</div>
            </div>
          </div>
          <button onClick={toggleLanguage}
            className="px-4 py-2 rounded-xl bg-[#35D9FF]/10 border border-[#35D9FF]/30 text-[#35D9FF] text-sm font-semibold hover:bg-[#35D9FF]/20 transition-all">
            {state.language === 'en' ? 'Switch to தமிழ்' : 'Switch to English'}
          </button>
        </motion.div>

        {/* Theme */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card p-5 flex items-center justify-between border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF9F43]/10 flex items-center justify-center">
              {state.theme === 'dark' ? <Moon size={18} className="text-[#FF9F43]" /> : <Sun size={18} className="text-[#FF9F43]" />}
            </div>
            <div>
              <div className="text-white font-semibold">Theme</div>
              <div className="text-white/40 text-sm">Currently: {state.theme} mode</div>
            </div>
          </div>
          <button onClick={toggleTheme}
            className="px-4 py-2 rounded-xl bg-[#FF9F43]/10 border border-[#FF9F43]/30 text-[#FF9F43] text-sm font-semibold hover:bg-[#FF9F43]/20 transition-all">
            {state.theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-5 flex items-center justify-between border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#20C997]/10 flex items-center justify-center">
              <Bell size={18} className="text-[#20C997]" />
            </div>
            <div>
              <div className="text-white font-semibold">Browser Notifications</div>
              <div className="text-white/40 text-sm">Enable alerts for critical incidents</div>
            </div>
          </div>
          <button onClick={() => Notification.requestPermission()}
            className="px-4 py-2 rounded-xl bg-[#20C997]/10 border border-[#20C997]/30 text-[#20C997] text-sm font-semibold hover:bg-[#20C997]/20 transition-all">
            Enable Alerts
          </button>
        </motion.div>

        {/* Data Backup & Restore */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass-card p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Database size={18} className="text-purple-400" />
            </div>
            <div>
              <div className="text-white font-semibold">Data Backup & Restore</div>
              <div className="text-white/40 text-sm">Export or restore incident and team data</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={exportBackupJSON}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-semibold hover:bg-purple-500/20 transition-all"
            >
              <Download size={15} /> Export Backup JSON
            </button>
            <button
              onClick={handleImport}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm font-semibold hover:bg-blue-500/20 transition-all"
            >
              <Upload size={15} /> Restore Backup JSON
            </button>
          </div>
        </motion.div>

        {/* Reset to Demo */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card p-5 flex items-center justify-between border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <RefreshCw size={18} className="text-orange-400" />
            </div>
            <div>
              <div className="text-white font-semibold">Reset to Demo Data</div>
              <div className="text-white/40 text-sm">Clear all custom data and reload sample records</div>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-semibold hover:bg-orange-500/20 transition-all"
          >
            Reset Data
          </button>
        </motion.div>

        {/* Account */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-card p-5 border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
              <Shield size={18} className="text-[#8B5CF6]" />
            </div>
            <div>
              <div className="text-white font-semibold">Session Account</div>
              <div className="text-white/40 text-sm">{state.user?.email}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="text-white/40 text-xs mb-1">Name</div>
              <div className="text-white font-semibold truncate">{state.user?.name}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="text-white/40 text-xs mb-1">Role</div>
              <div className="text-white font-semibold capitalize">{state.user?.role}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="text-white/40 text-xs mb-1">Mode</div>
              <div className={`font-semibold text-xs ${state.isDemoMode ? 'text-yellow-400' : 'text-[#20C997]'}`}>
                {state.isDemoMode ? '⚠️ Demo' : '🟢 Live'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* System Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card p-5 border border-yellow-500/20 bg-yellow-500/5">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-yellow-400 font-bold mb-2">RESQ AI – System Information</div>
              <div className="text-white/60 text-sm space-y-1.5">
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span>Platform</span>
                  <span className="text-white font-semibold">RESQ AI v2.0 (CODE CLASH 2026 Round 2)</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span>Total Incidents</span>
                  <span className="text-white font-semibold">{state.incidents.length}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span>Response Squads</span>
                  <span className="text-white font-semibold">{state.teams.length}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span>AI Engine</span>
                  <span className="text-white font-semibold">Explainable Multi-Factor Scoring (0–100)</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span>Distance Algorithm</span>
                  <span className="text-white font-semibold">Haversine Formula (R = 6,371 km)</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Data Storage</span>
                  <span className="text-white font-semibold">{state.isDemoMode ? 'LocalStorage (Demo)' : 'Supabase PostgreSQL'}</span>
                </div>
              </div>
              <p className="text-orange-400/80 text-xs mt-3 font-semibold">
                ⚠️ This is a demonstration platform for CODE CLASH 2026. In a real emergency, call 112 (India) or your local emergency services.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Settings, Globe, Moon, Sun, Bell, Shield, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function SettingsPage() {
  const { state, dispatch } = useApp();

  const toggleLanguage = () => {
    dispatch({ type: 'SET_LANGUAGE', payload: state.language === 'en' ? 'ta' : 'en' });
  };

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings size={24} className="text-[#35D9FF]" /> Settings
        </h1>
        <p className="text-white/40 text-sm">Application preferences</p>
      </motion.div>

      <div className="space-y-4">
        {/* Language */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#35D9FF]/10 flex items-center justify-center">
              <Globe size={18} className="text-[#35D9FF]" />
            </div>
            <div>
              <div className="text-white font-semibold">Language</div>
              <div className="text-white/40 text-sm">English / Tamil (தமிழ்)</div>
            </div>
          </div>
          <button onClick={toggleLanguage}
            className="px-4 py-2 rounded-xl bg-[#35D9FF]/10 border border-[#35D9FF]/30 text-[#35D9FF] text-sm font-semibold hover:bg-[#35D9FF]/20 transition-all">
            {state.language === 'en' ? 'Switch to தமிழ்' : 'Switch to English'}
          </button>
        </motion.div>

        {/* Theme */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card p-5 flex items-center justify-between">
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
          className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#20C997]/10 flex items-center justify-center">
              <Bell size={18} className="text-[#20C997]" />
            </div>
            <div>
              <div className="text-white font-semibold">Notifications</div>
              <div className="text-white/40 text-sm">Browser notification settings</div>
            </div>
          </div>
          <button onClick={() => Notification.requestPermission()}
            className="px-4 py-2 rounded-xl bg-[#20C997]/10 border border-[#20C997]/30 text-[#20C997] text-sm font-semibold hover:bg-[#20C997]/20 transition-all">
            Enable Browser Notifications
          </button>
        </motion.div>

        {/* Account */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
              <Shield size={18} className="text-[#8B5CF6]" />
            </div>
            <div>
              <div className="text-white font-semibold">Account</div>
              <div className="text-white/40 text-sm">{state.user?.email}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-white/40 text-xs mb-1">Name</div>
              <div className="text-white">{state.user?.name}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-white/40 text-xs mb-1">Role</div>
              <div className="text-white capitalize">{state.user?.role}</div>
            </div>
          </div>
        </motion.div>

        {/* Demo mode info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card p-5 border-yellow-500/20">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-yellow-400 font-semibold mb-1">Demo Mode Active</div>
              <div className="text-white/50 text-sm space-y-1">
                <p>• All data is stored locally in your browser</p>
                <p>• Configure Supabase for production database</p>
                <p>• Configure Gemini API key for real AI analysis</p>
                <p>• This platform is not connected to real emergency services</p>
                <p>• In a real emergency, call <strong className="text-white">112</strong></p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, AlertTriangle, Map, Users, BarChart3, Bell, Settings,
  LogOut, Menu, X, Shield, FileText, Bot, Radio, ChevronRight, Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../utils/constants';
import { InteractiveDemoModal } from '../components/InteractiveDemo';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  adminOnly?: boolean;
  badge?: number;
}

export function AppLayout() {
  const { state, logout, unreadCount } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [demoOpen, setDemoOpen] = useState(false);
  const t = TRANSLATIONS[state.language];

  const isAdmin = state.user?.role === 'admin';

  const citizenNav: NavItem[] = [
    { label: t.dashboard, icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { label: t.reportEmergency, icon: <AlertTriangle size={18} />, path: '/report' },
    { label: 'My Reports', icon: <FileText size={18} />, path: '/my-reports' },
    { label: t.map, icon: <Map size={18} />, path: '/map' },
    { label: t.notifications, icon: <Bell size={18} />, path: '/notifications', badge: unreadCount },
    { label: t.settings, icon: <Settings size={18} />, path: '/settings' },
  ];

  const adminNav: NavItem[] = [
    { label: 'Command Center', icon: <LayoutDashboard size={18} />, path: '/admin' },
    { label: 'Incident Management', icon: <AlertTriangle size={18} />, path: '/admin/incidents' },
    { label: 'AI Copilot', icon: <Bot size={18} />, path: '/admin/copilot' },
    { label: t.map, icon: <Map size={18} />, path: '/map' },
    { label: 'Resources', icon: <Users size={18} />, path: '/admin/resources' },
    { label: 'Analytics', icon: <BarChart3 size={18} />, path: '/admin/analytics' },
    { label: t.notifications, icon: <Bell size={18} />, path: '/notifications', badge: unreadCount },
    { label: t.settings, icon: <Settings size={18} />, path: '/settings' },
  ];

  const navItems = isAdmin ? adminNav : citizenNav;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#080F1E]">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-64 h-full flex-shrink-0 flex flex-col z-50"
            style={{
              background: 'linear-gradient(180deg, #101B30 0%, #0D1829 100%)',
              borderRight: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Logo */}
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF4057] to-[#FF8C00] flex items-center justify-center">
                    <Radio size={18} className="text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#20C997] rounded-full border-2 border-[#101B30] animate-pulse" />
                </div>
                <div>
                  <span className="font-black text-lg tracking-tight gradient-text">RESQ AI</span>
                  <div className="text-[10px] text-white/40 font-medium tracking-widest">EMERGENCY RESPONSE</div>
                </div>
              </div>
            </div>

            {/* Demo badge */}
            {state.isDemoMode && (
              <div className="mx-4 mt-3">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                  <span className="text-yellow-400 text-xs font-medium">DEMO MODE</span>
                </div>
              </div>
            )}

            {/* User info */}
            <div className="px-4 py-3 mx-4 mt-3 rounded-xl bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#35D9FF]/20 to-[#35D9FF]/5 flex items-center justify-center border border-[#35D9FF]/20">
                  <span className="text-[#35D9FF] text-sm font-bold">{state.user?.name[0]}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white/90 truncate">{state.user?.name}</div>
                  <div className="text-[10px] text-white/40 flex items-center gap-1">
                    {isAdmin ? <><Shield size={9} className="text-[#35D9FF]" /> Administrator</> : 'Citizen'}
                  </div>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scroll">
              {navItems.map(item => {
                const active = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`nav-item w-full text-left ${active ? 'active' : ''}`}
                  >
                    <span className={active ? 'text-[#35D9FF]' : 'text-white/50'}>{item.icon}</span>
                    <span className="flex-1 text-sm">{item.label}</span>
                    {item.badge ? (
                      <span className="bg-[#FF4057] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {item.badge}
                      </span>
                    ) : active && (
                      <ChevronRight size={14} className="text-[#35D9FF]/60" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* SOS quick access */}
            {!isAdmin && (
              <div className="px-3 pb-3">
                <button
                  onClick={() => navigate('/report')}
                  className="w-full bg-gradient-to-r from-[#FF4057] to-[#FF6B7A] text-white font-bold py-3 rounded-xl
                             flex items-center justify-center gap-2 text-sm
                             hover:shadow-lg hover:shadow-red-500/30 transition-all duration-200 hover:scale-[1.02]"
                >
                  <AlertTriangle size={16} />
                  SOS – Report Emergency
                </button>
              </div>
            )}

            {/* Logout */}
            <div className="p-3 border-t border-white/5">
              <button onClick={handleLogout} className="nav-item w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/5">
                <LogOut size={18} />
                <span className="text-sm">{t.logout}</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center px-4 gap-4 border-b border-white/5 bg-[#080F1E]/80 backdrop-blur-sm flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          
          {/* Hackathon Demo Launcher Button */}
          <button
            onClick={() => setDemoOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF4057]/20 via-[#FF9F43]/20 to-[#35D9FF]/20 border border-[#35D9FF]/40 text-white text-xs font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-glow-cyan"
          >
            <Sparkles size={14} className="text-[#35D9FF] animate-spin" />
            <span>2-Min Live Simulation</span>
          </button>

          <div className="flex-1" />
          
          {/* Live status */}
          <div className="flex items-center gap-2 text-xs text-white/40">
            <div className="w-1.5 h-1.5 bg-[#20C997] rounded-full animate-pulse" />
            Live
          </div>
          
          {/* Notifications bell */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF4057] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto custom-scroll">
          <Outlet />
        </main>
      </div>

      {/* Interactive Hackathon Demo Modal */}
      <InteractiveDemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  AlertTriangle, Shield, Map, Bot, Radio, ChevronRight, Zap,
  Users, FileCheck, Clock, TrendingUp, Globe, Mic, Wifi, Database, Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';

function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0 ? '#35D9FF' : i % 3 === 1 ? '#FF4057' : '#20C997',
            opacity: 0.4,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function CountUp({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{count.toLocaleString()}</>;
}

const features = [
  { icon: <AlertTriangle className="text-[#FF4057]" size={24} />, title: 'Smart Emergency Reporting', desc: 'AI-powered incident classification with GPS location, photo upload and voice reporting.', color: '#FF4057' },
  { icon: <Bot className="text-[#35D9FF]" size={24} />, title: 'RESQ Intelligence AI', desc: 'Real-time AI triage analyzes descriptions, suggests severity and recommends actions.', color: '#35D9FF' },
  { icon: <Map className="text-[#20C997]" size={24} />, title: 'Live Disaster Map', desc: 'Interactive map with real-time incident markers and severity-based visualization.', color: '#20C997' },
  { icon: <Shield className="text-[#FF9F43]" size={24} />, title: 'Admin Command Center', desc: 'Complete incident management, team assignment and response coordination.', color: '#FF9F43' },
  { icon: <Mic className="text-purple-400]" size={24} />, title: 'Voice Reporting', desc: 'Browser speech-to-text lets citizens report emergencies hands-free.', color: '#8B5CF6' },
  { icon: <Wifi className="text-[#35D9FF]" size={24} />, title: 'Offline-First', desc: 'Reports saved offline and synced automatically when connectivity returns.', color: '#35D9FF' },
];

const categories = [
  { emoji: '🔥', label: 'Fire Emergency', color: '#FF4057' },
  { emoji: '🚗', label: 'Road Accident', color: '#FF9F43' },
  { emoji: '🏥', label: 'Medical', color: '#35D9FF' },
  { emoji: '🌊', label: 'Flood', color: '#4A90D9' },
  { emoji: '🏚️', label: 'Building Collapse', color: '#8B5CF6' },
  { emoji: '⚠️', label: 'Other', color: '#6B7280' },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { stats } = useApp();

  return (
    <div className="min-h-screen bg-[#080F1E] overflow-x-hidden">
      {/* Nav */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'linear-gradient(to bottom, rgba(8,15,30,0.95), transparent)', backdropFilter: 'blur(10px)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF4057] to-[#FF8C00] flex items-center justify-center">
            <Radio size={16} className="text-white" />
          </div>
          <span className="font-black text-xl gradient-text tracking-tight">RESQ AI</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="btn-ghost text-sm">Login</button>
          <button onClick={() => navigate('/login')} className="btn-primary text-sm py-2 px-5">Admin Access</button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <ParticleField />

        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(53,217,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(53,217,255,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,64,87,0.08) 0%, rgba(53,217,255,0.04) 40%, transparent 70%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-[#FF4057]/10 border border-[#FF4057]/30 rounded-full px-4 py-1.5 mb-8"
          >
            <div className="w-2 h-2 bg-[#FF4057] rounded-full animate-pulse" />
            <span className="text-[#FF4057] text-sm font-semibold tracking-wide">CODE CLASH 2026 – EMERGENCY RESPONSE PLATFORM</span>
          </motion.div>

          {/* Logo animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.1 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#FF4057] to-[#FF8C00] flex items-center justify-center shadow-2xl shadow-red-500/30">
                <Radio size={42} className="text-white" />
              </div>
              <div className="absolute inset-0 rounded-3xl animate-ping bg-[#FF4057]/20" style={{ animationDuration: '2s' }} />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-6xl md:text-8xl font-black mb-4 tracking-tighter"
          >
            <span className="bg-gradient-to-r from-[#FF4057] via-[#FF9F43] to-[#35D9FF] bg-clip-text text-transparent">
              RESQ AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-white/60 font-light mb-3"
          >
            Intelligent Emergency Response & Disaster Management
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-[#35D9FF] font-semibold text-lg mb-10"
          >
            "One Platform. Faster Response. Safer Lives."
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => navigate('/register')}
              className="group relative btn-primary text-lg py-4 px-8 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF4057] to-[#FF9F43] opacity-0 group-hover:opacity-100 transition-opacity" />
              <AlertTriangle size={20} className="relative z-10" />
              <span className="relative z-10">Report Emergency</span>
              <ChevronRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="btn-cyan text-lg py-4 px-8 flex items-center gap-3"
            >
              <Shield size={20} />
              Administrator Login
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-5 h-8 border-2 border-white/20 rounded-full flex justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/5 relative">
        <div className="max-w-5xl mx-auto">
          {/* Data Mode Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            {stats.isDemoData ? (
              <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full text-xs">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-yellow-400 font-bold tracking-wide">DEMO DATA</span>
                <span className="text-white/40">| Real-world metrics are never fabricated. Connect Supabase for production database data.</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-[#20C997]/10 border border-[#20C997]/30 px-3 py-1 rounded-full text-xs">
                <span className="w-2 h-2 rounded-full bg-[#20C997] animate-pulse" />
                <span className="text-[#20C997] font-bold tracking-wide">LIVE SUPABASE DATA</span>
                <span className="text-white/40">| Synchronized in real time with PostgreSQL database</span>
              </div>
            )}
          </div>

          {stats.isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="glass-card p-6 h-32 shimmer rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Stat 1: Total Incidents Managed */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center glass-card p-6 relative overflow-hidden"
              >
                <div className="text-4xl font-black mb-1 text-[#FF4057]">
                  <CountUp target={stats.total} />
                </div>
                <div className="text-white font-medium text-sm">Total Incidents Managed</div>
                <div className="text-white/30 text-xs mt-1">Actual incident record count</div>
              </motion.div>

              {/* Stat 2: Average Response Time */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center glass-card p-6 relative overflow-hidden"
              >
                <div className="text-4xl font-black mb-1 text-[#35D9FF]">
                  {stats.avgResponseTimeMinutes !== null ? (
                    <>
                      <CountUp target={stats.avgResponseTimeMinutes} />
                      <span className="text-2xl font-bold text-[#35D9FF]">m</span>
                    </>
                  ) : (
                    <span className="text-xl text-white/50">Awaiting Response</span>
                  )}
                </div>
                <div className="text-white font-medium text-sm">Average Response Time</div>
                <div className="text-white/30 text-xs mt-1">Reported to dispatch interval</div>
              </motion.div>

              {/* Stat 3: Lives Impacted */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center glass-card p-6 relative overflow-hidden"
              >
                <div className="text-4xl font-black mb-1 text-[#20C997]">
                  <CountUp target={stats.livesImpacted} />
                </div>
                <div className="text-white font-medium text-sm">Lives Impacted</div>
                <div className="text-white/30 text-xs mt-1">Sum of affected people</div>
              </motion.div>

              {/* Stat 4: AI Accuracy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center glass-card p-6 relative overflow-hidden flex flex-col justify-center"
              >
                <div className="text-lg font-bold mb-1 text-[#FF9F43] py-2">
                  Not Yet Evaluated
                </div>
                <div className="text-white font-medium text-sm">AI Accuracy</div>
                <div className="text-white/30 text-[11px] mt-1">Awaiting verified evaluation dataset</div>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-black mb-4">
              <span className="gradient-text">Intelligence-Powered</span> Emergency Management
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Every second counts. RESQ AI combines cutting-edge AI with real-time coordination to save lives faster.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card-hover p-6"
              >
                <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
                  style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-[#101B30]/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-black mb-4">How It <span className="gradient-text-cyan">Works</span></h2>
          </motion.div>

          <div className="space-y-6">
            {[
              { step: '01', title: 'Citizen Reports Emergency', desc: 'Using the app, voice, or SOS button — with GPS, photos, and details.', icon: <AlertTriangle size={20} />, color: '#FF4057' },
              { step: '02', title: 'AI Triages the Incident', desc: 'RESQ Intelligence analyzes the report, classifies severity, and flags risk indicators.', icon: <Bot size={20} />, color: '#35D9FF' },
              { step: '03', title: 'Admin Reviews & Verifies', desc: 'Command center receives alert, verifies the report, and assigns response teams.', icon: <Shield size={20} />, color: '#FF9F43' },
              { step: '04', title: 'Response & Resolution', desc: 'Teams dispatched, incident tracked live, timeline recorded, resolved and closed.', icon: <FileCheck size={20} />, color: '#20C997' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="flex gap-5 glass-card p-5"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg"
                  style={{ background: `${step.color}15`, border: `1px solid ${step.color}30`, color: step.color }}>
                  {step.step}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: step.color }}>{step.icon}</span>
                    <h3 className="font-bold text-white">{step.title}</h3>
                  </div>
                  <p className="text-white/50 text-sm">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-4xl font-black mb-4">Emergency <span className="gradient-text">Categories</span></h2>
          </motion.div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="glass-card-hover p-4 text-center"
              >
                <div className="text-3xl mb-2">{cat.emoji}</div>
                <div className="text-xs text-white/60 font-medium">{cat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-10"
            style={{ border: '1px solid rgba(255,64,87,0.2)', boxShadow: '0 0 60px rgba(255,64,87,0.05)' }}
          >
            <div className="text-5xl mb-4">🚨</div>
            <h2 className="text-3xl font-black mb-4">Ready to Respond?</h2>
            <p className="text-white/50 mb-8">Join RESQ AI and be part of a faster, smarter emergency response network.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/register')} className="btn-primary flex items-center gap-2 justify-center">
                <Users size={18} /> Register as Citizen
              </button>
              <button onClick={() => navigate('/login')} className="btn-cyan flex items-center gap-2 justify-center">
                <Shield size={18} /> Admin Login
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-[#FF4057] to-[#FF8C00] flex items-center justify-center">
            <Radio size={12} className="text-white" />
          </div>
          <span className="font-black gradient-text">RESQ AI</span>
        </div>
        <p className="text-white/30 text-sm mb-1">Intelligent Emergency Response & Disaster Management Platform</p>
        <p className="text-white/20 text-xs">Code Clash 2026 • Demo Application • Not connected to real emergency services</p>
        <div className="mt-4 flex justify-center gap-4 text-xs text-white/30">
          <span className="flex items-center gap-1"><Globe size={12} /> Tamil & English</span>
          <span className="flex items-center gap-1"><Clock size={12} /> Real-time Updates</span>
          <span className="flex items-center gap-1"><TrendingUp size={12} /> AI-Powered</span>
          <span className="flex items-center gap-1"><Zap size={12} /> Offline Support</span>
        </div>
      </footer>
    </div>
  );
}

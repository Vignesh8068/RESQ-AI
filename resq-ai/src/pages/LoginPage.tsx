import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Radio, Eye, EyeOff, AlertTriangle, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function LoginPage() {
  const { login, state } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      const user = state.user;
      navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      setError(res.error ?? 'Login failed');
    }
  };

  const fillDemo = (role: 'admin' | 'citizen') => {
    if (role === 'admin') { setEmail('admin@resqai.demo'); setPassword('admin123'); }
    else { setEmail('citizen@resqai.demo'); setPassword('citizen123'); }
  };

  return (
    <div className="min-h-screen bg-[#080F1E] flex items-center justify-center px-4">
      {/* BG */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(255,64,87,0.05) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4057] to-[#FF8C00] flex items-center justify-center">
              <Radio size={20} className="text-white" />
            </div>
            <span className="font-black text-2xl gradient-text">RESQ AI</span>
          </Link>
          <p className="text-white/40 mt-2 text-sm">Emergency Response Platform</p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Sign In</h2>

          {/* Demo credentials */}
          <div className="mb-6 p-4 bg-[#35D9FF]/5 border border-[#35D9FF]/20 rounded-xl">
            <p className="text-[#35D9FF] text-xs font-semibold mb-3 uppercase tracking-wider">🎮 Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => fillDemo('admin')} className="text-left p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={12} className="text-[#35D9FF]" />
                  <span className="text-white text-xs font-semibold">Administrator</span>
                </div>
                <div className="text-white/40 text-[10px]">admin@resqai.demo</div>
                <div className="text-white/40 text-[10px]">admin123</div>
              </button>
              <button onClick={() => fillDemo('citizen')} className="text-left p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={12} className="text-[#FF9F43]" />
                  <span className="text-white text-xs font-semibold">Citizen</span>
                </div>
                <div className="text-white/40 text-[10px]">citizen@resqai.demo</div>
                <div className="text-white/40 text-[10px]">citizen123</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-12"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-[#FF4057]/10 border border-[#FF4057]/30 text-[#FF4057] text-sm p-3 rounded-lg">
                {error}
              </motion.div>
            )}

            <button type="submit" disabled={state.isLoading} className="btn-primary w-full">
              {state.isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            New here?{' '}
            <Link to="/register" className="text-[#35D9FF] hover:text-[#35D9FF]/80 font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Radio, User, Mail, Phone, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function RegisterPage() {
  const { register, state } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPw: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPw) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    const res = await register(form.name, form.email, form.password, form.phone);
    if (res.success) navigate('/dashboard');
    else setError(res.error ?? 'Registration failed');
  };

  return (
    <div className="min-h-screen bg-[#080F1E] flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(53,217,255,0.04) 0%, transparent 60%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4057] to-[#FF8C00] flex items-center justify-center">
              <Radio size={20} className="text-white" />
            </div>
            <span className="font-black text-2xl gradient-text">RESQ AI</span>
          </Link>
          <p className="text-white/40 mt-2 text-sm">Create your citizen account</p>
        </div>

        <div className="glass-card p-8">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-6">
            <p className="text-yellow-400 text-xs">
              🔔 <strong>Demo Mode:</strong> Registration creates a local session. For production use Supabase Auth.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Arjun Kumar" className="input-field pl-9" required />
              </div>
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="your@email.com" className="input-field pl-9" required />
              </div>
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  placeholder="+91 98765 43210" className="input-field pl-9" />
              </div>
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="Min. 6 characters" className="input-field pl-9" required />
              </div>
            </div>
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="password" value={form.confirmPw} onChange={e => setForm({...form, confirmPw: e.target.value})}
                  placeholder="Repeat password" className="input-field pl-9" required />
              </div>
            </div>

            {error && (
              <div className="bg-[#FF4057]/10 border border-[#FF4057]/30 text-[#FF4057] text-sm p-3 rounded-lg">{error}</div>
            )}

            <button type="submit" disabled={state.isLoading} className="btn-primary w-full">
              {state.isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#35D9FF] hover:text-[#35D9FF]/80 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

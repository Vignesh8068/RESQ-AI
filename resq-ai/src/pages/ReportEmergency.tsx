import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, MapPin, Upload, Mic, MicOff, CheckCircle,
  X, Loader, Bot, ChevronDown, Navigation
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { triageIncidentWithAI } from '../services/geminiService';
import { CATEGORY_LABELS, TRANSLATIONS } from '../utils/constants';
import { EmergencyCategory, IncidentSeverity, AIAnalysis } from '../types';

const CATEGORIES: { value: EmergencyCategory; label: string; emoji: string }[] = [
  { value: 'fire', label: 'Fire Emergency', emoji: '🔥' },
  { value: 'road_accident', label: 'Road Accident', emoji: '🚗' },
  { value: 'medical', label: 'Medical Emergency', emoji: '🏥' },
  { value: 'flood', label: 'Flood', emoji: '🌊' },
  { value: 'building_collapse', label: 'Building Collapse', emoji: '🏚️' },
  { value: 'other', label: 'Other Emergency', emoji: '⚠️' },
];

const SEVERITIES: { value: IncidentSeverity; label: string; color: string }[] = [
  { value: 'critical', label: 'Critical', color: '#FF4057' },
  { value: 'high', label: 'High', color: '#FF9F43' },
  { value: 'medium', label: 'Medium', color: '#FFD93D' },
  { value: 'low', label: 'Low', color: '#20C997' },
];

export function ReportEmergency() {
  const { state, addIncident } = useApp();
  const navigate = useNavigate();
  const t = TRANSLATIONS[state.language];
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '' as EmergencyCategory | '',
    severity: 'medium' as IncidentSeverity,
    location: '',
    latitude: 0,
    longitude: 0,
    affectedPeople: 1,
    reporterName: state.user?.name ?? '',
    reporterPhone: state.user?.phone ?? '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [step, setStep] = useState(1);

  // Get GPS location
  const getLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(f => ({
          ...f,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          location: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        }));
        setIsLocating(false);
      },
      () => {
        // Demo fallback - Chennai coordinates
        setForm(f => ({
          ...f,
          latitude: 13.0827 + (Math.random() - 0.5) * 0.1,
          longitude: 80.2707 + (Math.random() - 0.5) * 0.1,
          location: 'Chennai, Tamil Nadu (Demo Location)',
        }));
        setIsLocating(false);
      }
    );
  };

  // Voice recording (browser Speech API)
  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser. Please type manually.');
      return;
    }
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    setIsRecording(true);
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SR();
    recognition.lang = state.language === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setForm(f => ({ ...f, description: f.description + ' ' + transcript }));
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  // AI Analysis
  const runAnalysis = async () => {
    if (!form.title && !form.description) return;
    setIsAnalyzing(true);
    const result = await triageIncidentWithAI(form.title, form.description);
    setAiAnalysis(result);
    setForm(f => ({
      ...f,
      category: result.suggestedCategory,
      severity: result.suggestedSeverity,
    }));
    setIsAnalyzing(false);
  };

  // Image upload
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) { alert('Please select an emergency category'); return; }
    if (!form.location) { alert('Please provide a location'); return; }

    const incident = await addIncident({
      title: form.title || `${CATEGORY_LABELS[form.category as EmergencyCategory]} – Emergency Report`,
      description: form.description,
      category: form.category as EmergencyCategory,
      severity: form.severity,
      status: 'reported',
      latitude: form.latitude,
      longitude: form.longitude,
      location: form.location,
      affectedPeople: form.affectedPeople,
      reporterName: form.reporterName,
      reporterPhone: form.reporterPhone,
      imageUrl: imagePreview || undefined,
      aiAnalysis: aiAnalysis ?? undefined,
      reporterId: state.user?.id,
    });

    setSubmittedId(incident.id);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="glass-card p-10 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-[#20C997]/10 border-2 border-[#20C997]/30 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={36} className="text-[#20C997]" />
          </motion.div>
          <h2 className="text-2xl font-black text-white mb-2">Report Submitted!</h2>
          <p className="text-white/50 mb-4">Your emergency report has been received. Response teams have been notified.</p>
          <div className="bg-white/5 rounded-xl px-4 py-3 mb-6">
            <div className="text-white/40 text-xs mb-1">Incident ID</div>
            <div className="text-[#35D9FF] font-mono font-bold text-lg">{submittedId}</div>
          </div>
          <div className="text-yellow-400 text-xs bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-6">
            ⚠️ This is a demo platform. In a real emergency, please call 112 (India Emergency) immediately.
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/my-reports')} className="btn-cyan flex-1">View My Reports</button>
            <button onClick={() => { setSubmitted(false); setForm(f => ({ ...f, title: '', description: '' })); }} className="btn-primary flex-1">
              New Report
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#FF4057]/10 border border-[#FF4057]/30 flex items-center justify-center">
            <AlertTriangle size={20} className="text-[#FF4057]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Report Emergency</h1>
            <p className="text-white/40 text-sm">Submit a detailed emergency report</p>
          </div>
        </div>
        <div className="bg-[#FF4057]/5 border border-[#FF4057]/20 rounded-xl p-3 text-xs text-[#FF4057]/80">
          🚨 <strong>Life-threatening emergency?</strong> Call <strong>112</strong> immediately. This platform is for incident reporting and coordination.
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-[#35D9FF]/20 text-[#35D9FF] rounded-full text-xs flex items-center justify-center font-bold">1</span>
            Incident Details
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">{t.title} *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Vehicle collision on NH-48 with trapped person"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="text-white/60 text-sm mb-1.5 flex items-center justify-between">
                <span>{t.description} *</span>
                <button type="button" onClick={toggleVoice}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg transition-all ${
                    isRecording ? 'bg-[#FF4057]/20 text-[#FF4057] border border-[#FF4057]/40' : 'bg-white/5 text-white/50 hover:text-white'
                  }`}>
                  {isRecording ? <><MicOff size={12} /> Stop Recording</> : <><Mic size={12} /> Voice Input</>}
                </button>
              </label>
              {isRecording && (
                <div className="mb-2 flex items-center gap-2 text-[#FF4057] text-xs">
                  <div className="w-2 h-2 bg-[#FF4057] rounded-full animate-pulse" />
                  Recording... Speak clearly in {state.language === 'ta' ? 'Tamil' : 'English'}
                </div>
              )}
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the emergency in detail: what happened, who is affected, current situation..."
                className="input-field min-h-[100px] resize-none"
                required
              />
            </div>

            {/* AI Analysis button */}
            {(form.title || form.description) && (
              <button
                type="button"
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="flex items-center gap-2 text-sm bg-[#35D9FF]/10 border border-[#35D9FF]/30 text-[#35D9FF] px-4 py-2 rounded-xl hover:bg-[#35D9FF]/20 transition-all"
              >
                {isAnalyzing ? (
                  <><Loader size={14} className="animate-spin" /> Analyzing with RESQ Intelligence...</>
                ) : (
                  <><Bot size={14} /> Analyze with AI</>
                )}
              </button>
            )}

            {/* AI Analysis result */}
            <AnimatePresence>
              {aiAnalysis && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#35D9FF]/5 border border-[#35D9FF]/20 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Bot size={16} className="text-[#35D9FF]" />
                    <span className="text-[#35D9FF] text-sm font-semibold">RESQ Intelligence Analysis</span>
                    <span className="text-white/30 text-xs">({Math.round(aiAnalysis.confidence * 100)}% confidence)</span>
                    {aiAnalysis.method === 'rule_based' && (
                      <span className="text-yellow-400 text-[10px] bg-yellow-500/10 px-2 py-0.5 rounded-full">Rule-Based Fallback</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="text-white/40 text-xs mb-1">Suggested Category</div>
                      <div className="text-white text-sm font-semibold">{CATEGORY_LABELS[aiAnalysis.suggestedCategory]}</div>
                    </div>
                    <div>
                      <div className="text-white/40 text-xs mb-1">Suggested Severity</div>
                      <div className={`text-sm font-bold uppercase ${
                        aiAnalysis.suggestedSeverity === 'critical' ? 'text-[#FF4057]' :
                        aiAnalysis.suggestedSeverity === 'high' ? 'text-[#FF9F43]' :
                        aiAnalysis.suggestedSeverity === 'medium' ? 'text-yellow-400' : 'text-[#20C997]'
                      }`}>{aiAnalysis.suggestedSeverity}</div>
                    </div>
                  </div>
                  <div className="text-white/60 text-xs mb-2">
                    <span className="text-white/40">Risk Indicators: </span>
                    {aiAnalysis.riskIndicators.join(' • ')}
                  </div>
                  <div className="text-xs text-yellow-400/80 bg-yellow-500/10 p-2 rounded-lg">
                    ⚠️ AI recommendations must be reviewed by a human administrator
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Category & Severity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-[#35D9FF]/20 text-[#35D9FF] rounded-full text-xs flex items-center justify-center font-bold">2</span>
            Classification
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-sm mb-2 block">{t.category} *</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.category === cat.value
                        ? 'border-[#35D9FF]/50 bg-[#35D9FF]/10 text-white'
                        : 'border-white/10 bg-white/3 text-white/50 hover:border-white/20 hover:text-white/70'
                    }`}
                  >
                    <div className="text-xl mb-1">{cat.emoji}</div>
                    <div className="text-xs font-medium">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white/60 text-sm mb-2 block">{t.severity}</label>
              <div className="grid grid-cols-4 gap-2">
                {SEVERITIES.map(sev => (
                  <button
                    key={sev.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, severity: sev.value }))}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                      form.severity === sev.value
                        ? 'border-opacity-50 text-white'
                        : 'border-white/10 text-white/40 hover:text-white/60'
                    }`}
                    style={form.severity === sev.value ? { borderColor: sev.color + '80', background: sev.color + '15', color: sev.color } : {}}
                  >
                    {sev.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white/60 text-sm mb-1.5 block">{t.affected} Approximately</label>
              <input
                type="number"
                min="1"
                value={form.affectedPeople}
                onChange={e => setForm(f => ({ ...f, affectedPeople: parseInt(e.target.value) || 1 }))}
                className="input-field"
              />
            </div>
          </div>
        </motion.div>

        {/* Location */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-[#35D9FF]/20 text-[#35D9FF] rounded-full text-xs flex items-center justify-center font-bold">3</span>
            Location
          </h3>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="Enter location or use GPS..."
                className="input-field flex-1"
                required
              />
              <button type="button" onClick={getLocation} disabled={isLocating}
                className="btn-cyan flex items-center gap-2 flex-shrink-0 text-sm">
                {isLocating ? <Loader size={15} className="animate-spin" /> : <Navigation size={15} />}
                GPS
              </button>
            </div>
            {form.latitude !== 0 && (
              <div className="text-xs text-white/40 flex items-center gap-1">
                <MapPin size={12} className="text-[#35D9FF]" />
                {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
              </div>
            )}
          </div>
        </motion.div>

        {/* Contact & Photo */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-[#35D9FF]/20 text-[#35D9FF] rounded-full text-xs flex items-center justify-center font-bold">4</span>
            Contact & Evidence
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/60 text-sm mb-1.5 block">{t.yourName} *</label>
                <input type="text" value={form.reporterName} onChange={e => setForm(f => ({ ...f, reporterName: e.target.value }))}
                  placeholder="Your name" className="input-field" required />
              </div>
              <div>
                <label className="text-white/60 text-sm mb-1.5 block">{t.yourPhone} *</label>
                <input type="tel" value={form.reporterPhone} onChange={e => setForm(f => ({ ...f, reporterPhone: e.target.value }))}
                  placeholder="+91 xxxxxxxxxx" className="input-field" required />
              </div>
            </div>

            {/* Photo upload */}
            <div>
              <label className="text-white/60 text-sm mb-1.5 block">Photo Evidence (optional)</label>
              <div
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  imagePreview ? 'border-[#35D9FF]/40' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Evidence" className="max-h-32 mx-auto rounded-lg" />
                    <button type="button" onClick={e => { e.stopPropagation(); setImagePreview(''); setImageFile(null); }}
                      className="absolute top-1 right-1 bg-[#FF4057] text-white rounded-full p-1">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={24} className="text-white/30 mx-auto mb-2" />
                    <p className="text-white/40 text-sm">Click to upload photo</p>
                    <p className="text-white/20 text-xs mt-1">JPG, PNG, WebP – max 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <button type="submit" className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-3">
            <AlertTriangle size={20} />
            Submit Emergency Report
          </button>
          <p className="text-center text-white/30 text-xs mt-3">
            Your report will be reviewed by administrators. Response time may vary.
          </p>
        </motion.div>
      </form>
    </div>
  );
}

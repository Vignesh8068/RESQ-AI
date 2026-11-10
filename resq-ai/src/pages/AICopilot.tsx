import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Loader, AlertTriangle, CheckCircle, Zap, Info, Sparkles } from 'lucide-react';
import { triageIncidentWithAI, isGeminiConfigured } from '../services/geminiService';
import { AIAnalysis } from '../types';
import { CATEGORY_LABELS, SEVERITY_BG } from '../utils/constants';
import { useApp } from '../context/AppContext';

export function AICopilot() {
  const { state } = useApp();
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIAnalysis | null>(null);
  const [history, setHistory] = useState<{ input: string; result: AIAnalysis }[]>([]);

  const examples = [
    "Three vehicles collided. Several people are injured. One person is trapped inside a car.",
    "Fire on 4th floor of apartment. Residents evacuating. 20 people still inside.",
    "Elderly man collapsed at the beach. Bystanders doing CPR. No AED available.",
    "Water level rising rapidly. Streets flooded. Residents on rooftops.",
    "Building under construction partially collapsed. Workers trapped in debris.",
  ];

  const analyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    const res = await triageIncidentWithAI('Emergency Triage Request', input);
    setResult(res);
    setHistory(h => [{ input, result: res }, ...h].slice(0, 5));
    setIsAnalyzing(false);
  };

  const severityColor = result
    ? result.suggestedSeverity === 'critical' ? '#FF4057' :
      result.suggestedSeverity === 'high' ? '#FF9F43' :
      result.suggestedSeverity === 'medium' ? '#FFD93D' : '#20C997'
    : '#35D9FF';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#35D9FF]/20 to-[#35D9FF]/5 border border-[#35D9FF]/30 flex items-center justify-center">
            <Bot size={24} className="text-[#35D9FF]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">RESQ Intelligence</h1>
            <p className="text-white/40 text-sm">AI Emergency Copilot</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl border"
            style={{
              backgroundColor: isGeminiConfigured ? '#20C99715' : '#FF9F4315',
              borderColor: isGeminiConfigured ? '#20C99740' : '#FF9F4340'
            }}>
            {isGeminiConfigured ? (
              <>
                <Sparkles size={13} className="text-[#20C997]" />
                <span className="text-[#20C997] text-xs font-semibold">Gemini 1.5 Flash Active</span>
              </>
            ) : (
              <>
                <Info size={13} className="text-yellow-400" />
                <span className="text-yellow-400 text-xs font-semibold">Rule-Based Fallback (Demo)</span>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* API notice */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="glass-card p-4 mb-6 border-[#35D9FF]/20">
        <div className="text-[#35D9FF] text-sm font-semibold mb-1">About RESQ Intelligence</div>
        <div className="text-white/50 text-xs leading-relaxed">
          Currently running in <strong className="text-yellow-400">rule-based fallback mode</strong>. 
          Configure <code className="bg-white/5 px-1 py-0.5 rounded">VITE_GEMINI_API_KEY</code> in <code className="bg-white/5 px-1 py-0.5 rounded">.env</code> for real Google Gemini AI analysis.
          All recommendations must be reviewed by a human administrator before action.
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Zap size={16} className="text-[#35D9FF]" /> Analyze Incident Description
            </h3>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste or type an incident description to analyze..."
              className="input-field min-h-[140px] resize-none mb-4"
            />
            <button onClick={analyze} disabled={isAnalyzing || !input.trim()} className="btn-primary w-full flex items-center justify-center gap-2">
              {isAnalyzing ? (
                <><Loader size={16} className="animate-spin" /> Analyzing...</>
              ) : (
                <><Bot size={16} /> Analyze with RESQ Intelligence</>
              )}
            </button>
          </motion.div>

          {/* Examples */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-card p-6">
            <h3 className="font-bold text-white mb-3 text-sm">Example Descriptions</h3>
            <div className="space-y-2">
              {examples.map((ex, i) => (
                <button key={i} onClick={() => setInput(ex)}
                  className="w-full text-left text-white/50 text-xs p-2.5 rounded-lg bg-white/3 hover:bg-white/8 hover:text-white/70 transition-all line-clamp-2">
                  "{ex}"
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Result panel */}
        <div>
          <AnimatePresence mode="wait">
            {isAnalyzing && (
              <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass-card p-10 text-center">
                <div className="relative mx-auto w-16 h-16 mb-4">
                  <div className="w-16 h-16 border-2 border-[#35D9FF]/20 rounded-full" />
                  <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-[#35D9FF] rounded-full animate-spin" />
                  <Bot size={22} className="text-[#35D9FF] absolute inset-0 m-auto" />
                </div>
                <div className="text-white font-semibold">RESQ Intelligence Processing</div>
                <div className="text-white/40 text-sm mt-1">Analyzing incident description...</div>
                <div className="mt-4 flex justify-center gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-[#35D9FF]/50 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </motion.div>
            )}

            {result && !isAnalyzing && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                  <CheckCircle size={18} className="text-[#20C997]" />
                  <span className="text-white font-bold">Analysis Complete</span>
                  <span className="text-white/30 text-xs ml-auto">
                    {Math.round(result.confidence * 100)}% confidence
                  </span>
                </div>

                {/* Summary */}
                <div>
                  <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Summary</div>
                  <p className="text-white/80 text-sm leading-relaxed">{result.summary}</p>
                </div>

                {/* Category & Severity */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-white/40 text-xs mb-1">Suggested Category</div>
                    <div className="text-white font-bold text-sm">{CATEGORY_LABELS[result.suggestedCategory]}</div>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: `${severityColor}10`, border: `1px solid ${severityColor}30` }}>
                    <div className="text-white/40 text-xs mb-1">Suggested Severity</div>
                    <div className="font-bold text-sm uppercase" style={{ color: severityColor }}>{result.suggestedSeverity}</div>
                  </div>
                </div>

                {/* Risk Indicators */}
                <div>
                  <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Risk Indicators</div>
                  <div className="space-y-1.5">
                    {result.riskIndicators.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <AlertTriangle size={12} className="text-[#FF9F43] flex-shrink-0" />
                        <span className="text-white/70">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Actions */}
                <div>
                  <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Recommended Actions</div>
                  <div className="space-y-1.5">
                    {result.recommendedActions.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 rounded bg-[#35D9FF]/10 text-[#35D9FF] flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <span className="text-white/70">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Keywords */}
                {result.keywords.length > 0 && (
                  <div>
                    <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Detected Keywords</div>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map(kw => (
                        <span key={kw} className="badge bg-white/5 text-white/50 border-white/10">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-400">
                  ⚠️ AI recommendations require human administrator review before any action is taken.
                </div>
              </motion.div>
            )}

            {!result && !isAnalyzing && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-card p-10 text-center">
                <Bot size={48} className="text-white/10 mx-auto mb-4" />
                <div className="text-white/40 font-medium">Enter an incident description</div>
                <div className="text-white/20 text-sm mt-1">The AI will analyze and suggest category, severity, and actions</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* History */}
          {history.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 glass-card p-4">
              <div className="text-white/40 text-xs uppercase tracking-wider mb-3">Recent Analyses</div>
              <div className="space-y-2">
                {history.map((h, i) => (
                  <button key={i} onClick={() => { setInput(h.input); setResult(h.result); }}
                    className="w-full text-left p-2.5 rounded-lg bg-white/3 hover:bg-white/8 transition-all">
                    <div className="text-white/60 text-xs line-clamp-1">"{h.input}"</div>
                    <div className="flex gap-2 mt-1">
                      <span className={`badge text-[10px] ${SEVERITY_BG[h.result.suggestedSeverity]}`}>{h.result.suggestedSeverity}</span>
                      <span className="text-white/30 text-[10px]">{CATEGORY_LABELS[h.result.suggestedCategory]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

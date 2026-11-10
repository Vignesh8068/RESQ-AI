import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, X, ChevronRight, AlertTriangle, Users, Sparkles,
  ShieldCheck, Activity, Send, CheckCircle2, Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateIncidentPriority } from '../services/prioritizationEngine';
import { getRecommendedTeams } from '../services/dispatchEngine';
import { isGeminiConfigured, triageIncidentWithAI } from '../services/geminiService';

export function ResqAssistantPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { state, stats } = useApp();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; details?: any }>>([
    {
      sender: 'assistant',
      text: `Greetings Commander. I am RESQ Intelligence, your mission operations copilot. Operating in ${
        isGeminiConfigured ? 'Google Gemini 1.5 Hybrid' : 'Local Explainable Intelligence'
      } mode. How may I assist your dispatch coordination?`,
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Quick Action Buttons
  const handleQuickAction = async (actionType: 'explain_priority' | 'overloaded' | 'recommend' | 'summary' | 'critical') => {
    setIsProcessing(true);

    if (actionType === 'explain_priority') {
      const topIncident = state.incidents.find((i) => i.status !== 'resolved') || state.incidents[0];
      if (!topIncident) {
        setMessages((m) => [...m, { sender: 'assistant', text: 'No active incidents currently available to evaluate.' }]);
        setIsProcessing(false);
        return;
      }
      const prio = calculateIncidentPriority(topIncident);
      const text = `**Priority Analysis for ${topIncident.title}** (Score: ${prio.score}/100):\n\n` +
        `• **Tier**: ${prio.tier.toUpperCase()} (${prio.urgencyBadge})\n` +
        `• **Key Factors**:\n` +
        prio.factors.map((f) => `  - ${f.name}: ${f.score}/${f.maxScore} pts (${f.description})`).join('\n') +
        `\n\n• **Core Rationale**:\n` +
        prio.reasons.map((r) => `  - ${r}`).join('\n') +
        `\n\n*Note: Recommendations must be confirmed by human dispatchers.*`;

      setMessages((m) => [...m, { sender: 'assistant', text }]);
    } else if (actionType === 'overloaded') {
      const busyTeams = state.teams.filter((t) => t.status === 'busy' || t.status === 'assigned');
      const text = `**Squad Allocation & Utilization Audit**:\n\n` +
        `• **Current Utilization**: ${stats.teamUtilizationRate}% (${stats.busyTeams} deployed / ${stats.availableTeams} ready)\n` +
        (busyTeams.length > 0
          ? `• **Deployed Units**:\n` + busyTeams.map((t) => `  - ${t.name} (Assigned to: ${t.currentAssignment || 'Active mission'})`).join('\n')
          : `• All squads currently available in standby status.`) +
        `\n\n${stats.teamUtilizationRate > 75 ? '⚠️ Warning: Squad utilization above 75%. Prioritize critical assignments.' : '✅ Readiness status optimal.'}`;

      setMessages((m) => [...m, { sender: 'assistant', text }]);
    } else if (actionType === 'critical') {
      const criticals = state.incidents.filter((i) => (i.severity === 'critical' || (i.priorityScore && i.priorityScore >= 80)) && i.status !== 'resolved');
      const text = `**Unresolved Critical Incidents Audit** (${criticals.length} Active):\n\n` +
        (criticals.length > 0
          ? criticals.map((c) => `• [${c.id}] ${c.title} — Location: ${c.location} | Affected: ${c.affectedPeople} | Status: ${c.status.toUpperCase()}`).join('\n\n')
          : '✅ Zero unaddressed critical incidents. All high-urgency events cleared.') +
        `\n\n*Dispatcher action recommended to assign available units.*`;

      setMessages((m) => [...m, { sender: 'assistant', text }]);
    } else if (actionType === 'recommend') {
      const pendingIncident = state.incidents.find((i) => i.status === 'reported' || i.status === 'pending') || state.incidents[0];
      if (!pendingIncident) {
        setMessages((m) => [...m, { sender: 'assistant', text: 'All active incidents have already been assigned response teams.' }]);
        setIsProcessing(false);
        return;
      }
      const recs = getRecommendedTeams(pendingIncident, state.teams);
      const topRec = recs.find((r) => r.isRecommended);

      const text = `**Intelligent Squad Dispatch Recommendation** for *${pendingIncident.title}*:\n\n` +
        (topRec
          ? `🎯 **Recommended Unit**: **${topRec.team.name}**\n` +
            `• **Distance**: ${topRec.distanceKm} km (Haversine geodesic straight-line)\n` +
            `• **Capability Match**: ${topRec.compatibilityReason}\n` +
            `• **Unit Readiness**: ${topRec.team.status.toUpperCase()} (${topRec.team.members} responders on duty)\n` +
            `• **Dispatcher Confirmation**: Head to the Assignment Center or Incident Details to confirm deployment.`
          : '⚠️ No fully compatible and available squad found within range. Consider manual mutual-aid reassignment.');

      setMessages((m) => [...m, { sender: 'assistant', text }]);
    } else if (actionType === 'summary') {
      const text = `**Mission Operational Situation Briefing**:\n\n` +
        `• **Active Incidents**: ${stats.total - stats.resolved} (${stats.critical} Critical, ${stats.high} High)\n` +
        `• **Total Lives Impacted**: ${stats.livesImpacted} individuals\n` +
        `• **Average Response Interval**: ${stats.avgResponseTimeMinutes !== null ? `${stats.avgResponseTimeMinutes} minutes` : 'Awaiting baseline'}\n` +
        `• **Squad Readiness**: ${stats.availableTeams} Available, ${stats.busyTeams} Deployed (${stats.teamUtilizationRate}% load)\n` +
        `• **Operational Mode**: ${stats.isDemoData ? 'DEMO DATA (Verified Local Data Engine)' : 'PRODUCTION DATABASE (Supabase Live)'}`;

      setMessages((m) => [...m, { sender: 'assistant', text }]);
    }

    setIsProcessing(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setQuery('');
    setMessages((m) => [...m, { sender: 'user', text: userText }]);
    setIsProcessing(true);

    try {
      if (isGeminiConfigured) {
        const aiTriage = await triageIncidentWithAI('Mission Query', userText);
        setMessages((m) => [
          ...m,
          {
            sender: 'assistant',
            text: `[Gemini 1.5 Flash Analysis]:\n${aiTriage.summary}\n\nSuggested Actions:\n${aiTriage.recommendedActions.map((a) => `• ${a}`).join('\n')}`,
          },
        ]);
      } else {
        // Transparent explainable local natural language parsing
        await new Promise((r) => setTimeout(r, 600));
        const lower = userText.toLowerCase();

        let reply = '';
        if (lower.includes('priority') || lower.includes('score')) {
          handleQuickAction('explain_priority');
          return;
        } else if (lower.includes('team') || lower.includes('squad') || lower.includes('busy')) {
          handleQuickAction('overloaded');
          return;
        } else if (lower.includes('critical') || lower.includes('urgent') || lower.includes('danger')) {
          handleQuickAction('critical');
          return;
        } else if (lower.includes('recommend') || lower.includes('dispatch') || lower.includes('nearest')) {
          handleQuickAction('recommend');
          return;
        } else {
          reply = `I analyzed your query: "${userText}".\n\nOperational telemetry indicates ${
            stats.total - stats.resolved
          } active missions requiring response. Click any shortcut below for detailed priority calculations, squad recommendations, or situational briefings.`;
          setMessages((m) => [...m, { sender: 'assistant', text: reply }]);
        }
      }
    } catch {
      setMessages((m) => [
        ...m,
        { sender: 'assistant', text: 'Telemetry processing error. Standing by for command.' },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-end p-4 bg-black/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="glass-card w-full max-w-lg h-[90vh] flex flex-col border-[#35D9FF]/30 shadow-2xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(180deg, rgba(16, 27, 48, 0.98) 0%, rgba(8, 15, 30, 0.99) 100%)',
          boxShadow: '0 0 50px rgba(53, 217, 255, 0.15)',
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#35D9FF]/20 to-[#35D9FF]/5 border border-[#35D9FF]/40 flex items-center justify-center">
              <Bot size={20} className="text-[#35D9FF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">RESQ INTELLIGENCE</span>
                <span className="badge bg-[#35D9FF]/10 text-[#35D9FF] border-[#35D9FF]/30 text-[9px]">
                  COPILOT
                </span>
              </div>
              <p className="text-white/40 text-[10px]">Explainable Dispatch Assistance Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Decision Shortcuts */}
        <div className="p-3 bg-white/2 border-b border-white/5 flex gap-1.5 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => handleQuickAction('explain_priority')}
            className="px-2.5 py-1.5 rounded-lg bg-[#FF4057]/10 hover:bg-[#FF4057]/20 border border-[#FF4057]/30 text-white text-[11px] whitespace-nowrap flex items-center gap-1.5 transition-all"
          >
            <AlertTriangle size={12} className="text-[#FF4057]" /> Explain Priority
          </button>
          <button
            onClick={() => handleQuickAction('recommend')}
            className="px-2.5 py-1.5 rounded-lg bg-[#35D9FF]/10 hover:bg-[#35D9FF]/20 border border-[#35D9FF]/30 text-white text-[11px] whitespace-nowrap flex items-center gap-1.5 transition-all"
          >
            <Sparkles size={12} className="text-[#35D9FF]" /> Recommend Squad
          </button>
          <button
            onClick={() => handleQuickAction('overloaded')}
            className="px-2.5 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-white text-[11px] whitespace-nowrap flex items-center gap-1.5 transition-all"
          >
            <Users size={12} className="text-orange-400" /> Squad Readiness
          </button>
          <button
            onClick={() => handleQuickAction('summary')}
            className="px-2.5 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-white text-[11px] whitespace-nowrap flex items-center gap-1.5 transition-all"
          >
            <Activity size={12} className="text-green-400" /> Situation Brief
          </button>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scroll">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-[#35D9FF]/15 text-white border border-[#35D9FF]/30'
                    : 'bg-white/5 text-white/80 border border-white/10'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-white/30 mt-1 px-1">
                {msg.sender === 'user' ? 'Dispatcher' : 'RESQ Intelligence'}
              </span>
            </motion.div>
          ))}
          {isProcessing && (
            <div className="flex items-center gap-2 text-white/40 text-xs p-2">
              <div className="w-2 h-2 rounded-full bg-[#35D9FF] animate-pulse" />
              <span>Analyzing operational telemetry...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-white/2 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about priorities, nearest squads, or mission briefings..."
            className="input-field py-2 text-xs flex-1"
          />
          <button
            type="submit"
            disabled={isProcessing || !query.trim()}
            className="btn-cyan py-2 px-3 flex items-center justify-center flex-shrink-0"
          >
            <Send size={14} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}

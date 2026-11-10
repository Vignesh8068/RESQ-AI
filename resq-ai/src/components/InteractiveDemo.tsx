import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Play, CheckCircle, ChevronRight, RotateCcw, AlertTriangle,
  Bot, Shield, MapPin, Users, Activity, Sparkles, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Incident } from '../types';

interface DemoStep {
  step: number;
  title: string;
  actor: 'Citizen' | 'AI' | 'Admin' | 'System';
  description: string;
  actionText: string;
  badgeColor: string;
}

const DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    title: 'Citizen Enters RESQ AI',
    actor: 'Citizen',
    description: 'Citizen identifies an active emergency on NH-48 junction involving multiple vehicles and trapped victims.',
    actionText: 'Begin Emergency Report',
    badgeColor: '#35D9FF',
  },
  {
    step: 2,
    title: 'Citizen Submits Report',
    actor: 'Citizen',
    description: 'Report created: "Major collision near Koyambedu. 3 cars, 1 person trapped, 8 injured. Need urgent extrication & EMS."',
    actionText: 'Submit Real-time Incident',
    badgeColor: '#35D9FF',
  },
  {
    step: 3,
    title: 'RESQ Intelligence AI Triage',
    actor: 'AI',
    description: 'RESQ Intelligence analyzes description, flags "trapped", "collision", assigns "CRITICAL" severity with 96% confidence.',
    actionText: 'Process AI Recommendation',
    badgeColor: '#8B5CF6',
  },
  {
    step: 4,
    title: 'Admin Command Center Alert',
    actor: 'Admin',
    description: 'Incident broadcasts instantly to Admin Command Center feed and updates pending incident metrics.',
    actionText: 'Open Command Center',
    badgeColor: '#FF4057',
  },
  {
    step: 5,
    title: 'Critical Audio/Visual Alert',
    actor: 'System',
    description: 'Pulsating emergency alert triggers across the operational dashboard with critical priority banner.',
    actionText: 'Acknowledge Alert',
    badgeColor: '#FF4057',
  },
  {
    step: 6,
    title: 'Interactive Map Plotting',
    actor: 'System',
    description: 'Incident coordinates [13.0827, 80.2707] plotted with pulsating critical marker on OpenStreetMap.',
    actionText: 'Inspect Live Map',
    badgeColor: '#20C997',
  },
  {
    step: 7,
    title: 'Admin Verification',
    actor: 'Admin',
    description: 'Incident verified by Command Chief. Status transitions from "Reported" to "Verified".',
    actionText: 'Verify Incident',
    badgeColor: '#FF9F43',
  },
  {
    step: 8,
    title: 'Resource Allocation',
    actor: 'Admin',
    description: 'Fire & Rescue Unit Alpha is assigned and dispatched for vehicle extrication.',
    actionText: 'Dispatch Rescue Unit',
    badgeColor: '#FF9F43',
  },
  {
    step: 9,
    title: 'Status: In Progress',
    actor: 'System',
    description: 'First responders arrive on scene. Rescue operations underway. Live timeline records status update.',
    actionText: 'Monitor Progress',
    badgeColor: '#35D9FF',
  },
  {
    step: 10,
    title: 'Incident Resolved',
    actor: 'Admin',
    description: 'Victims extricated, stabilized, and transported. Road cleared. Incident marked "Resolved".',
    actionText: 'Mark Incident Resolved',
    badgeColor: '#20C997',
  },
  {
    step: 11,
    title: 'Stats & Metrics Synchronized',
    actor: 'System',
    description: 'Resolved metrics increase, active critical incidents decrease, and response analytics update in real time.',
    actionText: 'View Analytics Summary',
    badgeColor: '#20C997',
  },
  {
    step: 12,
    title: 'Full Audit Timeline Complete',
    actor: 'System',
    description: 'Complete lifecycle audit log preserved with timestamps, actor attribution, and verification records.',
    actionText: 'Finish Demonstration',
    badgeColor: '#35D9FF',
  },
];

export function InteractiveDemoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { state, dispatch, addIncident, updateIncidentStatus, assignTeam } = useApp();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [demoIncidentId, setDemoIncidentId] = useState<string>('DEMO-LIVE-ACCIDENT');
  const [isExecuting, setIsExecuting] = useState(false);

  if (!isOpen) return null;

  const stepInfo = DEMO_STEPS[currentStep];

  const handleNextStep = async () => {
    setIsExecuting(true);
    const stepNum = currentStep + 1;

    switch (stepNum) {
      case 1:
        // Step 1: Citizen opens app
        navigate('/report');
        break;

      case 2:
        // Step 2: Submit emergency report
        const newInc = await addIncident({
          title: '[DEMO] Multi-Vehicle Crash & Extrication – NH-48',
          description: 'Three vehicles collided with heavy intrusion. Multiple casualties. One driver is pinned beneath steering column. Smoke visible.',
          category: 'road_accident',
          severity: 'critical',
          status: 'reported',
          latitude: 13.0827,
          longitude: 80.2707,
          location: 'NH-48 Corridor, Koyambedu Hub, Chennai',
          affectedPeople: 8,
          reporterName: 'Demo Citizen (Live Simulation)',
          reporterPhone: '+91 99887 76655',
          isDemo: true,
          aiAnalysis: {
            suggestedCategory: 'road_accident',
            suggestedSeverity: 'critical',
            summary: 'CRITICAL road accident detected. Trapped passenger extrication required. Immediate rescue dispatch recommended.',
            riskIndicators: ['Multiple vehicles involved', 'Person pinned/trapped', 'Heavy intrusion & smoke'],
            recommendedActions: ['Immediate human verification', 'Dispatch Fire & Rescue extrication unit', 'Alert Trauma center'],
            confidence: 0.96,
            method: 'rule_based',
            keywords: ['collided', 'pinned', 'trapped', 'casualties'],
          },
        });
        setDemoIncidentId(newInc.id);
        break;

      case 3:
        // Step 3: AI analysis
        navigate('/admin/copilot');
        break;

      case 4:
        // Step 4: Admin dashboard
        navigate('/admin');
        break;

      case 5:
        // Step 5: Critical alert
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: `DEMO-NOTIF-${Date.now()}`,
            title: '🚨 CRITICAL CODE RED ALERT',
            message: 'Major multi-vehicle collision with entrapment at NH-48 Corridor. Instant triage initiated.',
            type: 'critical',
            read: false,
            incidentId: demoIncidentId,
            createdAt: new Date().toISOString(),
          },
        });
        break;

      case 6:
        // Step 6: Map view
        navigate('/map');
        break;

      case 7:
        // Step 7: Admin verifies
        updateIncidentStatus(demoIncidentId, 'verified', 'Command Chief (Admin)');
        navigate('/admin/incidents');
        break;

      case 8:
        // Step 8: Assign team
        const availableTeam = state.teams.find(t => t.status === 'available') || state.teams[0];
        if (availableTeam) {
          assignTeam(demoIncidentId, availableTeam.id);
        }
        break;

      case 9:
        // Step 9: In Progress
        updateIncidentStatus(demoIncidentId, 'in_progress', 'First Responder Dispatch');
        navigate('/admin/incidents');
        break;

      case 10:
        // Step 10: Resolved
        updateIncidentStatus(demoIncidentId, 'resolved', 'Incident Commander');
        break;

      case 11:
        // Step 11: Analytics
        navigate('/admin/analytics');
        break;

      case 12:
        // Step 12: Complete
        navigate('/admin');
        break;

      default:
        break;
    }

    setIsExecuting(false);

    if (currentStep < DEMO_STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      onClose();
    }
  };

  const resetDemo = () => {
    setCurrentStep(0);
    navigate('/admin');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-card w-full max-w-xl p-6 border-[#35D9FF]/40 shadow-2xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(16,27,48,0.95) 0%, rgba(8,15,30,0.98) 100%)',
          boxShadow: '0 0 50px rgba(53,217,255,0.2)',
        }}
      >
        {/* Top header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#FF4057] to-[#FF8C00] text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">HACKATHON LIVE DEMO</span>
                <span className="badge bg-[#35D9FF]/10 text-[#35D9FF] border-[#35D9FF]/30 text-[10px]">
                  STEP {stepInfo.step} OF 12
                </span>
              </div>
              <p className="text-white/40 text-xs">2-Minute Automated Rescue Lifecycle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/5 rounded-full h-1.5 mb-5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#FF4057] via-[#FF9F43] to-[#35D9FF]"
            animate={{ width: `${((currentStep + 1) / DEMO_STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step details */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `${stepInfo.badgeColor}20`,
                color: stepInfo.badgeColor,
                border: `1px solid ${stepInfo.badgeColor}40`,
              }}
            >
              Actor: {stepInfo.actor}
            </span>
            <span className="text-white/40 text-xs font-mono">Stage {stepInfo.step}/12</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{stepInfo.title}</h3>
          <p className="text-white/70 text-sm leading-relaxed">{stepInfo.description}</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={resetDemo}
            className="btn-ghost text-xs py-3 px-4 flex items-center gap-1.5 text-white/60 hover:text-white"
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            onClick={handleNextStep}
            disabled={isExecuting}
            className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2 font-bold text-sm"
          >
            {currentStep < DEMO_STEPS.length - 1 ? (
              <>
                <span>{stepInfo.actionText}</span>
                <ChevronRight size={16} />
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                <span>Complete Simulation</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

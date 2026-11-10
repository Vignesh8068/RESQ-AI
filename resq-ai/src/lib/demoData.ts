import { Incident, ResponseTeam, Notification, IncidentHistory, AIAnalysis } from '../types';
import { calculateIncidentPriority } from '../services/prioritizationEngine';

// ============================================================
// DEMO DATA – All records clearly identified as demonstration data
// ============================================================

const RAW_DEMO_INCIDENTS: Omit<Incident, 'priorityScore' | 'priorityTier' | 'priorityReasons' | 'priorityFactors'>[] = [
  {
    id: 'DEMO-INC-001',
    title: '[DEMO] Major Road Accident – NH-48 Junction',
    description: 'Three vehicles collided at the NH-48 junction near CMBT. Several people are injured. One person is reportedly trapped inside a vehicle. Heavy traffic buildup in both directions.',
    category: 'road_accident',
    severity: 'critical',
    status: 'in_progress',
    latitude: 13.0827,
    longitude: 80.2707,
    location: 'NH-48 Junction, Koyambedu, Chennai',
    affectedPeople: 8,
    reporterName: 'Arjun Kumar',
    reporterPhone: '+91 98765 43210',
    reporterEmail: 'arjun@demo.com',
    isDemo: true,
    assignedTeamId: 'DEMO-TEAM-001',
    assignedTeamName: 'Fire & Rescue Unit Alpha',
    assignedAt: new Date(Date.now() - 2700000).toISOString(),
    responseStartedAt: new Date(Date.now() - 2700000).toISOString(),
    aiAnalysis: {
      suggestedCategory: 'road_accident',
      suggestedSeverity: 'critical',
      summary: 'Multi-vehicle collision with trapped victim and multiple injuries. Immediate rescue and medical response required.',
      riskIndicators: ['Multiple vehicles involved', 'Person trapped', 'Multiple injuries reported', 'Traffic disruption'],
      recommendedActions: ['Dispatch fire & rescue for extrication', 'Send multiple ambulances', 'Request traffic control', 'Set up incident command post'],
      confidence: 0.94,
      method: 'rule_based',
      keywords: ['collision', 'injured', 'trapped', 'vehicles'],
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    verifiedAt: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: 'DEMO-INC-002',
    title: '[DEMO] Building Fire – Residential Complex',
    description: 'Smoke and flames visible from the 4th floor of a residential apartment. Residents are evacuating. Fire spreading rapidly. Approximately 20 residents still inside.',
    category: 'fire',
    severity: 'critical',
    status: 'verified',
    latitude: 13.0569,
    longitude: 80.2425,
    location: 'Anna Nagar, Chennai',
    affectedPeople: 20,
    reporterName: 'Priya Sharma',
    reporterPhone: '+91 87654 32109',
    isDemo: true,
    aiAnalysis: {
      suggestedCategory: 'fire',
      suggestedSeverity: 'critical',
      summary: 'Active building fire with residents trapped. Immediate fire suppression and evacuation required.',
      riskIndicators: ['Active flames', 'Rapid spread', 'Residents trapped', 'Multi-story building'],
      recommendedActions: ['Dispatch fire brigade immediately', 'Ambulance standby', 'Evacuate adjacent units', 'Cut power to building'],
      confidence: 0.97,
      method: 'rule_based',
      keywords: ['fire', 'flames', 'smoke', 'evacuating'],
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 5400000).toISOString(),
    verifiedAt: new Date(Date.now() - 6000000).toISOString(),
  },
  {
    id: 'DEMO-INC-003',
    title: '[DEMO] Flash Flood – Low-lying Area',
    description: 'Water level rising rapidly in Velachery lake area. Several streets submerged. Residents stranded on rooftops. Water has entered ground floor homes.',
    category: 'flood',
    severity: 'high',
    status: 'pending',
    latitude: 12.9790,
    longitude: 80.2209,
    location: 'Velachery, Chennai',
    affectedPeople: 45,
    reporterName: 'Murugan Selvam',
    reporterPhone: '+91 76543 21098',
    isDemo: true,
    aiAnalysis: {
      suggestedCategory: 'flood',
      suggestedSeverity: 'high',
      summary: 'Flash flood with multiple residents stranded. Boat rescue and evacuation teams needed.',
      riskIndicators: ['Rapidly rising water', 'Residents stranded', 'Ground floor inundation', 'Lake overflow'],
      recommendedActions: ['Deploy boat rescue teams', 'Set up relief camp', 'Issue flood alert', 'Monitor water levels'],
      confidence: 0.89,
      method: 'rule_based',
      keywords: ['flood', 'water', 'stranded', 'submerged'],
    },
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'DEMO-INC-004',
    title: '[DEMO] Medical Emergency – Cardiac Arrest',
    description: 'Elderly man collapsed at Marina Beach. Bystanders performing CPR. Requires immediate medical attention. No AED available.',
    category: 'medical',
    severity: 'critical',
    status: 'resolved',
    latitude: 13.0500,
    longitude: 80.2824,
    location: 'Marina Beach, Chennai',
    affectedPeople: 1,
    reporterName: 'Kavitha Rajan',
    reporterPhone: '+91 65432 10987',
    isDemo: true,
    assignedTeamId: 'DEMO-TEAM-002',
    assignedTeamName: 'Medical Response Team Beta',
    assignedAt: new Date(Date.now() - 85800000).toISOString(),
    responseStartedAt: new Date(Date.now() - 85800000).toISOString(),
    resolvedAt: new Date(Date.now() - 82800000).toISOString(),
    aiAnalysis: {
      suggestedCategory: 'medical',
      suggestedSeverity: 'critical',
      summary: 'Cardiac arrest with CPR in progress. Advanced life support ambulance required immediately.',
      riskIndicators: ['Cardiac arrest', 'No AED', 'Elderly patient', 'Public location'],
      recommendedActions: ['Dispatch ALS ambulance', 'Guide bystanders via phone', 'Alert nearest hospital', 'Send paramedic unit'],
      confidence: 0.96,
      method: 'rule_based',
      keywords: ['collapsed', 'CPR', 'cardiac', 'AED'],
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 82800000).toISOString(),
    verifiedAt: new Date(Date.now() - 85200000).toISOString(),
  },
  {
    id: 'DEMO-INC-005',
    title: '[DEMO] Building Collapse – Under Construction',
    description: 'Partial collapse of an under-construction building. Workers trapped under debris. At least 5 workers unaccounted for. Dust cloud visible from distance.',
    category: 'building_collapse',
    severity: 'critical',
    status: 'reported',
    latitude: 13.0067,
    longitude: 80.2206,
    location: 'Tambaram, Chennai',
    affectedPeople: 12,
    reporterName: 'Senthil Kumar',
    reporterPhone: '+91 54321 09876',
    isDemo: true,
    aiAnalysis: {
      suggestedCategory: 'building_collapse',
      suggestedSeverity: 'critical',
      summary: 'Partial building collapse with workers trapped. USAR team and heavy rescue equipment needed urgently.',
      riskIndicators: ['Workers trapped', 'Structural collapse', 'Multiple missing persons', 'Secondary collapse risk'],
      recommendedActions: ['Dispatch USAR team', 'Request heavy machinery', 'Establish safety perimeter', 'Alert hospitals for mass casualties'],
      confidence: 0.93,
      method: 'rule_based',
      keywords: ['collapse', 'trapped', 'debris', 'workers'],
    },
    createdAt: new Date(Date.now() - 900000).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString(),
  },
];

// Enrich with Explainable Prioritization Engine calculations
export const DEMO_INCIDENTS: Incident[] = RAW_DEMO_INCIDENTS.map((inc) => {
  const prio = calculateIncidentPriority(inc);
  return {
    ...inc,
    priorityScore: prio.score,
    priorityTier: prio.tier,
    priorityReasons: prio.reasons,
    priorityFactors: prio.factors,
  };
});

export const DEMO_TEAMS: ResponseTeam[] = [
  {
    id: 'DEMO-TEAM-001',
    name: 'Fire & Rescue Unit Alpha',
    type: 'fire_rescue',
    status: 'busy',
    location: 'Central Fire Station, Egmore',
    latitude: 13.0878,
    longitude: 80.2785,
    currentAssignment: 'DEMO-INC-001',
    assignedIncidentId: 'DEMO-INC-001',
    members: 8,
    contact: '+91 44 2345 6789',
    totalDispatches: 42,
    avgResponseTime: 8.4,
    isDemo: true,
    operationalHistory: [
      {
        id: 'HIST-T1-1',
        incidentId: 'DEMO-INC-001',
        incidentTitle: 'Major Road Accident – NH-48 Junction',
        assignedAt: new Date(Date.now() - 2700000).toISOString(),
        status: 'active',
      },
      {
        id: 'HIST-T1-2',
        incidentId: 'DEMO-INC-PREV-1',
        incidentTitle: 'Electrical Transformer Fire – T Nagar',
        assignedAt: new Date(Date.now() - 172800000).toISOString(),
        resolvedAt: new Date(Date.now() - 169200000).toISOString(),
        durationMinutes: 60,
        status: 'completed',
      },
    ],
  },
  {
    id: 'DEMO-TEAM-002',
    name: 'Medical Response Team Beta',
    type: 'medical_team',
    status: 'available',
    location: 'Government General Hospital, Park Town',
    latitude: 13.0732,
    longitude: 80.2609,
    members: 5,
    contact: '+91 44 2534 2345',
    totalDispatches: 68,
    avgResponseTime: 6.2,
    isDemo: true,
    operationalHistory: [
      {
        id: 'HIST-T2-1',
        incidentId: 'DEMO-INC-004',
        incidentTitle: 'Cardiac Arrest – Marina Beach',
        assignedAt: new Date(Date.now() - 85800000).toISOString(),
        resolvedAt: new Date(Date.now() - 82800000).toISOString(),
        durationMinutes: 50,
        status: 'completed',
      },
    ],
  },
  {
    id: 'DEMO-TEAM-003',
    name: 'Ambulance Squad Delta (ALS)',
    type: 'ambulance',
    status: 'available',
    location: 'GEM Hospital, Kilpauk',
    latitude: 13.0631,
    longitude: 80.2411,
    members: 3,
    contact: '108',
    totalDispatches: 114,
    avgResponseTime: 5.8,
    isDemo: true,
    operationalHistory: [],
  },
  {
    id: 'DEMO-TEAM-004',
    name: 'NDRF Disaster Rescue Battalion',
    type: 'disaster_rescue',
    status: 'available',
    location: 'NDRF Regional HQ, Avadi',
    latitude: 13.1120,
    longitude: 80.1072,
    members: 16,
    contact: '+91 44 2630 8900',
    totalDispatches: 24,
    avgResponseTime: 12.1,
    isDemo: true,
    operationalHistory: [],
  },
  {
    id: 'DEMO-TEAM-005',
    name: 'Adyar Fire Unit Bravo',
    type: 'fire_rescue',
    status: 'offline',
    location: 'Adyar Fire Station, Adyar',
    latitude: 13.0067,
    longitude: 80.2574,
    members: 7,
    contact: '101',
    totalDispatches: 38,
    avgResponseTime: 9.0,
    isDemo: true,
    operationalHistory: [],
  },
  {
    id: 'DEMO-TEAM-006',
    name: 'Velachery Rapid Flood Rescue Unit',
    type: 'flood_squad',
    status: 'available',
    location: 'Velachery Emergency Outpost',
    latitude: 12.9815,
    longitude: 80.2180,
    members: 10,
    contact: '+91 44 2243 1100',
    totalDispatches: 19,
    avgResponseTime: 7.5,
    isDemo: true,
    operationalHistory: [],
  },
  {
    id: 'DEMO-TEAM-007',
    name: 'Highway Vehicular Trauma Squad',
    type: 'accident_squad',
    status: 'available',
    location: 'Maduravoyal Bypass Station',
    latitude: 13.0650,
    longitude: 80.1600,
    members: 6,
    contact: '+91 44 2478 9911',
    totalDispatches: 53,
    avgResponseTime: 7.1,
    isDemo: true,
    operationalHistory: [],
  },
  {
    id: 'DEMO-TEAM-008',
    name: 'Metropolitan Quick Response Team (QRT)',
    type: 'general_emergency',
    status: 'available',
    location: 'Chennai Central Police Commissionerate',
    latitude: 13.0780,
    longitude: 80.2600,
    members: 8,
    contact: '112',
    totalDispatches: 87,
    avgResponseTime: 6.5,
    isDemo: true,
    operationalHistory: [],
  },
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'DEMO-NOTIF-001',
    title: '🚨 Critical Priority Incident (Score: 92/100)',
    message: '[DEMO] NH-48 junction multi-vehicle collision flagged as CRITICAL code red by Prioritization Engine.',
    type: 'critical',
    read: false,
    incidentId: 'DEMO-INC-001',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'DEMO-NOTIF-002',
    title: '🔥 Structural Fire Alert (Score: 88/100)',
    message: '[DEMO] Anna Nagar 4th floor residential fire with 20 trapped civilians requires high-flow suppression.',
    type: 'critical',
    read: false,
    incidentId: 'DEMO-INC-002',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'DEMO-NOTIF-003',
    title: '✅ Mission Resolved & Squad Released',
    message: '[DEMO] Medical response at Marina Beach concluded. Medical Response Team Beta marked AVAILABLE.',
    type: 'success',
    read: true,
    incidentId: 'DEMO-INC-004',
    createdAt: new Date(Date.now() - 82800000).toISOString(),
  },
  {
    id: 'DEMO-NOTIF-004',
    title: '👥 Nearest Squad Dispatched via Haversine Engine',
    message: '[DEMO] Fire & Rescue Unit Alpha (2.8 km away) successfully dispatched to NH-48 accident.',
    type: 'info',
    read: true,
    incidentId: 'DEMO-INC-001',
    createdAt: new Date(Date.now() - 2700000).toISOString(),
  },
];

export const DEMO_HISTORY: IncidentHistory[] = [
  {
    id: 'DEMO-HIST-001',
    incidentId: 'DEMO-INC-001',
    action: 'Incident Created & Prioritized',
    details: 'Initial report submitted. Prioritization Engine scored 92/100 (Critical Tier).',
    performedBy: 'Arjun Kumar (Citizen)',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'DEMO-HIST-002',
    incidentId: 'DEMO-INC-001',
    action: 'AI Triage Completed',
    details: 'RESQ Intelligence classified as Road Accident with trapped occupant hazard.',
    performedBy: 'RESQ Intelligence',
    createdAt: new Date(Date.now() - 3550000).toISOString(),
  },
  {
    id: 'DEMO-HIST-003',
    incidentId: 'DEMO-INC-001',
    action: 'Incident Verified',
    details: 'Command Chief confirmed incident credentials.',
    performedBy: 'Command Chief (Admin)',
    createdAt: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: 'DEMO-HIST-004',
    incidentId: 'DEMO-INC-001',
    action: 'Squad Assigned (Haversine Recommendation)',
    details: 'Fire & Rescue Unit Alpha assigned as nearest compatible unit (2.8 km away).',
    performedBy: 'Dispatcher Center',
    createdAt: new Date(Date.now() - 2700000).toISOString(),
  },
  {
    id: 'DEMO-HIST-005',
    incidentId: 'DEMO-INC-001',
    action: 'Operational Status: In Progress',
    details: 'Response team on scene. Extrication tools engaged.',
    performedBy: 'First Responder Alpha',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

export function analyzeIncident(title: string, description: string): AIAnalysis {
  const text = `${title} ${description}`.toLowerCase();

  let suggestedCategory: AIAnalysis['suggestedCategory'] = 'other';
  if (/fire|flame|burn|smoke|blaze/.test(text)) suggestedCategory = 'fire';
  else if (/accident|collision|crash|vehicle|car|truck|bike|road/.test(text)) suggestedCategory = 'road_accident';
  else if (/medical|heart|cardiac|stroke|seizure|unconscious|cpr|hospital|injured|hurt|bleeding/.test(text)) suggestedCategory = 'medical';
  else if (/flood|water|submerge|inundat|drown|river|lake|rain|typhoon|cyclone/.test(text)) suggestedCategory = 'flood';
  else if (/collapse|building|structure|wall|roof|debris|trapped/.test(text)) suggestedCategory = 'building_collapse';

  let suggestedSeverity: AIAnalysis['suggestedSeverity'] = 'medium';
  const criticalKeywords = ['critical', 'trapped', 'unconscious', 'cardiac', 'collapse', 'mass casualty', 'multiple dead', 'explosion', 'major'];
  const highKeywords = ['injured', 'fire', 'flood', 'collision', 'ambulance', 'hospital', 'urgent', 'serious'];
  const lowKeywords = ['minor', 'small', 'contained', 'no injuries', 'property only'];

  if (criticalKeywords.some(k => text.includes(k))) suggestedSeverity = 'critical';
  else if (highKeywords.some(k => text.includes(k))) suggestedSeverity = 'high';
  else if (lowKeywords.some(k => text.includes(k))) suggestedSeverity = 'low';

  const allKeywords = ['fire', 'flood', 'accident', 'collapse', 'injured', 'trapped', 'medical', 'emergency', 'critical', 'vehicle', 'water', 'smoke', 'cardiac', 'CPR', 'debris'];
  const keywords = allKeywords.filter(k => text.includes(k.toLowerCase()));

  const riskIndicators: string[] = [];
  if (/trapped|stuck/.test(text)) riskIndicators.push('Person(s) potentially trapped');
  if (/multiple|several|many|crowd/.test(text)) riskIndicators.push('Multiple people affected');
  if (/child|children|elderly|old/.test(text)) riskIndicators.push('Vulnerable individuals involved');
  if (/fire|flame/.test(text)) riskIndicators.push('Active thermal/fire hazard');
  if (/flood|water/.test(text)) riskIndicators.push('Swift water/inundation hazard');
  if (/collapse|structural/.test(text)) riskIndicators.push('Secondary structural collapse hazard');
  if (riskIndicators.length === 0) riskIndicators.push('Standard initial hazard protocols apply');

  const actions: string[] = ['Immediate human dispatcher verification required', 'Query location-based response squad recommendation'];
  if (suggestedCategory === 'fire') actions.push('Dispatch fire suppression unit', 'Ambulance on standby', 'Evacuate perimeter');
  else if (suggestedCategory === 'road_accident') actions.push('Dispatch extrication squad and ambulance', 'Request traffic control corridor', 'Assess trauma needs');
  else if (suggestedCategory === 'medical') actions.push('Dispatch ALS ambulance', 'Alert nearest trauma reception', 'Dispatch paramedic unit');
  else if (suggestedCategory === 'flood') actions.push('Deploy inflatable boat rescue squad', 'Issue civil flood warning', 'Coordinate shelter logistics');
  else if (suggestedCategory === 'building_collapse') actions.push('Dispatch USAR rescue battalion', 'Request hydraulic heavy lifters', 'Safety perimeter 100m');

  const confidence = 0.75 + (keywords.length * 0.03) + (riskIndicators.length * 0.02);

  return {
    suggestedCategory,
    suggestedSeverity,
    summary: `${suggestedSeverity.toUpperCase()} ${suggestedCategory.replace('_', ' ')} incident detected. ${riskIndicators.length > 0 ? riskIndicators[0] + '.' : ''} Prioritization and dispatch recommended.`,
    riskIndicators,
    recommendedActions: actions.slice(0, 5),
    confidence: Math.min(confidence, 0.98),
    method: 'rule_based',
    keywords,
  };
}

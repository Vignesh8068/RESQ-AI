import { Incident, ResponseTeam, Notification, IncidentHistory, AIAnalysis } from '../types';

// ============================================================
// DEMO DATA – All demo records are clearly labelled
// ============================================================

export const DEMO_INCIDENTS: Incident[] = [
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
    responseStartedAt: new Date(Date.now() - 2700000).toISOString(),
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
    responseStartedAt: new Date(Date.now() - 85800000).toISOString(),
    resolvedAt: new Date(Date.now() - 82800000).toISOString(),
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

export const DEMO_TEAMS: ResponseTeam[] = [
  {
    id: 'DEMO-TEAM-001',
    name: 'Fire & Rescue Unit Alpha',
    type: 'fire_rescue',
    status: 'assigned',
    location: 'Central Fire Station, Chennai',
    latitude: 13.0878,
    longitude: 80.2785,
    currentAssignment: 'DEMO-INC-001',
    members: 8,
    contact: '+91 44 2345 6789',
    isDemo: true,
  },
  {
    id: 'DEMO-TEAM-002',
    name: 'Medical Response Team Beta',
    type: 'medical_team',
    status: 'available',
    location: 'Government General Hospital, Chennai',
    latitude: 13.0732,
    longitude: 80.2609,
    members: 5,
    contact: '+91 44 2534 2345',
    isDemo: true,
  },
  {
    id: 'DEMO-TEAM-003',
    name: 'Ambulance Squad Delta',
    type: 'ambulance',
    status: 'available',
    location: 'GEM Hospital, Chennai',
    latitude: 13.0631,
    longitude: 80.2411,
    members: 3,
    contact: '108',
    isDemo: true,
  },
  {
    id: 'DEMO-TEAM-004',
    name: 'NDRF Disaster Unit',
    type: 'disaster_rescue',
    status: 'available',
    location: 'NDRF Base, Avadi, Chennai',
    latitude: 13.1120,
    longitude: 80.1072,
    members: 15,
    contact: '+91 44 2630 8900',
    isDemo: true,
  },
  {
    id: 'DEMO-TEAM-005',
    name: 'Fire & Rescue Unit Bravo',
    type: 'fire_rescue',
    status: 'offline',
    location: 'Adyar Fire Station, Chennai',
    latitude: 13.0067,
    longitude: 80.2574,
    members: 7,
    contact: '101',
    isDemo: true,
  },
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'DEMO-NOTIF-001',
    title: '🚨 Critical Incident Reported',
    message: '[DEMO] Major road accident at NH-48 Junction with trapped victim. Immediate response required.',
    type: 'critical',
    read: false,
    incidentId: 'DEMO-INC-001',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'DEMO-NOTIF-002',
    title: '🔥 Fire Emergency – Anna Nagar',
    message: '[DEMO] Active building fire reported. 20 residents potentially affected.',
    type: 'critical',
    read: false,
    incidentId: 'DEMO-INC-002',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'DEMO-NOTIF-003',
    title: '✅ Incident Resolved',
    message: '[DEMO] Medical emergency at Marina Beach has been resolved successfully.',
    type: 'success',
    read: true,
    incidentId: 'DEMO-INC-004',
    createdAt: new Date(Date.now() - 82800000).toISOString(),
  },
  {
    id: 'DEMO-NOTIF-004',
    title: '👥 Team Assigned',
    message: '[DEMO] Fire & Rescue Unit Alpha assigned to NH-48 accident.',
    type: 'info',
    read: true,
    incidentId: 'DEMO-INC-001',
    createdAt: new Date(Date.now() - 3300000).toISOString(),
  },
];

export const DEMO_HISTORY: IncidentHistory[] = [
  {
    id: 'DEMO-HIST-001',
    incidentId: 'DEMO-INC-001',
    action: 'Incident Reported',
    details: 'Citizen report submitted via RESQ AI mobile',
    performedBy: 'Arjun Kumar (Citizen)',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'DEMO-HIST-002',
    incidentId: 'DEMO-INC-001',
    action: 'AI Analysis Complete',
    details: 'RESQ Intelligence classified as Critical Road Accident (94% confidence)',
    performedBy: 'RESQ Intelligence (AI)',
    createdAt: new Date(Date.now() - 3550000).toISOString(),
  },
  {
    id: 'DEMO-HIST-003',
    incidentId: 'DEMO-INC-001',
    action: 'Incident Verified',
    details: 'Field verification confirmed. Upgrading to critical priority.',
    performedBy: 'Admin (Demo Admin)',
    createdAt: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: 'DEMO-HIST-004',
    incidentId: 'DEMO-INC-001',
    action: 'Team Assigned',
    details: 'Fire & Rescue Unit Alpha dispatched to location',
    performedBy: 'Admin (Demo Admin)',
    createdAt: new Date(Date.now() - 2700000).toISOString(),
  },
  {
    id: 'DEMO-HIST-005',
    incidentId: 'DEMO-INC-001',
    action: 'Status: In Progress',
    details: 'Rescue team on-site. Extrication operation underway.',
    performedBy: 'Admin (Demo Admin)',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

// AI Analysis helper
export function analyzeIncident(title: string, description: string): AIAnalysis {
  const text = `${title} ${description}`.toLowerCase();

  // Category detection
  let suggestedCategory: AIAnalysis['suggestedCategory'] = 'other';
  if (/fire|flame|burn|smoke|blaze/.test(text)) suggestedCategory = 'fire';
  else if (/accident|collision|crash|vehicle|car|truck|bike|road/.test(text)) suggestedCategory = 'road_accident';
  else if (/medical|heart|cardiac|stroke|seizure|unconscious|cpr|hospital|injured|hurt|bleeding/.test(text)) suggestedCategory = 'medical';
  else if (/flood|water|submerge|inundat|drown|river|lake|rain|typhoon|cyclone/.test(text)) suggestedCategory = 'flood';
  else if (/collapse|building|structure|wall|roof|debris|trapped/.test(text)) suggestedCategory = 'building_collapse';

  // Severity detection
  let suggestedSeverity: AIAnalysis['suggestedSeverity'] = 'medium';
  const criticalKeywords = ['critical', 'trapped', 'unconscious', 'cardiac', 'collapse', 'mass casualty', 'multiple dead', 'explosion', 'major'];
  const highKeywords = ['injured', 'injured', 'fire', 'flood', 'collision', 'ambulance', 'hospital', 'urgent', 'serious'];
  const lowKeywords = ['minor', 'small', 'contained', 'no injuries', 'property only'];

  if (criticalKeywords.some(k => text.includes(k))) suggestedSeverity = 'critical';
  else if (highKeywords.some(k => text.includes(k))) suggestedSeverity = 'high';
  else if (lowKeywords.some(k => text.includes(k))) suggestedSeverity = 'low';

  // Extract keywords
  const allKeywords = ['fire', 'flood', 'accident', 'collapse', 'injured', 'trapped', 'medical', 'emergency', 'critical', 'vehicle', 'water', 'smoke', 'cardiac', 'CPR', 'debris'];
  const keywords = allKeywords.filter(k => text.includes(k.toLowerCase()));

  // Risk indicators
  const riskIndicators: string[] = [];
  if (/trapped|stuck/.test(text)) riskIndicators.push('Person(s) potentially trapped');
  if (/multiple|several|many|crowd/.test(text)) riskIndicators.push('Multiple people affected');
  if (/child|children|elderly|old/.test(text)) riskIndicators.push('Vulnerable individuals involved');
  if (/fire|flame/.test(text)) riskIndicators.push('Active fire hazard');
  if (/flood|water/.test(text)) riskIndicators.push('Flooding/water hazard');
  if (/collapse|structural/.test(text)) riskIndicators.push('Structural collapse risk');
  if (/gas|chemical|toxic|leak/.test(text)) riskIndicators.push('Hazardous materials possible');
  if (riskIndicators.length === 0) riskIndicators.push('Standard emergency protocol applies');

  // Recommended actions
  const actions: string[] = ['Immediate human verification required', 'Review available response resources'];
  if (suggestedCategory === 'fire') actions.push('Dispatch fire brigade', 'Ambulance standby', 'Evacuate vicinity');
  else if (suggestedCategory === 'road_accident') actions.push('Send ambulance and fire rescue', 'Traffic control required', 'Assess extrication needs');
  else if (suggestedCategory === 'medical') actions.push('Dispatch ALS ambulance', 'Alert nearest hospital', 'Send paramedic unit');
  else if (suggestedCategory === 'flood') actions.push('Deploy boat rescue teams', 'Issue flood advisory', 'Set up relief camp');
  else if (suggestedCategory === 'building_collapse') actions.push('Dispatch USAR team', 'Request heavy rescue equipment', 'Establish safety perimeter');
  if (suggestedSeverity === 'critical') actions.unshift('PRIORITY: Immediate dispatch required');

  const confidence = 0.72 + (keywords.length * 0.03) + (riskIndicators.length * 0.02);

  return {
    suggestedCategory,
    suggestedSeverity,
    summary: `${suggestedSeverity.toUpperCase()} ${suggestedCategory.replace('_', ' ')} incident detected. ${riskIndicators.length > 0 ? riskIndicators[0] + '.' : ''} Immediate coordination recommended.`,
    riskIndicators,
    recommendedActions: actions.slice(0, 5),
    confidence: Math.min(confidence, 0.98),
    method: 'rule_based',
    keywords,
  };
}

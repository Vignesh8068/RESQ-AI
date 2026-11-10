// Core application types for RESQ AI – Round 2

export type UserRole = 'citizen' | 'admin';

export type IncidentStatus = 'reported' | 'assigned' | 'in_progress' | 'resolved' | 'pending' | 'verified';

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';

export type EmergencyCategory =
  | 'fire'
  | 'road_accident'
  | 'medical'
  | 'flood'
  | 'building_collapse'
  | 'rescue'
  | 'general'
  | 'other';

export type ResourceType =
  | 'fire_rescue'
  | 'medical_team'
  | 'ambulance'
  | 'disaster_rescue'
  | 'flood_squad'
  | 'accident_squad'
  | 'general_emergency';

export type ResourceStatus = 'available' | 'busy' | 'offline' | 'assigned';

export type PriorityTier = 'critical' | 'high' | 'medium' | 'low';

export interface PriorityFactor {
  name: string;
  score: number;
  maxScore: number;
  description: string;
}

export interface PriorityScoreResult {
  score: number; // 0 to 100
  tier: PriorityTier;
  factors: PriorityFactor[];
  reasons: string[];
  urgencyBadge: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: EmergencyCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
  location: string;
  affectedPeople: number;
  reporterName: string;
  reporterPhone: string;
  reporterEmail?: string;
  reporterId?: string;
  imageUrl?: string;
  aiAnalysis?: AIAnalysis;
  assignedTeamId?: string;
  assignedTeamName?: string;
  assignedAt?: string;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  responseStartedAt?: string;
  resolvedAt?: string;
  isDemo?: boolean;

  // Round 2 Intelligent Prioritization fields
  priorityScore?: number; // 0-100
  priorityTier?: PriorityTier;
  priorityReasons?: string[];
  priorityFactors?: PriorityFactor[];
}

export interface AIAnalysis {
  suggestedCategory: EmergencyCategory;
  suggestedSeverity: IncidentSeverity;
  summary: string;
  riskIndicators: string[];
  recommendedActions: string[];
  confidence: number;
  method: 'gemini' | 'rule_based';
  keywords: string[];
}

export interface TeamHistoryRecord {
  id: string;
  incidentId: string;
  incidentTitle: string;
  assignedAt: string;
  resolvedAt?: string;
  durationMinutes?: number;
  status: 'completed' | 'active';
}

export interface ResponseTeam {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  location: string;
  latitude: number;
  longitude: number;
  currentAssignment?: string;
  assignedIncidentId?: string;
  members: number;
  contact: string;
  isDemo?: boolean;

  // Round 2 Performance & Tracking fields
  totalDispatches?: number;
  avgResponseTime?: number; // in minutes
  operationalHistory?: TeamHistoryRecord[];
}

export interface TeamRecommendation {
  team: ResponseTeam;
  distanceKm: number; // Haversine formula calculation
  isCompatible: boolean;
  compatibilityReason: string;
  rank: number;
  isRecommended: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  read: boolean;
  incidentId?: string;
  createdAt: string;
}

export interface IncidentHistory {
  id: string;
  incidentId: string;
  action: string;
  details: string;
  performedBy: string;
  createdAt: string;
}

export interface DashboardStats {
  total: number;
  critical: number;
  high: number;
  pending: number;
  inProgress: number;
  resolved: number;
  livesImpacted: number;
  avgResponseTimeMinutes: number | null;
  avgResolutionTimeMinutes: number | null;
  availableTeams: number;
  busyTeams: number;
  teamUtilizationRate: number; // percentage
  aiAccuracy: string;
  isDemoData: boolean;
  isLoading: boolean;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface Language {
  code: 'en' | 'ta';
  label: string;
  nativeLabel: string;
}

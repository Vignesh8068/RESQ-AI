// Core application types for RESQ AI

export type UserRole = 'citizen' | 'admin';

export type IncidentStatus = 'reported' | 'pending' | 'verified' | 'in_progress' | 'resolved';

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';

export type EmergencyCategory =
  | 'fire'
  | 'road_accident'
  | 'medical'
  | 'flood'
  | 'building_collapse'
  | 'other';

export type ResourceType = 'ambulance' | 'fire_rescue' | 'medical_team' | 'disaster_rescue';

export type ResourceStatus = 'available' | 'assigned' | 'offline';

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
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  responseStartedAt?: string;
  resolvedAt?: string;
  isDemo?: boolean;
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

export interface ResponseTeam {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  location: string;
  latitude: number;
  longitude: number;
  currentAssignment?: string;
  members: number;
  contact: string;
  isDemo?: boolean;
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

import { EmergencyCategory, IncidentSeverity, IncidentStatus, ResourceType } from '../types';

export const CATEGORY_LABELS: Record<EmergencyCategory, string> = {
  fire: 'Fire Emergency',
  road_accident: 'Road Accident',
  medical: 'Medical Emergency',
  flood: 'Flood',
  building_collapse: 'Building Collapse',
  other: 'Other Emergency',
};

export const CATEGORY_COLORS: Record<EmergencyCategory, string> = {
  fire: '#FF4057',
  road_accident: '#FF9F43',
  medical: '#35D9FF',
  flood: '#4A90D9',
  building_collapse: '#8B5CF6',
  other: '#6B7280',
};

export const CATEGORY_ICONS: Record<EmergencyCategory, string> = {
  fire: '🔥',
  road_accident: '🚗',
  medical: '🏥',
  flood: '🌊',
  building_collapse: '🏚️',
  other: '⚠️',
};

export const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  critical: '#FF4057',
  high: '#FF9F43',
  medium: '#FFD93D',
  low: '#20C997',
};

export const SEVERITY_BG: Record<IncidentSeverity, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/40',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  low: 'bg-green-500/20 text-green-400 border-green-500/40',
};

export const STATUS_COLORS: Record<IncidentStatus, string> = {
  reported: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  verified: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  in_progress: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  resolved: 'bg-green-500/20 text-green-400 border-green-500/40',
};

export const STATUS_LABELS: Record<IncidentStatus, string> = {
  reported: 'Reported',
  pending: 'Pending',
  verified: 'Verified',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

export const RESOURCE_LABELS: Record<ResourceType, string> = {
  ambulance: 'Ambulance',
  fire_rescue: 'Fire & Rescue',
  medical_team: 'Medical Team',
  disaster_rescue: 'Disaster Rescue',
};

export const RESOURCE_ICONS: Record<ResourceType, string> = {
  ambulance: '🚑',
  fire_rescue: '🚒',
  medical_team: '⚕️',
  disaster_rescue: '🚁',
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function generateId(prefix = 'INC'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
}

export const TRANSLATIONS: Record<'en' | 'ta', Record<string, string>> = {
  en: {
    reportEmergency: 'Report Emergency',
    emergency: 'Emergency',
    dashboard: 'Dashboard',
    incidents: 'Incidents',
    map: 'Live Map',
    resources: 'Resources',
    analytics: 'Analytics',
    notifications: 'Notifications',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    submit: 'Submit Report',
    cancel: 'Cancel',
    close: 'Close',
    verify: 'Verify',
    resolve: 'Resolve',
    assign: 'Assign Team',
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    title: 'Incident Title',
    description: 'Description',
    location: 'Location',
    severity: 'Severity',
    category: 'Category',
    affected: 'Affected People',
    contact: 'Contact',
    yourName: 'Your Name',
    yourPhone: 'Phone Number',
    getLocation: 'Get My Location',
    sosAlert: 'SOS ALERT',
  },
  ta: {
    reportEmergency: 'அவசரநிலை புகாரளி',
    emergency: 'அவசரநிலை',
    dashboard: 'கட்டுப்பாட்டு பலகை',
    incidents: 'சம்பவங்கள்',
    map: 'நேரடி வரைபடம்',
    resources: 'வளங்கள்',
    analytics: 'பகுப்பாய்வு',
    notifications: 'அறிவிப்புகள்',
    settings: 'அமைப்புகள்',
    logout: 'வெளியேறு',
    login: 'உள்நுழை',
    register: 'பதிவு செய்',
    submit: 'புகார் சமர்பி',
    cancel: 'ரத்து செய்',
    close: 'மூடு',
    verify: 'சரிபார்',
    resolve: 'தீர்க்கவும்',
    assign: 'குழு நியமி',
    critical: 'மிகவும் தீவிரம்',
    high: 'அதிகம்',
    medium: 'நடுத்தரம்',
    low: 'குறைவு',
    title: 'சம்பவ தலைப்பு',
    description: 'விளக்கம்',
    location: 'இடம்',
    severity: 'தீவிரம்',
    category: 'வகை',
    affected: 'பாதிக்கப்பட்டோர்',
    contact: 'தொடர்பு',
    yourName: 'உங்கள் பெயர்',
    yourPhone: 'தொலைபேசி எண்',
    getLocation: 'என் இடத்தை பெறு',
    sosAlert: 'SOS எச்சரிக்கை',
  },
};

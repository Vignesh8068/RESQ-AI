import React, { createContext, useContext, useReducer, useEffect, useMemo, ReactNode } from 'react';
import {
  User, Incident, ResponseTeam, Notification, IncidentHistory, DashboardStats,
  TeamHistoryRecord
} from '../types';
import { DEMO_INCIDENTS, DEMO_TEAMS, DEMO_NOTIFICATIONS, DEMO_HISTORY } from '../lib/demoData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { calculateIncidentPriority } from '../services/prioritizationEngine';

// ============================================================
// App State – Round 2 Mission Command Architecture
// ============================================================

interface AppState {
  user: User | null;
  incidents: Incident[];
  teams: ResponseTeam[];
  notifications: Notification[];
  history: IncidentHistory[];
  isLoading: boolean;
  isDemoMode: boolean;
  language: 'en' | 'ta';
  theme: 'dark' | 'light';
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_INCIDENTS'; payload: Incident[] }
  | { type: 'ADD_INCIDENT'; payload: Incident }
  | { type: 'UPDATE_INCIDENT'; payload: Incident }
  | { type: 'DELETE_INCIDENT'; payload: string }
  | { type: 'SET_TEAMS'; payload: ResponseTeam[] }
  | { type: 'ADD_TEAM'; payload: ResponseTeam }
  | { type: 'UPDATE_TEAM'; payload: ResponseTeam }
  | { type: 'DELETE_TEAM'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'ADD_HISTORY'; payload: IncidentHistory }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LANGUAGE'; payload: 'en' | 'ta' }
  | { type: 'SET_THEME'; payload: 'dark' | 'light' }
  | { type: 'RESET_DEMO_DATA' }
  | { type: 'RESTORE_DATA'; payload: { incidents?: Incident[]; teams?: ResponseTeam[]; history?: IncidentHistory[] } }
  | { type: 'LOGOUT' };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_INCIDENTS':
      return { ...state, incidents: action.payload };
    case 'ADD_INCIDENT':
      return { ...state, incidents: [action.payload, ...state.incidents] };
    case 'UPDATE_INCIDENT':
      return {
        ...state,
        incidents: state.incidents.map((i) => (i.id === action.payload.id ? action.payload : i)),
      };
    case 'DELETE_INCIDENT':
      return { ...state, incidents: state.incidents.filter((i) => i.id !== action.payload) };
    case 'SET_TEAMS':
      return { ...state, teams: action.payload };
    case 'ADD_TEAM':
      return { ...state, teams: [action.payload, ...state.teams] };
    case 'UPDATE_TEAM':
      return {
        ...state,
        teams: state.teams.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
    case 'DELETE_TEAM':
      return { ...state, teams: state.teams.filter((t) => t.id !== action.payload) };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    case 'ADD_HISTORY':
      return { ...state, history: [action.payload, ...state.history] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'RESET_DEMO_DATA':
      localStorage.removeItem('resqai_incidents');
      localStorage.removeItem('resqai_teams');
      return {
        ...state,
        incidents: DEMO_INCIDENTS,
        teams: DEMO_TEAMS,
        notifications: DEMO_NOTIFICATIONS,
        history: DEMO_HISTORY,
      };
    case 'RESTORE_DATA':
      return {
        ...state,
        incidents: action.payload.incidents || state.incidents,
        teams: action.payload.teams || state.teams,
        history: action.payload.history || state.history,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
      };
    default:
      return state;
  }
}

const initialState: AppState = {
  user: null,
  incidents: DEMO_INCIDENTS,
  teams: DEMO_TEAMS,
  notifications: DEMO_NOTIFICATIONS,
  history: DEMO_HISTORY,
  isLoading: false,
  isDemoMode: !isSupabaseConfigured,
  language: 'en',
  theme: 'dark',
};

// ============================================================
// Context Interface
// ============================================================

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  stats: DashboardStats;
  unreadCount: number;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  addIncident: (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Incident>;
  updateIncidentStatus: (id: string, status: Incident['status'], adminName?: string) => void;
  assignTeam: (incidentId: string, teamId: string, adminName?: string) => void;
  addTeam: (team: Omit<ResponseTeam, 'id'>) => Promise<ResponseTeam>;
  updateTeam: (team: ResponseTeam) => void;
  deleteTeam: (teamId: string) => void;
  resetToDemoData: () => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonString: string) => boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

const DEMO_USERS: User[] = [
  { id: 'demo-admin-001', email: 'admin@resqai.demo', name: 'Command Chief (Admin)', role: 'admin', createdAt: new Date().toISOString() },
  { id: 'demo-citizen-001', email: 'citizen@resqai.demo', name: 'Demo Citizen', phone: '+91 99999 00000', role: 'citizen', createdAt: new Date().toISOString() },
];

// ============================================================
// App Provider
// ============================================================

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persistent records from LocalStorage or Supabase
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Local demo mode with LocalStorage persistence
      const savedInc = localStorage.getItem('resqai_incidents');
      if (savedInc) {
        try {
          const parsed = JSON.parse(savedInc) as Incident[];
          const userSubmitted = parsed.filter((i) => !i.isDemo);
          dispatch({ type: 'SET_INCIDENTS', payload: [...userSubmitted, ...DEMO_INCIDENTS] });
        } catch {}
      }

      const savedTeams = localStorage.getItem('resqai_teams');
      if (savedTeams) {
        try {
          const parsedTeams = JSON.parse(savedTeams) as ResponseTeam[];
          dispatch({ type: 'SET_TEAMS', payload: parsedTeams });
        } catch {}
      }
      return;
    }

    // Live Supabase integration
    let isMounted = true;
    const fetchSupabaseIncidents = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { data, error } = await supabase
          .from('incidents')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error && isMounted) {
          const mapped: Incident[] = data.map((row: any) => {
            const raw = {
              id: row.id,
              title: row.title,
              description: row.description,
              category: row.category,
              severity: row.severity,
              status: row.status,
              latitude: Number(row.latitude) || 0,
              longitude: Number(row.longitude) || 0,
              location: row.location || 'Unknown Location',
              affectedPeople: Number(row.affected_people) || 1,
              reporterName: row.reporter_name || 'Anonymous',
              reporterPhone: row.reporter_phone || '',
              reporterId: row.reporter_id,
              createdAt: row.created_at || new Date().toISOString(),
              updatedAt: row.updated_at || new Date().toISOString(),
              verifiedAt: row.verified_at,
              responseStartedAt: row.response_started_at,
              resolvedAt: row.resolved_at,
              isDemo: false,
            };
            const prio = calculateIncidentPriority(raw);
            return {
              ...raw,
              priorityScore: prio.score,
              priorityTier: prio.tier,
              priorityReasons: prio.reasons,
              priorityFactors: prio.factors,
            };
          });
          dispatch({ type: 'SET_INCIDENTS', payload: mapped });
        }
      } catch (err) {
        console.warn('Could not query Supabase incidents, falling back to local records:', err);
      } finally {
        if (isMounted) dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchSupabaseIncidents();

    const channel = supabase
      .channel('public:incidents_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => {
        fetchSupabaseIncidents();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Sync to LocalStorage for local demo mode
  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('resqai_incidents', JSON.stringify(state.incidents));
      localStorage.setItem('resqai_teams', JSON.stringify(state.teams));
    }
  }, [state.incidents, state.teams]);

  // Apply dark/light theme
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // ============================================================
  // Dynamic Real-Time Statistics Calculation Engine
  // ============================================================
  const stats: DashboardStats = useMemo(() => {
    const total = state.incidents.length;
    const critical = state.incidents.filter((i) => i.severity === 'critical' || (i.priorityScore && i.priorityScore >= 80)).length;
    const high = state.incidents.filter((i) => i.severity === 'high' || (i.priorityScore && i.priorityScore >= 60 && i.priorityScore < 80)).length;
    const pending = state.incidents.filter((i) => i.status === 'pending' || i.status === 'reported').length;
    const inProgress = state.incidents.filter((i) => i.status === 'in_progress' || i.status === 'assigned').length;
    const resolved = state.incidents.filter((i) => i.status === 'resolved').length;

    // Deduplicated count of affected people
    const seenIncidentIds = new Set<string>();
    let livesImpacted = 0;
    for (const inc of state.incidents) {
      if (!seenIncidentIds.has(inc.id)) {
        seenIncidentIds.add(inc.id);
        livesImpacted += Number(inc.affectedPeople) || 0;
      }
    }

    // Average Response Time (minutes from reported to responseStartedAt)
    const responseTimesMinutes = state.incidents
      .filter((i) => i.createdAt && i.responseStartedAt)
      .map((i) => {
        const reportedAt = new Date(i.createdAt).getTime();
        const responseAt = new Date(i.responseStartedAt!).getTime();
        const diffMinutes = (responseAt - reportedAt) / (1000 * 60);
        return diffMinutes >= 0 && !isNaN(diffMinutes) ? diffMinutes : null;
      })
      .filter((v): v is number => v !== null);

    const avgResponseTimeMinutes =
      responseTimesMinutes.length > 0
        ? Math.round((responseTimesMinutes.reduce((sum, curr) => sum + curr, 0) / responseTimesMinutes.length) * 10) / 10
        : null;

    // Average Resolution Time (minutes from reported to resolvedAt)
    const resolutionTimesMinutes = state.incidents
      .filter((i) => i.status === 'resolved' && i.createdAt && i.resolvedAt)
      .map((i) => {
        const reportedAt = new Date(i.createdAt).getTime();
        const resolvedAt = new Date(i.resolvedAt!).getTime();
        const diffMinutes = (resolvedAt - reportedAt) / (1000 * 60);
        return diffMinutes >= 0 && !isNaN(diffMinutes) ? diffMinutes : null;
      })
      .filter((v): v is number => v !== null);

    const avgResolutionTimeMinutes =
      resolutionTimesMinutes.length > 0
        ? Math.round((resolutionTimesMinutes.reduce((sum, curr) => sum + curr, 0) / resolutionTimesMinutes.length) * 10) / 10
        : null;

    // Team Availability & Utilization
    const availableTeams = state.teams.filter((t) => t.status === 'available').length;
    const busyTeams = state.teams.filter((t) => t.status === 'busy' || t.status === 'assigned').length;
    const activeTeamsTotal = availableTeams + busyTeams;
    const teamUtilizationRate =
      activeTeamsTotal > 0 ? Math.round((busyTeams / activeTeamsTotal) * 100) : 0;

    const isDemoData = !isSupabaseConfigured || state.incidents.some((i) => i.isDemo);

    return {
      total,
      critical,
      high,
      pending,
      inProgress,
      resolved,
      livesImpacted,
      avgResponseTimeMinutes,
      avgResolutionTimeMinutes,
      availableTeams,
      busyTeams,
      teamUtilizationRate,
      aiAccuracy: 'Not Yet Evaluated',
      isDemoData,
      isLoading: state.isLoading,
    };
  }, [state.incidents, state.teams, state.isLoading]);

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  // ============================================================
  // Authentication Workflows
  // ============================================================
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await new Promise((r) => setTimeout(r, 500));

    const demoCredentials: Record<string, string> = {
      'admin@resqai.demo': 'admin123',
      'citizen@resqai.demo': 'citizen123',
    };

    const demoUser = DEMO_USERS.find((u) => u.email === email);
    if (demoUser && demoCredentials[email] === password) {
      dispatch({ type: 'SET_USER', payload: demoUser });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    }

    dispatch({ type: 'SET_LOADING', payload: false });
    return { success: false, error: 'Invalid credentials. Select a quick demo profile below.' };
  };

  const register = async (name: string, email: string, _password: string, phone: string): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await new Promise((r) => setTimeout(r, 600));

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      phone,
      role: 'citizen',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'SET_USER', payload: newUser });
    dispatch({ type: 'SET_LOADING', payload: false });
    return { success: true };
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // ============================================================
  // Incident Lifecycle & Prioritization Management
  // ============================================================
  const addIncident = async (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<Incident> => {
    const prio = calculateIncidentPriority(incident);

    const newIncident: Incident = {
      ...incident,
      id: `INC-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priorityScore: prio.score,
      priorityTier: prio.tier,
      priorityReasons: prio.reasons,
      priorityFactors: prio.factors,
    };
    dispatch({ type: 'ADD_INCIDENT', payload: newIncident });

    if (isSupabaseConfigured) {
      try {
        await supabase.from('incidents').insert({
          title: newIncident.title,
          description: newIncident.description,
          category: newIncident.category,
          severity: newIncident.severity,
          status: newIncident.status,
          latitude: newIncident.latitude,
          longitude: newIncident.longitude,
          location: newIncident.location,
          affected_people: newIncident.affectedPeople,
          reporter_name: newIncident.reporterName,
          reporter_phone: newIncident.reporterPhone,
          reporter_id: newIncident.reporterId,
          created_at: newIncident.createdAt,
        });
      } catch (err) {
        console.warn('Supabase insert fallback:', err);
      }
    }

    // Add alert notification
    const notif: Notification = {
      id: `NOTIF-${Date.now()}`,
      title: `🚨 ${prio.tier.toUpperCase()} Priority Incident (Score: ${prio.score})`,
      message: `${newIncident.title} reported at ${newIncident.location}. ${prio.urgencyBadge}`,
      type: prio.tier === 'critical' ? 'critical' : prio.tier === 'high' ? 'warning' : 'info',
      read: false,
      incidentId: newIncident.id,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

    // Record audit history
    const hist: IncidentHistory = {
      id: `HIST-${Date.now()}`,
      incidentId: newIncident.id,
      action: 'Incident Created & Prioritized',
      details: `Report filed. Evaluated score: ${prio.score}/100 (${prio.tier.toUpperCase()}).`,
      performedBy: state.user?.name ?? 'Reporter',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_HISTORY', payload: hist });

    return newIncident;
  };

  const updateIncidentStatus = (id: string, status: Incident['status'], adminName = 'Command Center') => {
    const incident = state.incidents.find((i) => i.id === id);
    if (!incident) return;

    const responseStartedAt =
      (status === 'in_progress' || status === 'assigned') && !incident.responseStartedAt
        ? new Date().toISOString()
        : incident.responseStartedAt;

    const resolvedAt = status === 'resolved' ? new Date().toISOString() : incident.resolvedAt;

    // Recalculate priority based on new status
    const prio = calculateIncidentPriority({ ...incident, status, responseStartedAt });

    const updated: Incident = {
      ...incident,
      status,
      updatedAt: new Date().toISOString(),
      responseStartedAt,
      resolvedAt,
      priorityScore: prio.score,
      priorityTier: prio.tier,
      priorityReasons: prio.reasons,
      priorityFactors: prio.factors,
      ...(status === 'verified' && { verifiedAt: incident.verifiedAt || new Date().toISOString() }),
    };

    dispatch({ type: 'UPDATE_INCIDENT', payload: updated });

    // ROUND 2 MANDATORY: Automatically free up the assigned squad when incident is resolved!
    if (status === 'resolved' && incident.assignedTeamId) {
      const assignedTeam = state.teams.find((t) => t.id === incident.assignedTeamId);
      if (assignedTeam) {
        const completedRecord: TeamHistoryRecord = {
          id: `THIST-${Date.now()}`,
          incidentId: incident.id,
          incidentTitle: incident.title,
          assignedAt: incident.assignedAt || incident.createdAt,
          resolvedAt: new Date().toISOString(),
          durationMinutes: Math.round(
            (Date.now() - new Date(incident.assignedAt || incident.createdAt).getTime()) / (1000 * 60)
          ),
          status: 'completed',
        };

        const updatedHistory = assignedTeam.operationalHistory
          ? [completedRecord, ...assignedTeam.operationalHistory.filter((h) => h.incidentId !== incident.id)]
          : [completedRecord];

        const updatedTeam: ResponseTeam = {
          ...assignedTeam,
          status: 'available',
          currentAssignment: undefined,
          assignedIncidentId: undefined,
          totalDispatches: (assignedTeam.totalDispatches || 0) + 1,
          operationalHistory: updatedHistory,
        };

        dispatch({ type: 'UPDATE_TEAM', payload: updatedTeam });
      }
    }

    if (isSupabaseConfigured) {
      supabase
        .from('incidents')
        .update({
          status,
          response_started_at: responseStartedAt,
          resolved_at: resolvedAt,
          updated_at: new Date().toISOString(),
          ...(status === 'verified' && { verified_at: updated.verifiedAt }),
        })
        .eq('id', id)
        .catch(() => {});
    }

    // Audit log
    const hist: IncidentHistory = {
      id: `HIST-${Date.now()}`,
      incidentId: id,
      action: `Status: ${status.replace('_', ' ').toUpperCase()}`,
      details: `Incident transitioned to ${status.toUpperCase()} by ${adminName}.`,
      performedBy: adminName,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_HISTORY', payload: hist });

    if (status === 'resolved') {
      const notif: Notification = {
        id: `NOTIF-${Date.now()}`,
        title: '✅ Mission Resolved & Cleared',
        message: `${incident.title} successfully resolved. Assigned squad released to AVAILABLE.`,
        type: 'success',
        read: false,
        incidentId: id,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: notif });
    }
  };

  // ============================================================
  // Intelligent Location-Based Team Assignment Workflow
  // ============================================================
  const assignTeam = (incidentId: string, teamId: string, adminName = 'Dispatcher') => {
    const incident = state.incidents.find((i) => i.id === incidentId);
    const team = state.teams.find((t) => t.id === teamId);
    if (!incident || !team) return;

    const nowIso = new Date().toISOString();
    const responseStartedAt = incident.responseStartedAt || nowIso;

    // Update Incident
    const updatedIncident: Incident = {
      ...incident,
      assignedTeamId: teamId,
      assignedTeamName: team.name,
      assignedAt: nowIso,
      status: 'assigned',
      responseStartedAt,
      updatedAt: nowIso,
    };
    const prio = calculateIncidentPriority(updatedIncident);
    updatedIncident.priorityScore = prio.score;
    updatedIncident.priorityTier = prio.tier;

    dispatch({ type: 'UPDATE_INCIDENT', payload: updatedIncident });

    // Update Team: marked as BUSY, track incident ID, add to operational history
    const activeHistoryRecord: TeamHistoryRecord = {
      id: `THIST-${Date.now()}`,
      incidentId,
      incidentTitle: incident.title,
      assignedAt: nowIso,
      status: 'active',
    };

    const updatedTeam: ResponseTeam = {
      ...team,
      status: 'busy',
      currentAssignment: incident.title,
      assignedIncidentId: incidentId,
      operationalHistory: [activeHistoryRecord, ...(team.operationalHistory || [])],
    };
    dispatch({ type: 'UPDATE_TEAM', payload: updatedTeam });

    if (isSupabaseConfigured) {
      supabase
        .from('incidents')
        .update({
          status: 'assigned',
          response_started_at: responseStartedAt,
          updated_at: nowIso,
        })
        .eq('id', incidentId)
        .catch(() => {});
    }

    // Audit Record
    const hist: IncidentHistory = {
      id: `HIST-${Date.now()}`,
      incidentId,
      action: 'Squad Dispatched',
      details: `${team.name} dispatched to incident scene by ${adminName}.`,
      performedBy: adminName,
      createdAt: nowIso,
    };
    dispatch({ type: 'ADD_HISTORY', payload: hist });

    // Notification
    const notif: Notification = {
      id: `NOTIF-${Date.now()}`,
      title: '🚒 Response Squad Dispatched',
      message: `${team.name} deployed to: ${incident.title}`,
      type: 'info',
      read: false,
      incidentId,
      createdAt: nowIso,
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });
  };

  // ============================================================
  // Response Team CRUD Management
  // ============================================================
  const addTeam = async (teamData: Omit<ResponseTeam, 'id'>): Promise<ResponseTeam> => {
    const newTeam: ResponseTeam = {
      ...teamData,
      id: `TEAM-${Date.now()}`,
      totalDispatches: 0,
      avgResponseTime: 7.0,
      operationalHistory: [],
    };
    dispatch({ type: 'ADD_TEAM', payload: newTeam });
    return newTeam;
  };

  const updateTeam = (team: ResponseTeam) => {
    dispatch({ type: 'UPDATE_TEAM', payload: team });
  };

  const deleteTeam = (teamId: string) => {
    dispatch({ type: 'DELETE_TEAM', payload: teamId });
  };

  // ============================================================
  // Data Management: Backup & Restore
  // ============================================================
  const resetToDemoData = () => {
    dispatch({ type: 'RESET_DEMO_DATA' });
  };

  const exportBackupJSON = () => {
    const backupData = {
      version: 'RESQ_AI_ROUND2_V1',
      exportedAt: new Date().toISOString(),
      incidents: state.incidents,
      teams: state.teams,
      history: state.history,
    };
    const jsonBlob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(jsonBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RESQ_AI_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBackupJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data && Array.isArray(data.incidents) && Array.isArray(data.teams)) {
        dispatch({
          type: 'RESTORE_DATA',
          payload: {
            incidents: data.incidents,
            teams: data.teams,
            history: data.history || [],
          },
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        stats,
        unreadCount,
        login,
        register,
        logout,
        addIncident,
        updateIncidentStatus,
        assignTeam,
        addTeam,
        updateTeam,
        deleteTeam,
        resetToDemoData,
        exportBackupJSON,
        importBackupJSON,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

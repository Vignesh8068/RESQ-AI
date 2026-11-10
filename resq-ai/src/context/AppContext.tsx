import React, { createContext, useContext, useReducer, useEffect, useMemo, ReactNode } from 'react';
import { User, Incident, ResponseTeam, Notification, IncidentHistory, DashboardStats } from '../types';
import { DEMO_INCIDENTS, DEMO_TEAMS, DEMO_NOTIFICATIONS, DEMO_HISTORY } from '../lib/demoData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ============================================================
// App State
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
  | { type: 'UPDATE_TEAM'; payload: ResponseTeam }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'ADD_HISTORY'; payload: IncidentHistory }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LANGUAGE'; payload: 'en' | 'ta' }
  | { type: 'SET_THEME'; payload: 'dark' | 'light' }
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
        incidents: state.incidents.map(i => i.id === action.payload.id ? action.payload : i),
      };
    case 'DELETE_INCIDENT':
      return { ...state, incidents: state.incidents.filter(i => i.id !== action.payload) };
    case 'SET_TEAMS':
      return { ...state, teams: action.payload };
    case 'UPDATE_TEAM':
      return {
        ...state,
        teams: state.teams.map(t => t.id === action.payload.id ? action.payload : t),
      };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
      };
    case 'ADD_HISTORY':
      return { ...state, history: [action.payload, ...state.history] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        incidents: DEMO_INCIDENTS,
        teams: DEMO_TEAMS,
        notifications: DEMO_NOTIFICATIONS,
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
// Context
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
  assignTeam: (incidentId: string, teamId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// Demo users
const DEMO_USERS: User[] = [
  { id: 'demo-admin-001', email: 'admin@resqai.demo', name: 'Demo Admin', role: 'admin', createdAt: new Date().toISOString() },
  { id: 'demo-citizen-001', email: 'citizen@resqai.demo', name: 'Demo Citizen', phone: '+91 99999 00000', role: 'citizen', createdAt: new Date().toISOString() },
];

// ============================================================
// Provider
// ============================================================

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load incidents from Supabase if configured, else from LocalStorage with demo data fallback
  useEffect(() => {
    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem('resqai_incidents');
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Incident[];
          const userSubmitted = parsed.filter((i: Incident) => !i.isDemo);
          dispatch({ type: 'SET_INCIDENTS', payload: [...userSubmitted, ...DEMO_INCIDENTS] });
        } catch {}
      }
      return;
    }

    // Connect to Supabase incidents database
    let isMounted = true;
    const fetchSupabaseIncidents = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { data, error } = await supabase
          .from('incidents')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error && isMounted) {
          const mapped: Incident[] = data.map((row: any) => ({
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
          }));
          dispatch({ type: 'SET_INCIDENTS', payload: mapped });
        }
      } catch (err) {
        console.warn('Could not query Supabase incidents, falling back to local storage:', err);
      } finally {
        if (isMounted) dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchSupabaseIncidents();

    // Supabase Realtime synchronization
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

  // Sync to localStorage in local demo mode
  useEffect(() => {
    if (!isSupabaseConfigured) {
      const userSubmitted = state.incidents.filter(i => !i.isDemo);
      if (userSubmitted.length > 0) {
        localStorage.setItem('resqai_incidents', JSON.stringify(state.incidents));
      }
    }
  }, [state.incidents]);

  // Apply theme
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Real Dynamic Application Statistics Calculation
  const stats: DashboardStats = useMemo(() => {
    const total = state.incidents.length;
    const critical = state.incidents.filter(i => i.severity === 'critical').length;
    const high = state.incidents.filter(i => i.severity === 'high').length;
    const pending = state.incidents.filter(i => i.status === 'pending' || i.status === 'reported').length;
    const inProgress = state.incidents.filter(i => i.status === 'in_progress').length;
    const resolved = state.incidents.filter(i => i.status === 'resolved').length;

    // Lives Impacted: Sum of affected people, deduplicated by incident ID
    const seenIncidentIds = new Set<string>();
    let livesImpacted = 0;
    for (const inc of state.incidents) {
      if (!seenIncidentIds.has(inc.id)) {
        seenIncidentIds.add(inc.id);
        livesImpacted += Number(inc.affectedPeople) || 0;
      }
    }

    // Average Response Time: Difference between createdAt and responseStartedAt for incidents with valid timestamps
    const responseTimesMinutes = state.incidents
      .filter(i => i.createdAt && i.responseStartedAt)
      .map(i => {
        const reportedAt = new Date(i.createdAt).getTime();
        const responseAt = new Date(i.responseStartedAt!).getTime();
        const diffMinutes = (responseAt - reportedAt) / (1000 * 60);
        return diffMinutes >= 0 && !isNaN(diffMinutes) ? diffMinutes : null;
      })
      .filter((v): v is number => v !== null);

    const avgResponseTimeMinutes = responseTimesMinutes.length > 0
      ? Math.round((responseTimesMinutes.reduce((sum, curr) => sum + curr, 0) / responseTimesMinutes.length) * 10) / 10
      : null;

    const isDemoData = !isSupabaseConfigured || state.incidents.some(i => i.isDemo);

    return {
      total,
      critical,
      high,
      pending,
      inProgress,
      resolved,
      livesImpacted,
      avgResponseTimeMinutes,
      aiAccuracy: 'Not Yet Evaluated',
      isDemoData,
      isLoading: state.isLoading,
    };
  }, [state.incidents, state.isLoading]);

  const unreadCount = state.notifications.filter(n => !n.read).length;

  // Auth functions
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await new Promise(r => setTimeout(r, 600)); // Smooth transition
    
    const demoCredentials: Record<string, string> = {
      'admin@resqai.demo': 'admin123',
      'citizen@resqai.demo': 'citizen123',
    };
    
    const demoUser = DEMO_USERS.find(u => u.email === email);
    if (demoUser && demoCredentials[email] === password) {
      dispatch({ type: 'SET_USER', payload: demoUser });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    }
    
    dispatch({ type: 'SET_LOADING', payload: false });
    return { success: false, error: 'Invalid credentials. Use demo accounts below.' };
  };

  const register = async (name: string, email: string, _password: string, phone: string): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await new Promise(r => setTimeout(r, 800));
    
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

  const addIncident = async (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<Incident> => {
    const newIncident: Incident = {
      ...incident,
      id: `INC-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_INCIDENT', payload: newIncident });

    // Supabase insert when connected
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
        console.warn('Supabase remote write error:', err);
      }
    }

    // Add notification
    const notif: Notification = {
      id: `NOTIF-${Date.now()}`,
      title: `New ${newIncident.severity.toUpperCase()} Incident`,
      message: `${newIncident.title} reported at ${newIncident.location}`,
      type: newIncident.severity === 'critical' ? 'critical' : newIncident.severity === 'high' ? 'warning' : 'info',
      read: false,
      incidentId: newIncident.id,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });

    // Add history
    const hist: IncidentHistory = {
      id: `HIST-${Date.now()}`,
      incidentId: newIncident.id,
      action: 'Incident Reported',
      details: 'Report submitted via RESQ AI',
      performedBy: state.user?.name ?? 'Anonymous Citizen',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_HISTORY', payload: hist });

    return newIncident;
  };

  const updateIncidentStatus = (id: string, status: Incident['status'], adminName = 'Administrator') => {
    const incident = state.incidents.find(i => i.id === id);
    if (!incident) return;

    const responseStartedAt = (status === 'in_progress' && !incident.responseStartedAt)
      ? new Date().toISOString()
      : incident.responseStartedAt;

    const updated: Incident = {
      ...incident,
      status,
      updatedAt: new Date().toISOString(),
      responseStartedAt,
      ...(status === 'verified' && { verifiedAt: incident.verifiedAt || new Date().toISOString() }),
      ...(status === 'resolved' && { resolvedAt: new Date().toISOString() }),
    };
    dispatch({ type: 'UPDATE_INCIDENT', payload: updated });

    if (isSupabaseConfigured) {
      supabase.from('incidents').update({
        status,
        response_started_at: responseStartedAt,
        updated_at: new Date().toISOString(),
        ...(status === 'verified' && { verified_at: updated.verifiedAt }),
        ...(status === 'resolved' && { resolved_at: updated.resolvedAt }),
      }).eq('id', id).catch(() => {});
    }

    // History
    const hist: IncidentHistory = {
      id: `HIST-${Date.now()}`,
      incidentId: id,
      action: `Status: ${status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      details: `Incident status updated to ${status}`,
      performedBy: adminName,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_HISTORY', payload: hist });

    // Notification
    if (status === 'resolved') {
      const notif: Notification = {
        id: `NOTIF-${Date.now()}`,
        title: '✅ Incident Resolved',
        message: `${incident.title} has been resolved.`,
        type: 'success',
        read: false,
        incidentId: id,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: notif });
    }
  };

  const assignTeam = (incidentId: string, teamId: string) => {
    const incident = state.incidents.find(i => i.id === incidentId);
    const team = state.teams.find(t => t.id === teamId);
    if (!incident || !team) return;

    const responseStartedAt = incident.responseStartedAt || new Date().toISOString();

    dispatch({
      type: 'UPDATE_INCIDENT',
      payload: {
        ...incident,
        assignedTeamId: teamId,
        assignedTeamName: team.name,
        status: 'in_progress',
        responseStartedAt,
        updatedAt: new Date().toISOString(),
      },
    });

    dispatch({
      type: 'UPDATE_TEAM',
      payload: { ...team, status: 'assigned', currentAssignment: incidentId },
    });

    if (isSupabaseConfigured) {
      supabase.from('incidents').update({
        status: 'in_progress',
        response_started_at: responseStartedAt,
        updated_at: new Date().toISOString(),
      }).eq('id', incidentId).catch(() => {});
    }

    const hist: IncidentHistory = {
      id: `HIST-${Date.now()}`,
      incidentId,
      action: 'Team Assigned',
      details: `${team.name} dispatched to location`,
      performedBy: state.user?.name ?? 'Administrator',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_HISTORY', payload: hist });

    const notif: Notification = {
      id: `NOTIF-${Date.now()}`,
      title: '👥 Response Team Assigned',
      message: `${team.name} has been assigned to: ${incident.title}`,
      type: 'info',
      read: false,
      incidentId,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notif });
  };

  return (
    <AppContext.Provider value={{
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
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AnimatePresence } from 'framer-motion';

// Layouts
import { AppLayout } from './layouts/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { ReportEmergency } from './pages/ReportEmergency';
import { MyReports } from './pages/MyReports';
import { AdminDashboard } from './pages/AdminDashboard';
import { IncidentManagement } from './pages/IncidentManagement';
import { LiveMap } from './pages/LiveMap';
import { AICopilot } from './pages/AICopilot';
import { ResourceManagement } from './pages/ResourceManagement';
import { NotificationsPage } from './pages/NotificationsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { state } = useApp();
  if (!state.user) return <Navigate to="/login" replace />;
  if (adminOnly && state.user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { state } = useApp();

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={state.user ? <Navigate to={state.user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <LoginPage />} />
        <Route path="/register" element={state.user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

        {/* Citizen routes */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<ProtectedRoute><CitizenDashboard /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><ReportEmergency /></ProtectedRoute>} />
          <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><LiveMap /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/incidents" element={<ProtectedRoute adminOnly><IncidentManagement /></ProtectedRoute>} />
          <Route path="/admin/copilot" element={<ProtectedRoute adminOnly><AICopilot /></ProtectedRoute>} />
          <Route path="/admin/resources" element={<ProtectedRoute adminOnly><ResourceManagement /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute adminOnly><AnalyticsPage /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

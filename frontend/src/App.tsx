import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SchoolsPage } from './pages/SchoolsPage';
import { SchoolWorkspacePage } from './pages/SchoolWorkspacePage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { VisitsPage } from './pages/VisitsPage';
import { SalesTargetsPage } from './pages/SalesTargetsPage';
import { PresentationsPage } from './pages/PresentationsPage';
import { DiscoveryBankPage } from './pages/DiscoveryBankPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { SalesTeamPage } from './pages/SalesTeamPage';
import { ReportsPage } from './pages/ReportsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiresManager?: boolean }> = ({
  children,
  requiresManager
}) => {
  const { isAuthenticated, isLoading, isSuperAdmin, isSalesManager } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiresManager && !isSuperAdmin && !isSalesManager) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="schools" element={<SchoolsPage />} />
              <Route path="schools/:id" element={<SchoolWorkspacePage />} />
              <Route
                path="assignments"
                element={
                  <ProtectedRoute requiresManager>
                    <AssignmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="visits" element={<VisitsPage />} />
              <Route path="targets" element={<SalesTargetsPage />} />
              <Route path="presentations" element={<PresentationsPage />} />
              <Route path="discovery" element={<DiscoveryBankPage />} />
              <Route path="knowledge-base" element={<KnowledgeBasePage />} />
              <Route
                path="team"
                element={
                  <ProtectedRoute requiresManager>
                    <SalesTeamPage />
                  </ProtectedRoute>
                }
              />
              <Route path="reports" element={<ReportsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;

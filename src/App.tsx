import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider }  from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import AuthGuard         from './components/auth/AuthGuard';
import AppShell          from './components/layout/AppShell';
import Toaster           from './components/common/Toaster';
import ErrorBoundary     from './components/common/ErrorBoundary';
import { Loader2 }       from 'lucide-react';

// Route-level code splitting — each page loads only when first visited
const AuthPage        = lazy(() => import('./pages/AuthPage'));
const DashboardPage   = lazy(() => import('./pages/DashboardPage'));
const TasksPage       = lazy(() => import('./pages/TasksPage'));
const CategoriesPage  = lazy(() => import('./pages/CategoriesPage'));
const SettingsPage    = lazy(() => import('./pages/SettingsPage'));

function PageFallback() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-indigo-600 dark:text-indigo-400" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/auth" element={<AuthPage />} />
                  <Route
                    element={
                      <AuthGuard>
                        <AppShell />
                      </AuthGuard>
                    }
                  >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard"  element={<DashboardPage />} />
                    <Route path="/tasks"      element={<TasksPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/settings"   element={<SettingsPage />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
            <Toaster />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

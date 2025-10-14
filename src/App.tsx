import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { SearchProvider } from './contexts/SearchContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ConfirmationProvider } from './contexts/ConfirmationContext';
import { MobileProvider } from './contexts/MobileContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy load components for better performance
const LandingPage = lazy(() => import('./components/landing/LandingPage'));
const LoginPage = lazy(() => import('./components/auth/LoginPage'));
const RegisterPage = lazy(() => import('./components/auth/RegisterPage'));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MobileProvider>
          <SearchProvider>
            <NotificationProvider>
              <ConfirmationProvider>
            <Router>
          <div className="App">
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Loading Flowin...</p>
                </div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/dashboard/*"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
              }}
            />
          </div>
            </Router>
              </ConfirmationProvider>
            </NotificationProvider>
          </SearchProvider>
        </MobileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

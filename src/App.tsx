import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { SearchProvider } from './contexts/SearchContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ConfirmationProvider } from './contexts/ConfirmationContext';
import { MobileProvider } from './contexts/MobileContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './components/landing/LandingPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import Dashboard from './components/dashboard/Dashboard';

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

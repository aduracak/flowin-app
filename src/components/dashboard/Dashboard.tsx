import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useMobile } from '../../contexts/MobileContext';

// Lazy load dashboard components
const DashboardHome = lazy(() => import('./DashboardHome'));
const ProjectBoard = lazy(() => import('./ProjectBoard'));
const TeamPage = lazy(() => import('./TeamPage'));
const SettingsPage = lazy(() => import('./SettingsPage'));

export default function Dashboard() {
  const { isMobile, isTablet } = useMobile();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        (isMobile || isTablet) ? 'w-full' : ''
      }`}>
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            <Suspense fallback={
              <div className="p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent mb-3"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                </div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<DashboardHome />} />
                <Route path="/projects" element={<ProjectBoard />} />
                <Route path="/projects/:projectId" element={<ProjectBoard />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

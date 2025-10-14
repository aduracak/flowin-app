import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardHome from './DashboardHome';
import ProjectBoard from './ProjectBoard';
import TeamPage from './TeamPage';
import SettingsPage from './SettingsPage';
import { useMobile } from '../../contexts/MobileContext';

export default function Dashboard() {
  const { isMobile, isTablet, sidebarOpen } = useMobile();

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
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/projects" element={<ProjectBoard />} />
              <Route path="/projects/:projectId" element={<ProjectBoard />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

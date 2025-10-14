import React, { createContext, useContext, useState, useEffect } from 'react';

interface MobileContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

const MobileContext = createContext<MobileContextType | undefined>(undefined);

export function useMobile() {
  const context = useContext(MobileContext);
  if (context === undefined) {
    throw new Error('useMobile must be used within a MobileProvider');
  }
  return context;
}

interface MobileProviderProps {
  children: React.ReactNode;
}

export function MobileProvider({ children }: MobileProviderProps) {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Update screen size
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
      
      // Update orientation
      setOrientation(width > height ? 'landscape' : 'portrait');
      
      // Auto-close sidebar on mobile when screen changes
      if (width < 1024 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    // Initial check
    updateScreenSize();

    // Listen to resize events
    window.addEventListener('resize', updateScreenSize);
    window.addEventListener('orientationchange', () => {
      // Delay to get correct dimensions after orientation change
      setTimeout(updateScreenSize, 100);
    });

    return () => {
      window.removeEventListener('resize', updateScreenSize);
      window.removeEventListener('orientationchange', updateScreenSize);
    };
  }, [sidebarOpen]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (screenSize === 'mobile' && sidebarOpen) {
        const target = event.target as HTMLElement;
        const sidebar = document.getElementById('mobile-sidebar');
        const hamburger = document.getElementById('hamburger-menu');
        
        if (
          sidebar && 
          !sidebar.contains(target) && 
          hamburger && 
          !hamburger.contains(target)
        ) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [screenSize, sidebarOpen]);

  const isMobile = screenSize === 'mobile';
  const isTablet = screenSize === 'tablet';
  const isDesktop = screenSize === 'desktop';

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const value: MobileContextType = {
    isMobile,
    isTablet,
    isDesktop,
    screenSize,
    orientation,
    sidebarOpen,
    setSidebarOpen,
    closeSidebar,
    toggleSidebar,
  };

  return (
    <MobileContext.Provider value={value}>
      {children}
    </MobileContext.Provider>
  );
}
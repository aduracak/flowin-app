import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  FolderKanban,
  Users,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: 'Dashboard',
      path: '/dashboard',
    },
    {
      icon: <FolderKanban className="h-5 w-5" />,
      label: 'Projects',
      path: '/dashboard/projects',
      hasSubmenu: true,
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Team',
      path: '/dashboard/team',
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
      path: '/dashboard/settings',
    },
  ];

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3 }}
      className={`relative bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center space-x-2"
          >
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Flowin
            </span>
          </motion.div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'sidebar-item-active' : 'text-gray-700 dark:text-gray-300'}`
            }
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-3"
            >
              {item.icon}
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </motion.div>
          </NavLink>
        ))}
      </nav>

      {/* Create Project Button */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 border-t border-gray-200 dark:border-gray-700"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
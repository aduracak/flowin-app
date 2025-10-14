import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  X,
  MoreVertical,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  Calendar,
  Settings,
  ExternalLink,
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import type { Notification } from '../../contexts/NotificationContext';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
  } = useNotifications();
  
  const navigate = useNavigate();
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const toggleExpanded = (notificationId: string) => {
    const newExpanded = new Set(expandedNotifications);
    if (newExpanded.has(notificationId)) {
      newExpanded.delete(notificationId);
    } else {
      newExpanded.add(notificationId);
    }
    setExpandedNotifications(newExpanded);
  };

  const getNotificationIcon = (type: string, _priority: string) => {
    switch (type) {
      case 'task_assigned':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'task_completed':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'project_invite':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'deadline_reminder':
        return <Calendar className="h-5 w-5 text-red-500" />;
      case 'team_update':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const visibleNotifications = notifications.filter(n => !n.isRead || expandedNotifications.has(n.id));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="absolute right-0 mt-2 w-96 max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          
          {/* Action buttons */}
          {notifications.length > 0 && (
            <div className="flex items-center space-x-2 mt-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={handleClearAll}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                We'll notify you when something important happens
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {visibleNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer border-l-4 ${
                    getPriorityColor(notification.priority)
                  } ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            !notification.isRead 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.title}
                          </p>
                          <p className={`text-sm mt-1 ${
                            expandedNotifications.has(notification.id) || notification.message.length <= 60
                              ? ''
                              : 'line-clamp-2'
                          } ${
                            !notification.isRead
                              ? 'text-gray-600 dark:text-gray-400'
                              : 'text-gray-500 dark:text-gray-500'
                          }`}>
                            {notification.message}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1 ml-2">
                          {notification.message.length > 60 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(notification.id);
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            >
                              <MoreVertical className="h-3 w-3 text-gray-400" />
                            </button>
                          )}
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                              title="Mark as read"
                            >
                              <Check className="h-3 w-3 text-green-500" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(notification.createdAt)}</span>
                          {notification.priority === 'high' && (
                            <span className="flex items-center space-x-1 text-red-500">
                              <AlertCircle className="h-3 w-3" />
                              <span>High priority</span>
                            </span>
                          )}
                        </div>
                        {notification.actionUrl && (
                          <ExternalLink className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                navigate('/dashboard/settings');
                onClose();
              }}
              className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
            >
              Notification Settings
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
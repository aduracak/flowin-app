import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Local type definitions for notifications
export interface Notification {
  id: string;
  userId: string;
  type: 'task_assigned' | 'task_completed' | 'project_invite' | 'deadline_reminder' | 'team_update' | 'system';
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  relatedProjectId?: string;
  relatedTaskId?: string;
  relatedUserId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  createNotification: (notification: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'isRead'>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time listener for user notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsList = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Helper function to convert date fields safely
        const convertDate = (dateField: any) => {
          if (!dateField) return new Date();
          if (dateField.toDate && typeof dateField.toDate === 'function') {
            return dateField.toDate();
          }
          if (dateField instanceof Date) {
            return dateField;
          }
          if (typeof dateField === 'string') {
            return new Date(dateField);
          }
          return new Date();
        };
        
        return {
          id: doc.id,
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          actionUrl: data.actionUrl,
          isRead: data.isRead || false,
          priority: data.priority,
          createdAt: convertDate(data.createdAt),
          relatedProjectId: data.relatedProjectId,
          relatedTaskId: data.relatedTaskId,
          relatedUserId: data.relatedUserId,
        };
      });
      
      setNotifications(notificationsList);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Generate sample notifications for new users
  useEffect(() => {
    if (user && notifications.length === 0 && !isLoading) {
      // Check if welcome notifications already exist in localStorage
      const hasWelcomeNotifications = localStorage.getItem(`flowin-welcome-${user.id}`);
      
      if (!hasWelcomeNotifications) {
        const generateWelcomeNotifications = async () => {
          try {
            const welcomeNotifications = [
              {
                type: 'system' as const,
                title: '🎉 Welcome to Flowin!',
                message: 'Get started by creating your first project and inviting team members.',
                priority: 'high' as const,
                actionUrl: '/dashboard/projects',
              },
              {
                type: 'system' as const,
                title: '📊 Explore the Kanban Board',
                message: 'Organize your tasks with our intuitive drag-and-drop Kanban board.',
                priority: 'medium' as const,
                actionUrl: '/dashboard/projects',
              },
              {
                type: 'system' as const,
                title: '👥 Team Collaboration',
                message: 'Invite team members and collaborate on projects in real-time.',
                priority: 'medium' as const,
                actionUrl: '/dashboard/team',
              },
            ];

            for (const notification of welcomeNotifications) {
              await createNotification(notification);
            }
            
            // Mark welcome notifications as created
            localStorage.setItem(`flowin-welcome-${user.id}`, 'true');
          } catch (error) {
            console.error('Error creating welcome notifications:', error);
          }
        };

        // Delay to avoid creating notifications immediately
        const timer = setTimeout(() => {
          generateWelcomeNotifications();
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [user, notifications.length, isLoading]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      const updatePromises = unreadNotifications.map(notification => 
        updateDoc(doc(db, 'notifications', notification.id), { isRead: true })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // In a real app, you might want to soft delete or archive instead
      // For now, we'll just mark as read and let the UI handle hiding
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  };

  const clearAllNotifications = async () => {
    try {
      const updatePromises = notifications.map(notification => 
        updateDoc(doc(db, 'notifications', notification.id), { isRead: true })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      throw error;
    }
  };

  const createNotification = async (
    notification: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'isRead'>
  ) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        userId: user.id,
        isRead: false,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    createNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
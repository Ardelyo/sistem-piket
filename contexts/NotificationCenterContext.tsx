import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { api } from '../services/api';
import type { AppNotification } from '../types';
import { useAuth } from './AuthContext';

interface NotificationCenterContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  markAllAsRead: () => Promise<void>;
}

const NotificationCenterContext = createContext<NotificationCenterContextType | undefined>(undefined);

export const NotificationCenterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (user?.role === 'Siswa') {
      try {
        setLoading(true);
        const data = await api.getNotificationsForStudent(user.id);
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setLoading(false);
      }
    } else {
        setNotifications([]);
        setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll for new notifications every 30 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = useCallback(async () => {
    if (user?.role === 'Siswa' && unreadCount > 0) {
      
      // Optimistically update UI to feel instant
      setNotifications(prev => prev.map(n => n.isRead ? n : { ...n, isRead: true }));
      
      try {
          await api.markAllNotificationsAsRead(user.id);
      } catch (error) {
          console.error("Failed to mark notifications as read", error);
          // Optional: Revert optimistic update on failure
          fetchNotifications();
      }
    }
  }, [user, unreadCount, fetchNotifications]);

  return (
    <NotificationCenterContext.Provider value={{ notifications, unreadCount, loading, markAllAsRead }}>
      {children}
    </NotificationCenterContext.Provider>
  );
};

export const useNotificationCenter = () => {
  const context = useContext(NotificationCenterContext);
  if (context === undefined) {
    throw new Error('useNotificationCenter must be used within a NotificationCenterProvider');
  }
  return context;
};

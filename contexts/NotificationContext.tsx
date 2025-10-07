
import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import Notification from '../components/shared/Notification';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationMessage {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  addNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationMessage | null>(null);

  const addNotification = useCallback((message: string, type: NotificationType) => {
    const id = Date.now();
    setNotification({ id, message, type });
    setTimeout(() => {
      setNotification(current => (current?.id === id ? null : current));
    }, 5000);
  }, []);

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};


import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Allow time for exit animation before calling onClose
      setTimeout(onClose, 300);
    }, 4700);

    return () => clearTimeout(timer);
  }, [message, type, onClose]);

  const config = {
    success: { icon: CheckCircleIcon, color: 'bg-success' },
    error: { icon: XCircleIcon, color: 'bg-danger' },
    info: { icon: InformationCircleIcon, color: 'bg-blue-500' },
  };

  const Icon = config[type].icon;

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center transition-all duration-500 ease-in-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      }`}
    >
      <div className="bg-gray-800 text-white rounded-full p-2 flex items-center space-x-3 shadow-lifted min-w-[250px] max-w-md">
        <div className={`p-1 rounded-full ${config[type].color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <p className="text-sm font-medium pr-3">{message}</p>
      </div>
    </div>
  );
};

export default Notification;

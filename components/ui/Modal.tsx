import React, { ReactNode, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'sm' }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);
  
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-30 flex justify-center items-center p-4"
        onClick={onClose}
    >
      <div 
        className={`bg-background rounded-3xl shadow-lifted w-full ${sizeClasses[size]} transform transition-all duration-300 ease-out animate-modal-in overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-card">
          <h3 className="text-xl font-bold text-primary">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-card transition-colors">
            <XMarkIcon className="h-6 w-6 text-text-light" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
       <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-in {
          animation: modal-in 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
      `}</style>
    </div>
  );
};

export default Modal;
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  backdropClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  backdropClassName = '',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`animate-fade-in absolute inset-0 bg-slate-900/30 backdrop-blur-sm ${backdropClassName}`}
        onClick={onClose}
      />
      <div className={`animate-fade-in relative w-full max-w-sm rounded-[2rem] border border-slate-100 bg-white p-6 shadow-2xl ${className}`}>
        {children}
      </div>
    </div>
  );
};

interface OverlayProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
  isDark?: boolean;
}

export const Overlay: React.FC<OverlayProps> = ({
  isOpen,
  children,
  className = '',
  isDark = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`animate-fade-in absolute inset-0 z-50 flex flex-col items-center justify-center safe-overlay ${
        isDark ? 'bg-slate-900/95' : 'bg-slate-50/95'
      } backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
};
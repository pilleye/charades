'use client';

import React from 'react';
import { Overlay } from './Modal';
import { Button } from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDark?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'YES, EXIT',
  cancelLabel = 'CANCEL',
  isDark = false,
}) => {
  const textMainClass = isDark ? 'text-white' : 'text-slate-900';
  const textSubClass = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <Overlay isOpen={isOpen} isDark={isDark} className="space-y-8 p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-4">
          <h2 className={`text-4xl font-black uppercase tracking-wide ${textMainClass}`}>
            {title}
          </h2>
          <p className={`text-lg font-bold ${textSubClass}`}>
            {message}
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <Button 
            variant="danger" 
            size="xl" 
            fullWidth 
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onClose}
            className={isDark ? 'bg-slate-700 text-white shadow-[0_4px_0_0_rgba(15,23,42,1)] hover:bg-slate-600' : ''}
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </Overlay>
  );
};

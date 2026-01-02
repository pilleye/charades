import React from 'react';

interface SafeScreenProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * SafeScreen - Wrapper for full-screen content that respects Dynamic Island
 * - Portrait: adds top padding for Dynamic Island
 * - Landscape: adds left/right padding based on device orientation
 */
export const SafeScreen: React.FC<SafeScreenProps> = ({ children, className = '' }) => {
  return (
    <div className={`safe-screen ${className}`}>
      {children}
    </div>
  );
};

interface SafeOverlayContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * SafeOverlayContent - Wrapper for overlay/modal content
 * - Applies safe area padding on all sides (top, left, right)
 * - Used for pause menus, dialogs, etc.
 */
export const SafeOverlayContent: React.FC<SafeOverlayContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`safe-overlay ${className}`}>
      {children}
    </div>
  );
};

interface ProgressBarSpacerProps {
  className?: string;
}

/**
 * ProgressBarSpacer - Spacer element for progress bars
 * - Portrait: creates space below Dynamic Island
 * - Landscape: no space (progress bar flush with edge)
 */
export const ProgressBarSpacer: React.FC<ProgressBarSpacerProps> = ({ className = '' }) => {
  return <div className={`safe-top-spacer shrink-0 ${className}`} />;
};

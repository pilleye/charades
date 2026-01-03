import React from 'react';
import { useIsPremium } from '@/store/subscriptionStore';
import { LockIcon } from './Icons';

interface PremiumGateProps {
  children: React.ReactNode;
  featureName?: string;
  onLockClick?: () => void;
  showBadge?: boolean;
  isDisabled?: boolean;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({
  children,
  onLockClick,
  showBadge = true,
  isDisabled = false
}) => {
  const isPremium = useIsPremium();

  if (isPremium || isDisabled) return <>{children}</>;

  return (
    <div className="relative group cursor-pointer" onClick={onLockClick}>
      <div className="opacity-50 pointer-events-none grayscale-[0.5]">
        {children}
      </div>
      {showBadge && (
        <div className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-yellow-900 shadow-sm transition-transform group-active:scale-110">
          <LockIcon />
        </div>
      )}
    </div>
  );
};

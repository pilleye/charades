import { useEffect } from 'react';
import { wakeLockManager } from '@/lib/wakeLock';

/**
 * Custom hook to manage wake lock state based on a boolean trigger.
 * When isActive is true, the screen will stay on.
 * When isActive is false or the component unmounts, wake lock is released.
 * 
 * @param isActive - Whether the wake lock should be active (typically !isPaused)
 */
export function useWakeLock(isActive: boolean): void {
  useEffect(() => {
    if (isActive) {
      wakeLockManager.enable();
    } else {
      wakeLockManager.disable();
    }
    
    return () => {
      wakeLockManager.disable();
    };
  }, [isActive]);
}

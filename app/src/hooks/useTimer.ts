import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  initialTime: number;
  onFinish?: () => void;
  onTick?: (remaining: number) => void;
  autoStart?: boolean;
}

export function useTimer({
  initialTime,
  onFinish,
  onTick,
  autoStart = false
}: UseTimerOptions) {
  const [remaining, setRemaining] = useState(initialTime);
  const [isActive, setIsActive] = useState(autoStart);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Refs for callbacks
  const onTickRef = useRef(onTick);
  const onFinishRef = useRef(onFinish);
  
  // Ref for remaining time - Source of Truth for interval
  const remainingRef = useRef(initialTime);

  useEffect(() => {
    onTickRef.current = onTick;
    onFinishRef.current = onFinish;
  }, [onTick, onFinish]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Wrapper to keep ref in sync if called externally
  const setRemainingSynced = useCallback((valueOrUpdater: number | ((prev: number) => number)) => {
    setRemaining((prev) => {
      const next = typeof valueOrUpdater === 'function' ? valueOrUpdater(prev) : valueOrUpdater;
      remainingRef.current = next;
      return next;
    });
  }, []);

  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
    clear();
  }, [clear]);

  const reset = useCallback((newTime?: number) => {
    clear();
    const t = newTime ?? initialTime;
    remainingRef.current = t;
    setRemaining(t);
    setIsActive(false);
  }, [clear, initialTime]);

  useEffect(() => {
    if (isActive && remainingRef.current > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      
      timerRef.current = setInterval(() => {
        const current = remainingRef.current;
        
        if (current <= 1) {
          // Finish
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          
          remainingRef.current = 0;
          setIsActive(false);
          setRemaining(0);
          if (onFinishRef.current) onFinishRef.current();
        } else {
          // Tick
          const next = current - 1;
          remainingRef.current = next; // Sync update
          setRemaining(next);
          if (onTickRef.current) onTickRef.current(next);
        }
      }, 1000);
    } else {
      clear();
    }

    return () => clear();
  }, [isActive, clear]);

  return {
    remaining,
    isActive,
    start,
    pause,
    reset,
    setRemaining: setRemainingSynced
  };
}

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

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
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
    setRemaining(newTime ?? initialTime);
    setIsActive(false);
  }, [clear, initialTime]);

  useEffect(() => {
    if (isActive && remaining > 0) {
      timerRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clear();
            setIsActive(false);
            if (onFinish) onFinish();
            return 0;
          }
          const next = prev - 1;
          if (onTick) onTick(next);
          return next;
        });
      }, 1000);
    } else {
      clear();
    }

    return () => clear();
  }, [isActive, clear, onFinish, onTick]); // Removed remaining from deps to avoid interval reset on every tick

  return {
    remaining,
    isActive,
    start,
    pause,
    reset,
    setRemaining
  };
}

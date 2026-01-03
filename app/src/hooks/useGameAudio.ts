import { useCallback } from 'react';
import { soundEngine } from '../lib/audio';

export function useGameAudio() {
  const playCorrect = useCallback(() => {
    soundEngine.playSuccess();
  }, []);

  const playSkip = useCallback(() => {
    soundEngine.playSkip();
  }, []);

  const playTimeUp = useCallback(() => {
    soundEngine.playBuzzer();
  }, []);

  const playCountdown = useCallback(() => {
    soundEngine.playCountdown(true);
  }, []);

  const playTick = useCallback(() => {
    soundEngine.playTick();
  }, []);

  return {
    playCorrect,
    playSkip,
    playTimeUp,
    playCountdown,
    playTick,
  };
}
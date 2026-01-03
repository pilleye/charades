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

  const playReadyBeep = useCallback(() => {
    soundEngine.playCountdown(false);
  }, []);

  const playTick = useCallback((freq?: number, volume?: number) => {
    soundEngine.playTick(freq, volume);
  }, []);

  return {
    playCorrect,
    playSkip,
    playTimeUp,
    playCountdown,
    playReadyBeep,
    playTick,
  };
}
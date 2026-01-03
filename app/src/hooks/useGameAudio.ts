import { useCallback } from 'react';
import { soundEngine } from '../lib/audio';

export function useGameAudio() {
  const playCorrect = useCallback(() => {
    console.log('[useGameAudio] playCorrect()');
    soundEngine.playSuccess();
  }, []);

  const playSkip = useCallback(() => {
    console.log('[useGameAudio] playSkip()');
    soundEngine.playSkip();
  }, []);

  const playTimeUp = useCallback(() => {
    console.log('[useGameAudio] playTimeUp()');
    soundEngine.playBuzzer();
  }, []);

  const playCountdown = useCallback(() => {
    console.log('[useGameAudio] playCountdown()');
    soundEngine.playCountdown(true);
  }, []);

  const playReadyBeep = useCallback(() => {
    console.log('[useGameAudio] playReadyBeep()');
    soundEngine.playCountdown(false);
  }, []);

  const playTick = useCallback((freq?: number, volume?: number) => {
    // console.log('[useGameAudio] playTick()'); // Too noisy
    soundEngine.playTick(freq, volume);
  }, []);

  const playUrgentTick = useCallback(() => {
    console.log('[useGameAudio] playUrgentTick()');
    soundEngine.playUrgentTick();
  }, []);

  return {
    playCorrect,
    playSkip,
    playTimeUp,
    playCountdown,
    playReadyBeep,
    playTick,
    playUrgentTick,
  };
}
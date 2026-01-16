import { useCallback } from 'react';
import { soundEngine } from '../lib/audio';

export function useGameAudio() {
  const playCorrect = useCallback(() => {
    console.info('[useGameAudio] playCorrect()');
    soundEngine.playSuccess();
  }, []);

  const playSkip = useCallback(() => {
    console.info('[useGameAudio] playSkip()');
    soundEngine.playSkip();
  }, []);

  const playTimeUp = useCallback(() => {
    console.info('[useGameAudio] playTimeUp()');
    soundEngine.playBuzzer();
  }, []);

  const playCountdown = useCallback(() => {
    console.info('[useGameAudio] playCountdown()');
    soundEngine.playCountdown(true);
  }, []);

  const playReadyBeep = useCallback(() => {
    console.info('[useGameAudio] playReadyBeep()');
    soundEngine.playCountdown(false);
  }, []);

  const playTick = useCallback((freq?: number, volume?: number) => {
    // console.info('[useGameAudio] playTick()'); // Too noisy
    soundEngine.playTick(freq, volume);
  }, []);

  const playUrgentTick = useCallback(() => {
    console.info('[useGameAudio] playUrgentTick()');
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
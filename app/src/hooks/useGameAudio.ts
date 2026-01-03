import { useCallback } from 'react';
import { soundEngine } from '../lib/audio';

export function useGameAudio() {
  const playCorrect = useCallback(() => {
    soundEngine.play('correct');
  }, []);

  const playSkip = useCallback(() => {
    soundEngine.play('skip');
  }, []);

  const playTimeUp = useCallback(() => {
    soundEngine.play('timeUp');
  }, []);

  const playCountdown = useCallback(() => {
    soundEngine.play('countdown');
  }, []);

  const playTick = useCallback(() => {
    soundEngine.play('tick');
  }, []);

  return {
    playCorrect,
    playSkip,
    playTimeUp,
    playCountdown,
    playTick,
  };
}

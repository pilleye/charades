'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { soundEngine } from '@/lib/audio';
import { GameContainer } from './GameContainer';
import { Setup } from './Setup';
import { ReadyCheck } from './ReadyCheck';
import { Countdown } from './Countdown';
import { ActivePlay } from './ActivePlay';
import { Review } from './Review';
import { Scoreboard } from './Scoreboard';
import { SecondChanceRound } from './SecondChanceRound';

export const CharadesApp: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  const { phase } = gameState;

  useEffect(() => {
    const handleResume = async () => {
      try {
        await soundEngine.resume();
      } catch (err) {
        console.error('Failed to resume audio:', err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(handleResume, 100);
      } else {
        const { gameState: currentGameState } = useGameStore.getState();
        if (
          (currentGameState.phase === 'ACTIVE' || 
           currentGameState.phase === 'COUNTDOWN' || 
           currentGameState.phase === 'SECOND_CHANCE') &&
          !currentGameState.isPaused
        ) {
          useGameStore.setState({ 
            gameState: { ...currentGameState, isPaused: true } 
          });
        }
      }
    };

    const handleBlur = () => {
      const { gameState: currentGameState } = useGameStore.getState();
      if (
        (currentGameState.phase === 'ACTIVE' || 
         currentGameState.phase === 'COUNTDOWN' || 
         currentGameState.phase === 'SECOND_CHANCE') &&
        !currentGameState.isPaused
      ) {
        useGameStore.setState({ 
          gameState: { ...currentGameState, isPaused: true } 
        });
      }
    };

    const handleFocus = () => {
      handleResume();
    };

    const handlePageShow = () => {
      // Handle browser back/forward cache restoration
      handleResume();
    };

    // Comprehensive event listeners for mobile and desktop
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('touchstart', handleResume, { passive: true });
    document.addEventListener('touchend', handleResume, { passive: true });
    document.addEventListener('click', handleResume);
    document.addEventListener('keydown', handleResume);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pageshow', handlePageShow);

    // Initial resume attempt
    handleResume();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('touchstart', handleResume);
      document.removeEventListener('touchend', handleResume);
      document.removeEventListener('click', handleResume);
      document.removeEventListener('keydown', handleResume);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  const renderPhase = () => {
    switch (phase) {
      case 'SETUP':
        return <Setup />;
      case 'READY_CHECK':
        return <ReadyCheck />;
      case 'COUNTDOWN':
        return <Countdown />;
      case 'ACTIVE':
        return <ActivePlay />;
      case 'SECOND_CHANCE':
        return <SecondChanceRound />;
      case 'REVIEW':
        return <Review />;
      case 'SCOREBOARD':
        return <Scoreboard />;
      default:
        return <Setup />;
    }
  };

  return (
    <GameContainer>
      {renderPhase()}
    </GameContainer>
  );
};

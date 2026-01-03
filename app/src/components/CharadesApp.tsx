'use client';

import React, { useEffect } from 'react';
import { useGameStore, GamePhase, TurnSubPhase } from '@/store/gameStore';
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
          currentGameState.phase === GamePhase.ACTIVE_TURN &&
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
        currentGameState.phase === GamePhase.ACTIVE_TURN &&
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
    document.addEventListener('touchstart', handleResume, { passive: true, capture: true });
    document.addEventListener('touchend', handleResume, { passive: true, capture: true });
    document.addEventListener('mousedown', handleResume, { capture: true });
    document.addEventListener('click', handleResume, { capture: true });
    document.addEventListener('keydown', handleResume, { capture: true });
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('touchstart', handleResume, { capture: true });
      document.removeEventListener('touchend', handleResume, { capture: true });
      document.removeEventListener('mousedown', handleResume, { capture: true });
      document.removeEventListener('click', handleResume, { capture: true });
      document.removeEventListener('keydown', handleResume, { capture: true });
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  const renderPhase = () => {
    switch (gameState.phase) {
      case GamePhase.SETUP:
      case GamePhase.GAME_OVER:
        return <Setup />;
      case GamePhase.READY_CHECK:
        return <ReadyCheck />;
      case GamePhase.ACTIVE_TURN:
        switch (gameState.turn.subPhase) {
          case TurnSubPhase.COUNTDOWN:
            return <Countdown />;
          case TurnSubPhase.PLAYING:
            return <ActivePlay />;
          case TurnSubPhase.SECOND_CHANCE:
            return <SecondChanceRound />;
          default:
            return <Setup />;
        }
      case GamePhase.REVIEW:
        return <Review />;
      case GamePhase.SCOREBOARD:
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
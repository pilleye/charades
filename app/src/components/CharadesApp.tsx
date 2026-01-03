'use client';

import React, { useEffect, useRef } from 'react';
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
  const prevPhaseRef = useRef<GamePhase>(gameState.phase);
  const prevPausedRef = useRef<boolean>(false);

  // Get isPaused only when in ACTIVE_TURN phase
  const isPaused = gameState.phase === GamePhase.ACTIVE_TURN ? gameState.isPaused : false;

  // Manage audio context lifecycle based on game state
  useEffect(() => {
    const isGameActive = gameState.phase !== GamePhase.SETUP && gameState.phase !== GamePhase.GAME_OVER;
    const wasGameActive = prevPhaseRef.current !== GamePhase.SETUP && prevPhaseRef.current !== GamePhase.GAME_OVER;

    // Game just started (transitioned from SETUP to active phase)
    if (isGameActive && !wasGameActive) {
      console.log('[CharadesApp] Game started - initializing audio');
      soundEngine.init();
    }

    // Game just ended (transitioned to SETUP or GAME_OVER)
    if (!isGameActive && wasGameActive) {
      console.log('[CharadesApp] Game ended - destroying audio');
      soundEngine.destroy();
    }

    // Handle pause/unpause during active turn
    if (gameState.phase === GamePhase.ACTIVE_TURN) {
      if (isPaused && !prevPausedRef.current) {
        console.log('[CharadesApp] Game paused - destroying audio');
        soundEngine.destroy();
      } else if (!isPaused && prevPausedRef.current) {
        console.log('[CharadesApp] Game resumed - initializing audio');
        soundEngine.init();
      }
    }

    prevPhaseRef.current = gameState.phase;
    prevPausedRef.current = isPaused;
  }, [gameState.phase, isPaused]);

  // Handle visibility and focus events
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Only resume if game is active and not paused
        const { gameState: currentGameState } = useGameStore.getState();
        const isActive = currentGameState.phase !== GamePhase.SETUP &&
                        currentGameState.phase !== GamePhase.GAME_OVER;
        const currentIsPaused = currentGameState.phase === GamePhase.ACTIVE_TURN
          ? currentGameState.isPaused : false;
        if (isActive && !currentIsPaused) {
          soundEngine.resume();
        }
      } else {
        // Pause game when tab becomes hidden
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

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
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
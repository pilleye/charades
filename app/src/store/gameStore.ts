import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RootState } from './types';
import { createSettingsSlice } from './slices/settingsSlice';
import { createTeamSlice } from './slices/teamSlice';
import { createDeckSlice } from './slices/deckSlice';
import { createGameSlice } from './slices/gameSlice';
import { createTurnSlice } from './slices/turnSlice';

export const useGameStore = create<RootState>()(
  persist(
    (...a) => ({
      ...createSettingsSlice(...a),
      ...createTeamSlice(...a),
      ...createDeckSlice(...a),
      ...createGameSlice(...a),
      ...createTurnSlice(...a),
    }),
    {
      name: 'charades-game-storage',
      version: 2,
      migrate: (persistedState: any, version) => {
        if (version !== 2) {
          return {}; // Return empty object to reset to default state on version mismatch
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state && (
          state.gameState.phase === 'ACTIVE' || 
          state.gameState.phase === 'COUNTDOWN' ||
          state.gameState.phase === 'SECOND_CHANCE'
        )) {
          state.gameState = { ...state.gameState, isPaused: true };
        }
      },
      partialize: (state) => ({
        // Configuration
        teams: state.teams,
        roundDuration: state.roundDuration,
        skipsPerTurn: state.skipsPerTurn,
        pointsPerWord: state.pointsPerWord,
        totalRounds: state.totalRounds,
        selectedDeck: state.selectedDeck,
        customWords: state.customWords,
        secondChanceEnabled: state.secondChanceEnabled,
        secondChanceValue: state.secondChanceValue,
        hintsEnabled: state.hintsEnabled,

        // Game state
        gameState: state.gameState,
        currentTeamIndex: state.currentTeamIndex,
        currentRound: state.currentRound,
        availableWords: state.availableWords,
        usedWords: state.usedWords,
      }),
    }
  )
);

export type { Team, WordResult } from './types';

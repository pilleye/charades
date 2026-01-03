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
      onRehydrateStorage: () => (state) => {
        if (state && (state.phase === 'ACTIVE' || state.phase === 'COUNTDOWN')) {
          state.isPaused = true;
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
        phase: state.phase,
        currentTeamIndex: state.currentTeamIndex,
        currentRound: state.currentRound,
        isGameOver: state.isGameOver,
        availableWords: state.availableWords,
        usedWords: state.usedWords,
        
        // Encapsulated Turn State
        turn: state.turn,
      }),
    }
  )
);

export type { Team, WordResult, GamePhase } from './types';

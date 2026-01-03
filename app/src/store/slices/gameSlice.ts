import { GamePhase } from '../types';
import type { GameSliceCreator, GameSlice } from '../types';
import { makeScore } from '../types/branded';
import { clampTeamIndex } from '../utils/teamAccess';

export const createGameSlice: GameSliceCreator<GameSlice> = (set, get) => ({
  gameState: { phase: GamePhase.SETUP },
  currentRound: 1,

  togglePause: () => set((state) => {
    const { gameState } = state;
    if (gameState.phase === GamePhase.ACTIVE_TURN) {
      return {
        gameState: {
          ...gameState,
          isPaused: !gameState.isPaused
        }
      };
    }
    return {};
  }),

  startGame: () => {
    get().initializeDeck();
    set({
      gameState: {
        phase: GamePhase.READY_CHECK,
        currentTeamIndex: 0
      },
      currentRound: 1,
    });
  },

  nextTeam: () => {
    const { teams, gameState, currentRound, totalRounds } = get();

    // Guard against empty teams array
    if (teams.length === 0) {
      console.warn('nextTeam: No teams available');
      set({ gameState: { phase: GamePhase.GAME_OVER } });
      return;
    }

    // Fallback if currentTeamIndex isn't in current phase, and clamp to valid range
    const rawIndex = 'currentTeamIndex' in gameState ? gameState.currentTeamIndex : 0;
    const currentIndex = clampTeamIndex(rawIndex, teams.length);
    const nextIndex = (currentIndex + 1) % teams.length;

    let nextRound = currentRound;
    let isGameOver = false;

    if (nextIndex === 0) {
      nextRound = currentRound + 1;
      if (totalRounds !== 'unlimited' && nextRound > totalRounds) {
        isGameOver = true;
      }
    }

    if (isGameOver) {
      set({ gameState: { phase: GamePhase.GAME_OVER } });
      return;
    }

    set({
      gameState: {
        phase: GamePhase.READY_CHECK,
        currentTeamIndex: nextIndex
      },
      currentRound: nextRound,
    });
  },

  resetGame: () => {
    const { teams } = get();
    const resetTeams = teams.map((t) => ({ ...t, score: makeScore(0) }));
    get().initializeDeck();
    set({
      gameState: { phase: GamePhase.SETUP },
      teams: resetTeams,
      currentRound: 1,
    });
  },
});

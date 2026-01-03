import type { GameSliceCreator, GameSlice } from '../types';

export const createGameSlice: GameSliceCreator<GameSlice> = (set, get) => ({
  gameState: { phase: 'SETUP' },
  currentRound: 1,
  isGameOver: false,

  togglePause: () => set((state) => {
    const { gameState } = state;
    if (
      gameState.phase === 'COUNTDOWN' ||
      gameState.phase === 'ACTIVE' ||
      gameState.phase === 'SECOND_CHANCE'
    ) {
      return {
        gameState: { ...gameState, isPaused: !gameState.isPaused }
      };
    }
    return {};
  }),

  startGame: () => {
    get().initializeDeck();
    set({
      gameState: { phase: 'READY_CHECK' },
      currentTeamIndex: 0,
      currentRound: 1,
      isGameOver: false,
    });
  },

  nextTeam: () => {
    const { teams, currentTeamIndex, currentRound, totalRounds } = get();
    const nextIndex = (currentTeamIndex + 1) % teams.length;

    let nextRound = currentRound;
    let isGameOver = false;

    if (nextIndex === 0) {
      nextRound = currentRound + 1;
      if (totalRounds !== 'unlimited' && nextRound > totalRounds) {
        isGameOver = true;
      }
    }

    if (isGameOver) {
      set({ gameState: { phase: 'SETUP' }, isGameOver: true });
      return;
    }

    set({
      gameState: { phase: 'READY_CHECK' },
      currentTeamIndex: nextIndex,
      currentRound: nextRound,
    });
  },

  resetGame: () => {
    const { teams } = get();
    const resetTeams = teams.map((t) => ({ ...t, score: 0 }));
    get().initializeDeck();
    set({
      gameState: { phase: 'SETUP' },
      teams: resetTeams,
      currentRound: 1,
      turn: null, // Ensure strict cleanup
      isGameOver: false,
    });
  },
});
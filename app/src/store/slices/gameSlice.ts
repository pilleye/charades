import { GameSliceCreator, GameSlice } from '../types';

export const createGameSlice: GameSliceCreator<GameSlice> = (set, get) => ({
  phase: 'SETUP',
  currentRound: 1,
  isGameOver: false,
  isPaused: false,

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  startGame: () => {
    get().initializeDeck();
    set({
      phase: 'READY_CHECK',
      currentTeamIndex: 0,
      currentRound: 1,
      isGameOver: false,
      isPaused: false,
    });
  },

  nextTeam: () => {
    const { teams, currentTeamIndex, currentRound, totalRounds } = get();
    const nextIndex = (currentTeamIndex + 1) % teams.length;

    let nextRound = currentRound;
    let isGameOver = false;

    if (nextIndex === 0) {
      nextRound = currentRound + 1;
      if (totalRounds !== 'Infinite' && nextRound > totalRounds) {
        isGameOver = true;
      }
    }

    if (isGameOver) {
      set({ phase: 'SETUP', isGameOver: true });
      return;
    }

    set({
      phase: 'READY_CHECK',
      currentTeamIndex: nextIndex,
      currentRound: nextRound,
      isPaused: false,
    });
  },

  resetGame: () => {
    const { teams } = get();
    const resetTeams = teams.map((t) => ({ ...t, score: 0 }));
    get().initializeDeck();
    set({
      phase: 'SETUP',
      teams: resetTeams,
      currentRound: 1,
      currentTurnWords: [],
      isGameOver: false,
      isPaused: false,
    });
  },
});

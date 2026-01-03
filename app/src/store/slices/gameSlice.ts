import { GamePhase } from '../types';
import type { GameSliceCreator, GameSlice } from '../types';

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
    
    // Fallback if currentTeamIndex isn't in current phase
    const currentIndex = 'currentTeamIndex' in gameState ? gameState.currentTeamIndex : 0;
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
    const resetTeams = teams.map((t) => ({ ...t, score: 0 }));
    get().initializeDeck();
    set({
      gameState: { phase: GamePhase.SETUP },
      teams: resetTeams,
      currentRound: 1,
    });
  },
});

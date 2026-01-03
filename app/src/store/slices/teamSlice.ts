import type { GameSliceCreator, TeamSlice, GamePhase } from '../types';
import { makeScore, makeTeamName, addToScore } from '../types/branded';
import { clampTeamIndex, isValidTeamIndex } from '../utils/teamAccess';

export const createTeamSlice: GameSliceCreator<TeamSlice> = (set, get) => ({
  teams: [
    { id: 1, name: makeTeamName('Team 1')!, score: makeScore(0), colorIndex: 0 },
    { id: 2, name: makeTeamName('Team 2')!, score: makeScore(0), colorIndex: 1 },
  ],

  setTeams: (teams) => set((state) => {
    const { gameState } = state;

    // If current game state has a currentTeamIndex, validate it against new teams length
    if ('currentTeamIndex' in gameState && !isValidTeamIndex(gameState.currentTeamIndex, teams.length)) {
      const clampedIndex = clampTeamIndex(gameState.currentTeamIndex, teams.length);
      return {
        teams,
        gameState: { ...gameState, currentTeamIndex: clampedIndex }
      };
    }

    return { teams };
  }),

  updateTeamScore: (index, delta) => set((state) => {
    // Bounds check before accessing
    if (!isValidTeamIndex(index, state.teams.length)) {
      console.warn(`updateTeamScore: Invalid team index ${index} for teams length ${state.teams.length}`);
      return {};
    }

    const newTeams = [...state.teams];
    newTeams[index] = { ...newTeams[index], score: addToScore(newTeams[index].score, delta) };
    return { teams: newTeams };
  }),
});

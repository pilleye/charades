import type { GameSliceCreator, TeamSlice } from '../types';

export const createTeamSlice: GameSliceCreator<TeamSlice> = (set) => ({
  teams: [
    { id: 1, name: 'Team 1', score: 0, colorIndex: 0 },
    { id: 2, name: 'Team 2', score: 0, colorIndex: 1 },
  ],
  currentTeamIndex: 0,

  setTeams: (teams) => set({ teams }),

  updateTeamScore: (index, delta) => set((state) => {
    const newTeams = [...state.teams];
    newTeams[index] = { ...newTeams[index], score: newTeams[index].score + delta };
    return { teams: newTeams };
  }),
});

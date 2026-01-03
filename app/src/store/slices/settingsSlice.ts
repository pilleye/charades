import { GameSliceCreator, SettingsSlice } from '../types';

export const createSettingsSlice: GameSliceCreator<SettingsSlice> = (set) => ({
  roundDuration: 60,
  skipsPerTurn: 3,
  pointsPerWord: 1,
  totalRounds: 5,
  secondChanceEnabled: true,
  secondChanceValue: 0.5,
  hintsEnabled: true,

  setSettings: (settings) => set((state) => ({ ...state, ...settings })),
  
  updateDurationInGame: (duration) => set({ roundDuration: duration }),
  
  setHintsEnabled: (enabled) => set({ hintsEnabled: enabled }),
  
  updateTotalRounds: (rounds) => set({ totalRounds: rounds }),
  
  updateSkipsPerTurn: (skips) => set({ skipsPerTurn: skips }),
});

import type { StateCreator } from 'zustand';
import type { DeckItem } from '@/data/decks/types';

export type GamePhase =
  | 'SETUP'
  | 'READY_CHECK'
  | 'COUNTDOWN'
  | 'ACTIVE'
  | 'SECOND_CHANCE'
  | 'REVIEW'
  | 'SCOREBOARD';

export interface Team {
  id: number;
  name: string;
  score: number;
  colorIndex: number;
}

export interface WordResult {
  word: string;
  status: 'GOT_IT' | 'SKIPPED' | 'SECOND_CHANCE' | 'UNPLAYED';
  originalItem?: DeckItem;
}

export interface SettingsSlice {
  roundDuration: number;
  skipsPerTurn: number | 'Infinite';
  pointsPerWord: number;
  totalRounds: number | 'Infinite';
  secondChanceEnabled: boolean;
  secondChanceValue: number;
  hintsEnabled: boolean;
  setSettings: (settings: Partial<Omit<SettingsSlice, 'setSettings' | 'updateDurationInGame'>>) => void;
  updateDurationInGame: (duration: number) => void;
  setHintsEnabled: (enabled: boolean) => void;
  updateTotalRounds: (rounds: number | 'Infinite') => void;
  updateSkipsPerTurn: (skips: number | 'Infinite') => void;
}

export interface TeamSlice {
  teams: Team[];
  currentTeamIndex: number;
  setTeams: (teams: Team[]) => void;
  updateTeamScore: (index: number, delta: number) => void;
}

export interface DeckSlice {
  selectedDeck: string;
  customWords: string[];
  availableWords: DeckItem[];
  usedWords: DeckItem[];
  // currentActiveWord removed - belongs to Turn
  drawNextCard: () => DeckItem; // Returns the card, updates internal deck state
  setDeckConfig: (deckName: string, customWords: string[]) => void;
  addCustomWord: (word: string) => void;
  removeCustomWord: (word: string) => void;
  initializeDeck: () => void;
}

export interface ActiveTurn {
  timeRemaining: number;
  skipsRemaining: number | 'Infinite';
  activeWord: DeckItem | null;
  wordsPlayed: WordResult[];
  secondChanceQueue: string[];
  secondChanceIndex: number;
}

export interface GameSlice {
  phase: GamePhase;
  currentRound: number;
  isGameOver: boolean;
  isPaused: boolean;
  togglePause: () => void;
  startGame: () => void;
  nextTeam: () => void;
  resetGame: () => void;
}

export interface TurnSlice {
  turn: ActiveTurn | null; // Encapsulated Turn State
  startTurn: () => void;
  beginActiveRound: () => void;
  endTurn: () => void;
  markWord: (status: 'GOT_IT' | 'SKIPPED') => void;
  updateReviewWord: (index: number, status: 'GOT_IT' | 'SKIPPED' | 'SECOND_CHANCE') => void;
  applyReviewScores: () => void;
  resolveSecondChance: (success: boolean) => void;
}

export type RootState = SettingsSlice & TeamSlice & DeckSlice & GameSlice & TurnSlice;

export type GameSliceCreator<T> = StateCreator<RootState, [], [], T>;
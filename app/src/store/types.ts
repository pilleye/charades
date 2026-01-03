import type { StateCreator } from 'zustand';
import type { DeckItem } from '@/data/decks/types';

export type GameLimit = number | 'unlimited';

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

export interface TurnData {
  timeRemaining: number;
  skipsRemaining: GameLimit;
  activeWord: DeckItem | null;
  wordsPlayed: WordResult[];
  secondChanceQueue: string[];
  secondChanceIndex: number;
}

export type GameState =
  | { phase: 'SETUP'; isGameOver: boolean }
  | { phase: 'READY_CHECK' }
  | { phase: 'COUNTDOWN'; turn: TurnData; isPaused: boolean }
  | { phase: 'ACTIVE'; turn: TurnData; isPaused: boolean }
  | { phase: 'SECOND_CHANCE'; turn: TurnData; isPaused: boolean }
  | { phase: 'REVIEW'; turn: TurnData }
  | { phase: 'SCOREBOARD' };

export interface SettingsSlice {
  roundDuration: number;
  skipsPerTurn: GameLimit;
  pointsPerWord: number;
  totalRounds: GameLimit;
  secondChanceEnabled: boolean;
  secondChanceValue: number;
  hintsEnabled: boolean;
  setSettings: (settings: Partial<Omit<SettingsSlice, 'setSettings' | 'updateDurationInGame'>>) => void;
  updateDurationInGame: (duration: number) => void;
  setHintsEnabled: (enabled: boolean) => void;
  updateTotalRounds: (rounds: GameLimit) => void;
  updateSkipsPerTurn: (skips: GameLimit) => void;
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
  drawNextCard: () => DeckItem | null;
  setDeckConfig: (deckName: string, customWords: string[]) => void;
  addCustomWord: (word: string) => void;
  removeCustomWord: (word: string) => void;
  initializeDeck: () => void;
}

export interface GameSlice {
  gameState: GameState;
  currentRound: number;
  togglePause: () => void;
  startGame: () => void;
  nextTeam: () => void;
  resetGame: () => void;
}

export interface TurnSlice {
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

import type { StateCreator } from 'zustand';
import type { DeckItem } from '@/data/decks/types';
import type { Score, TeamName } from './types/branded';

export type GameLimit = number | 'unlimited';

export const GamePhase = {
  SETUP: 'SETUP',
  READY_CHECK: 'READY_CHECK',
  ACTIVE_TURN: 'ACTIVE_TURN',
  REVIEW: 'REVIEW',
  SCOREBOARD: 'SCOREBOARD',
  GAME_OVER: 'GAME_OVER',
} as const;
export type GamePhase = (typeof GamePhase)[keyof typeof GamePhase];

export const TurnSubPhase = {
  COUNTDOWN: 'COUNTDOWN',
  PLAYING: 'PLAYING',
  SECOND_CHANCE: 'SECOND_CHANCE',
} as const;
export type TurnSubPhase = (typeof TurnSubPhase)[keyof typeof TurnSubPhase];

export const WordStatus = {
  GOT_IT: 'GOT_IT',
  SKIPPED: 'SKIPPED',
  SECOND_CHANCE: 'SECOND_CHANCE',
  RECOVERED: 'RECOVERED',
} as const;
export type WordStatus = (typeof WordStatus)[keyof typeof WordStatus];

export interface Team {
  id: number;
  name: TeamName;
  score: Score;
  colorIndex: number;
}

export interface WordResult {
  word: string;
  status: WordStatus;
  originalItem?: DeckItem;
}

export type ActiveTurnState =
  | {
      subPhase: typeof TurnSubPhase.COUNTDOWN;
      timeRemaining: number;
      skipsRemaining: GameLimit;
      wordsPlayed: WordResult[];
    }
  | {
      subPhase: typeof TurnSubPhase.PLAYING;
      timeRemaining: number;
      skipsRemaining: GameLimit;
      activeWord: DeckItem;
      wordsPlayed: WordResult[];
    }
  | {
      subPhase: typeof TurnSubPhase.SECOND_CHANCE;
      secondChanceQueue: DeckItem[];
      secondChanceIndex: number;
      wordsPlayed: WordResult[];
    };

export type GameState =
  | { phase: typeof GamePhase.SETUP }
  | { 
      phase: typeof GamePhase.READY_CHECK; 
      currentTeamIndex: number; 
    }
  | { 
      phase: typeof GamePhase.ACTIVE_TURN; 
      currentTeamIndex: number;
      isPaused: boolean;
      turn: ActiveTurnState;
    }
  | { 
      phase: typeof GamePhase.REVIEW; 
      currentTeamIndex: number;
      wordsPlayed: WordResult[];
    }
  | { 
      phase: typeof GamePhase.SCOREBOARD;
      currentTeamIndex: number;
    }
  | { phase: typeof GamePhase.GAME_OVER };

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
  updateTimer: (time: number) => void;
  markWord: (status: typeof WordStatus.GOT_IT | typeof WordStatus.SKIPPED) => void;
  updateReviewWord: (index: number, status: WordStatus) => void;
  applyReviewScores: () => void;
  resolveSecondChance: (success: boolean) => void;
}

export type RootState = SettingsSlice & TeamSlice & DeckSlice & GameSlice & TurnSlice;

export type GameSliceCreator<T> = StateCreator<RootState, [], [], T>;

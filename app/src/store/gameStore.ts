import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_DECKS,
  normalizeForDuplicateCheck,
  FREE_TIER_CARD_LIMIT,
} from '@/data/decks';
import type { DeckItem } from '@/data/decks/types';
import { useSubscriptionStore } from './subscriptionStore';

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

interface GameState {
  // Config
  teams: Team[];
  roundDuration: number;
  skipsPerTurn: number | 'Infinite';
  pointsPerWord: number;
  totalRounds: number | 'Infinite';

  // Deck Config
  selectedDeck: string;
  customWords: string[];

  // Second Chance Config
  secondChanceEnabled: boolean;
  secondChanceValue: number; // 0, 0.5, or 1

  // Hints Config
  hintsEnabled: boolean;

  // Game Status
  phase: GamePhase;
  currentTeamIndex: number;
  currentRound: number;
  isGameOver: boolean;
  isPaused: boolean;

  // Deck Logic
  availableWords: DeckItem[];
  usedWords: DeckItem[];

  // Turn State
  currentTurnWords: WordResult[];
  currentWordIndex: number;
  currentActiveWord: DeckItem | null;
  turnTimeRemaining: number;
  turnSkipsRemaining: number | 'Infinite';

  // Second Chance Logic
  secondChanceQueue: string[];
  secondChanceIndex: number;

  // Actions
  setTeams: (teams: Team[]) => void;
  setSettings: (
    duration: number,
    skips: number | 'Infinite',
    points: number,
    rounds: number | 'Infinite',
    secondChanceEnabled: boolean,
    secondChanceValue: number,
    hintsEnabled: boolean
  ) => void;
  setDeckConfig: (deckName: string, customWords: string[]) => void;
  addCustomWord: (word: string) => void;
  removeCustomWord: (word: string) => void;

  startGame: () => void;
  nextTeam: () => void;
  startTurn: () => void;
  endTurn: () => void;
  drawWord: () => void;
  markWord: (status: 'GOT_IT' | 'SKIPPED') => void;
  updateReviewWord: (
    index: number,
    status: 'GOT_IT' | 'SKIPPED' | 'SECOND_CHANCE'
  ) => void;
  resolveSecondChance: (success: boolean) => void;
  applyReviewScores: () => void;
  resetGame: () => void;
  togglePause: () => void;
  updateDurationInGame: (newDuration: number) => void;
  setHintsEnabled: (enabled: boolean) => void;
  updateTotalRounds: (rounds: number | 'Infinite') => void;
  updateSkipsPerTurn: (skips: number | 'Infinite') => void;
}

// Fisher-Yates Shuffle
const shuffleArray = (array: DeckItem[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const getEffectiveDeck = (selectedDeck: string, isPremium: boolean): DeckItem[] => {
  const deckKey = DEFAULT_DECKS[selectedDeck] ? selectedDeck : 'Default';
  let deckWords = DEFAULT_DECKS[deckKey] || [];

  if (!isPremium) {
    if (deckKey === 'Default') {
      deckWords = deckWords.slice(0, FREE_TIER_CARD_LIMIT);
    } else {
      // Paid decks are not accessible on free tier
      deckWords = [];
    }
  }
  return deckWords;
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      teams: [
        { id: 1, name: 'Team 1', score: 0, colorIndex: 0 },
        { id: 2, name: 'Team 2', score: 0, colorIndex: 1 },
      ],
      roundDuration: 60,
      skipsPerTurn: 'Infinite',
      pointsPerWord: 1,
      totalRounds: 5,
      secondChanceEnabled: true,
      secondChanceValue: 0.5,
      hintsEnabled: true,

      selectedDeck: 'Default',
      customWords: [],

      phase: 'SETUP',
      currentTeamIndex: 0,
      currentRound: 1,
      isGameOver: false,
      isPaused: false,

      availableWords: [], // Calculated at start
      usedWords: [],

      currentTurnWords: [],
      currentWordIndex: 0,
      currentActiveWord: null,
      turnTimeRemaining: 60,
      turnSkipsRemaining: 'Infinite',

      secondChanceQueue: [],
      secondChanceIndex: 0,

      setTeams: (teams) => set({ teams }),
      setSettings: (
        roundDuration,
        skipsPerTurn,
        pointsPerWord,
        totalRounds,
        secondChanceEnabled,
        secondChanceValue,
        hintsEnabled
      ) =>
        set({
          roundDuration,
          skipsPerTurn,
          pointsPerWord,
          totalRounds,
          secondChanceEnabled,
          secondChanceValue,
          hintsEnabled,
        }),

      setDeckConfig: (selectedDeck, customWords) =>
        set({ selectedDeck, customWords }),

      addCustomWord: (word) =>
        set((state) => {
          const trimmed = word.trim();
          if (!trimmed) return {};

          // Check for smart duplicates (normalized comparison)
          const normalizedNew = normalizeForDuplicateCheck(trimmed);

          // Check against existing custom words
          const isDuplicateCustom = state.customWords.some(
            (existing) => normalizeForDuplicateCheck(existing) === normalizedNew
          );

          // Check against selected deck words
          const deckWords = DEFAULT_DECKS[state.selectedDeck] || [];
          const isDuplicateDeck = deckWords.some(
            (deckItem) =>
              normalizeForDuplicateCheck(deckItem.word) === normalizedNew
          );

          if (isDuplicateCustom || isDuplicateDeck) return {};
          return { customWords: [...state.customWords, trimmed] };
        }),

      removeCustomWord: (word) =>
        set((state) => ({
          customWords: state.customWords.filter((w) => w !== word),
        })),

      startGame: () => {
        const { selectedDeck, customWords } = get();
        const isPremium = useSubscriptionStore.getState().status === 'active';

        const deckWords = getEffectiveDeck(selectedDeck, isPremium);

        // Only include custom words for premium users
        const customDeckItems: DeckItem[] = isPremium
          ? customWords.map((w) => ({ word: w }))
          : [];

        const fullDeck = [...deckWords, ...customDeckItems];

        set({
          phase: 'READY_CHECK',
          currentTeamIndex: 0,
          currentRound: 1,
          isGameOver: false,
          isPaused: false,
          availableWords: shuffleArray(fullDeck),
          usedWords: [],
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

      startTurn: () => {
        const { roundDuration, skipsPerTurn } = get();
        set({
          phase: 'COUNTDOWN',
          turnTimeRemaining: roundDuration,
          turnSkipsRemaining: skipsPerTurn,
          currentTurnWords: [],
          currentActiveWord: null,
          isPaused: false,
        });
      },

      drawWord: () => {
        const { availableWords, usedWords, selectedDeck, customWords } = get();
        const isPremium = useSubscriptionStore.getState().status === 'active';
        let deck = [...availableWords];

        if (deck.length === 0) {
          // Reshuffle logic
          if (usedWords.length === 0) {
            const baseDeck = getEffectiveDeck(selectedDeck, isPremium);

            const customDeckItems: DeckItem[] = isPremium
              ? customWords.map((w) => ({ word: w }))
              : [];
            deck = shuffleArray([...baseDeck, ...customDeckItems]);
          } else {
            deck = shuffleArray(usedWords);
            set({ usedWords: [] });
          }
        }

        const nextWord = deck.pop();
        set({
          availableWords: deck,
          currentActiveWord: nextWord || { word: 'No Words Left!' },
        });
      },

      markWord: (status) => {
        const { currentActiveWord, currentTurnWords, turnSkipsRemaining } =
          get();

        if (!currentActiveWord) return;

        const newHistory: WordResult[] = [
          ...currentTurnWords,
          {
            word: currentActiveWord.word,
            status,
            originalItem: currentActiveWord,
          },
        ];

        let newSkips = turnSkipsRemaining;
        if (status === 'SKIPPED' && turnSkipsRemaining !== 'Infinite') {
          newSkips = Math.max(0, turnSkipsRemaining - 1);
        }

        set({
          currentTurnWords: newHistory,
          turnSkipsRemaining: newSkips,
        });

        get().drawWord();
      },

      endTurn: () => {
        const { currentActiveWord, currentTurnWords, secondChanceEnabled } =
          get();
        const newHistory = [...currentTurnWords];

        // 1. Capture the pending word (the one on screen when timer died)
        // Add it as SKIPPED initially so it qualifies for second chance
        if (currentActiveWord) {
          newHistory.push({
            word: currentActiveWord.word,
            status: 'SKIPPED',
            originalItem: currentActiveWord,
          });
        }

        // 2. Identify candidates for Second Chance
        // Logic: Any word marked as SKIPPED during the turn is eligible
        const candidates = newHistory
          .filter((w) => w.status === 'SKIPPED')
          .map((w) => w.word);

        // 3. Determine Next Phase
        // If Second Chance is enabled AND there are words to play
        if (secondChanceEnabled && candidates.length > 0) {
          set({
            phase: 'SECOND_CHANCE',
            currentActiveWord: null,
            isPaused: false,
            currentTurnWords: newHistory,
            secondChanceQueue: candidates,
            secondChanceIndex: 0,
          });
        } else {
          // Go straight to Review
          set({
            phase: 'REVIEW',
            currentActiveWord: null,
            isPaused: false,
            currentTurnWords: newHistory,
          });
        }
      },

      resolveSecondChance: (success) => {
        const { secondChanceQueue, secondChanceIndex, currentTurnWords } =
          get();
        const currentWord = secondChanceQueue[secondChanceIndex];

        // Update the master list status
        if (success) {
          const newHistory = currentTurnWords.map((w) =>
            w.word === currentWord
              ? { ...w, status: 'SECOND_CHANCE' as const }
              : w
          );
          set({ currentTurnWords: newHistory });
        }

        // Move to next
        const nextIndex = secondChanceIndex + 1;
        if (nextIndex >= secondChanceQueue.length) {
          // Done with queue
          set({ phase: 'REVIEW' });
        } else {
          set({ secondChanceIndex: nextIndex });
        }
      },

      updateReviewWord: (index, status) => {
        const { currentTurnWords } = get();
        const newWords = [...currentTurnWords];
        if (newWords[index]) {
          newWords[index].status = status;
        }
        set({ currentTurnWords: newWords });
      },

      applyReviewScores: () => {
        const {
          currentTurnWords,
          teams,
          currentTeamIndex,
          pointsPerWord,
          usedWords,
          availableWords,
          secondChanceValue,
        } = get();

        let points = 0;
        const wordsToReturnToDeck: DeckItem[] = [];
        const wordsUsed: DeckItem[] = [];

        currentTurnWords.forEach((w) => {
          const item = w.originalItem || { word: w.word };

          if (w.status === 'GOT_IT') {
            points += pointsPerWord;
            wordsUsed.push(item);
          } else if (w.status === 'SECOND_CHANCE') {
            points += pointsPerWord * secondChanceValue;
            wordsUsed.push(item);
          } else {
            // Skipped/Unplayed words go back to the deck
            wordsToReturnToDeck.push(item);
          }
        });

        const newTeams = [...teams];
        newTeams[currentTeamIndex].score += points;

        const newAvailable = [...availableWords, ...wordsToReturnToDeck];
        const newUsed = [...usedWords, ...wordsUsed];

        set({
          teams: newTeams,
          availableWords: shuffleArray(newAvailable),
          usedWords: newUsed,
          phase: 'SCOREBOARD',
        });
      },

      resetGame: () => {
        const { selectedDeck, customWords, teams } = get();
        const isPremium = useSubscriptionStore.getState().status === 'active';

        const baseDeck = getEffectiveDeck(selectedDeck, isPremium);

        const customDeckItems: DeckItem[] = isPremium
          ? customWords.map((w) => ({ word: w }))
          : [];

        const resetTeams = teams.map((t) => ({ ...t, score: 0 }));

        set({
          phase: 'SETUP',
          teams: resetTeams,
          currentRound: 1,
          currentTurnWords: [],
          usedWords: [],
          availableWords: shuffleArray([...baseDeck, ...customDeckItems]),
          isGameOver: false,
          isPaused: false,
        });
      },

      togglePause: () => {
        set((state) => ({ isPaused: !state.isPaused }));
      },

      updateDurationInGame: (newDuration: number) => {
        set((state) => {
          // Prevent invalid duration (e.g. negative)
          const validDuration = Math.max(10, newDuration);

          const diff = validDuration - state.roundDuration;
          let newTime = state.turnTimeRemaining;

          if (state.phase === 'ACTIVE') {
            newTime = Math.max(1, state.turnTimeRemaining + diff);
          }

          return {
            roundDuration: validDuration,
            turnTimeRemaining: newTime,
          };
        });
      },

      setHintsEnabled: (enabled) => set({ hintsEnabled: enabled }),

      updateTotalRounds: (rounds) => {
        set((state) => {
          // Prevent setting rounds lower than current round
          if (typeof rounds === 'number' && rounds < state.currentRound) {
            return {};
          }
          return { totalRounds: rounds };
        });
      },

      updateSkipsPerTurn: (skips) => {
        set((state) => {
          let newTurnSkips = state.turnSkipsRemaining;

          if (skips === 'Infinite') {
            newTurnSkips = 'Infinite';
          } else {
            // If current remaining is infinite, cap it at the new max
            if (state.turnSkipsRemaining === 'Infinite') {
              newTurnSkips = skips;
            } else {
              // If it's a number, just clamp it to the new max
              // We don't want to give free skips if they already used some,
              // but we also don't want them to have more than the new limit.
              // Logic: min(currentRemaining, newMax)
              newTurnSkips = Math.min(state.turnSkipsRemaining, skips);
            }
          }

          return {
            skipsPerTurn: skips,
            turnSkipsRemaining: newTurnSkips,
          };
        });
      },
    }),
    {
      name: 'charades-game-storage',
      onRehydrateStorage: () => (state) => {
        // Auto-pause if we're in an active phase after page refresh
        if (
          state &&
          (state.phase === 'ACTIVE' || state.phase === 'COUNTDOWN')
        ) {
          state.isPaused = true;
        }
      },
      partialize: (state) => ({
        // Configuration
        teams: state.teams,
        roundDuration: state.roundDuration,
        skipsPerTurn: state.skipsPerTurn,
        pointsPerWord: state.pointsPerWord,
        totalRounds: state.totalRounds,
        selectedDeck: state.selectedDeck,
        customWords: state.customWords,
        secondChanceEnabled: state.secondChanceEnabled,
        secondChanceValue: state.secondChanceValue,
        hintsEnabled: state.hintsEnabled,

        // Game state - persist everything needed to resume
        phase: state.phase,
        currentTeamIndex: state.currentTeamIndex,
        currentRound: state.currentRound,
        isGameOver: state.isGameOver,
        availableWords: state.availableWords,
        usedWords: state.usedWords,
        currentTurnWords: state.currentTurnWords,
        currentWordIndex: state.currentWordIndex,
        currentActiveWord: state.currentActiveWord,
        turnTimeRemaining: state.turnTimeRemaining,
        turnSkipsRemaining: state.turnSkipsRemaining,
        secondChanceQueue: state.secondChanceQueue,
        secondChanceIndex: state.secondChanceIndex,
        // Don't persist isPaused - auto-pause on refresh to prevent time loss
      }),
    }
  )
);

import type { DeckItem } from '@/data/decks/types';
import type { GameSliceCreator, TurnSlice, WordResult, ActiveTurn } from '../types';

export const createTurnSlice: GameSliceCreator<TurnSlice> = (set, get) => ({
  turn: null,

  startTurn: () => {
    const { roundDuration, skipsPerTurn } = get();
    set({
      gameState: { phase: 'COUNTDOWN', isPaused: false },
      turn: {
        timeRemaining: roundDuration,
        skipsRemaining: skipsPerTurn,
        activeWord: null,
        wordsPlayed: [],
        secondChanceQueue: [],
        secondChanceIndex: 0,
      }
    });
  },

  beginActiveRound: () => {
    const nextCard = get().drawNextCard();
    set((state) => ({
      gameState: { phase: 'ACTIVE', isPaused: false },
      turn: state.turn ? { ...state.turn, activeWord: nextCard } : null
    }));
  },

  endTurn: () => {
    const { turn, secondChanceEnabled } = get();
    if (!turn) return;

    const { activeWord, wordsPlayed } = turn;
    const newHistory = [...wordsPlayed];

    if (activeWord) {
      newHistory.push({
        word: activeWord.word,
        status: 'SKIPPED',
        originalItem: activeWord,
      });
    }

    const candidates = newHistory
      .filter((w) => w.status === 'SKIPPED')
      .map((w) => w.word);

    if (secondChanceEnabled && candidates.length > 0) {
      set({
        gameState: { phase: 'SECOND_CHANCE', isPaused: false },
        turn: {
          ...turn,
          activeWord: null,
          wordsPlayed: newHistory,
          secondChanceQueue: candidates,
          secondChanceIndex: 0,
        }
      });
    } else {
      set({
        gameState: { phase: 'REVIEW' },
        turn: {
          ...turn,
          activeWord: null,
          wordsPlayed: newHistory,
        }
      });
    }
  },

  markWord: (status) => {
    const { turn } = get();
    if (!turn || !turn.activeWord) {
      const nextCard = get().drawNextCard();
      if (turn) {
          set({
              turn: {
                  ...turn,
                  activeWord: nextCard
              }
          });
      }
      return;
    }

    const { activeWord, wordsPlayed, skipsRemaining } = turn;

    const newHistory: WordResult[] = [
      ...wordsPlayed,
      {
        word: activeWord.word,
        status,
        originalItem: activeWord,
      },
    ];

    let newSkips = skipsRemaining;
    if (status === 'SKIPPED' && skipsRemaining !== 'unlimited') {
      newSkips = Math.max(0, skipsRemaining - 1);
    }

    const nextCard = get().drawNextCard();

    set({
      turn: {
        ...turn,
        wordsPlayed: newHistory,
        skipsRemaining: newSkips,
        activeWord: nextCard,
      }
    });
  },

  resolveSecondChance: (success) => {
    const { turn } = get();
    if (!turn) return;

    const { secondChanceQueue, secondChanceIndex, wordsPlayed } = turn;
    const currentWord = secondChanceQueue[secondChanceIndex];
    let newHistory = wordsPlayed;

    if (success) {
      newHistory = wordsPlayed.map((w) =>
        w.word === currentWord
          ? { ...w, status: 'SECOND_CHANCE' as const }
          : w
      );
    }

    const nextIndex = secondChanceIndex + 1;
    const updates: Partial<ActiveTurn> = {
      wordsPlayed: newHistory,
      secondChanceIndex: nextIndex
    };

    if (nextIndex >= secondChanceQueue.length) {
      set({ 
        gameState: { phase: 'REVIEW' },
        turn: { ...turn, ...updates }
      });
    } else {
      set({ 
        turn: { ...turn, ...updates }
      });
    }
  },

  updateReviewWord: (index, status) => {
    const { turn } = get();
    if (!turn) return;

    const newWords = [...turn.wordsPlayed];
    if (newWords[index]) {
      newWords[index].status = status;
    }
    
    set({
      turn: {
        ...turn,
        wordsPlayed: newWords
      }
    });
  },

  applyReviewScores: () => {
    const {
      turn,
      teams,
      currentTeamIndex,
      pointsPerWord,
      usedWords,
      availableWords,
      secondChanceValue,
    } = get();

    if (!turn) return;

    let points = 0;
    const wordsToReturnToDeck: DeckItem[] = [];
    const wordsUsed: DeckItem[] = [];

    turn.wordsPlayed.forEach((w) => {
      const item = w.originalItem || { word: w.word };
      if (w.status === 'GOT_IT') {
        points += pointsPerWord;
        wordsUsed.push(item);
      } else if (w.status === 'SECOND_CHANCE') {
        points += pointsPerWord * secondChanceValue;
        wordsUsed.push(item);
      } else {
        wordsToReturnToDeck.push(item);
      }
    });

    const newTeams = [...teams];
    newTeams[currentTeamIndex].score += points;
    
    set({
      teams: newTeams,
      availableWords: [...availableWords, ...wordsToReturnToDeck],
      usedWords: [...usedWords, ...wordsUsed],
      gameState: { phase: 'SCOREBOARD' },
      turn: null,
    });
  },
});
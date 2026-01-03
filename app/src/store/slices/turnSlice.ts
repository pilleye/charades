import type { DeckItem } from '@/data/decks/types';
import type { GameSliceCreator, TurnSlice, WordResult, ActiveTurn } from '../types';

export const createTurnSlice: GameSliceCreator<TurnSlice> = (set, get) => ({
  turn: null,

  startTurn: () => {
    const { roundDuration, skipsPerTurn } = get();
    set({
      phase: 'COUNTDOWN',
      isPaused: false,
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
      phase: 'ACTIVE',
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

    // Update phase and ensure the turn state reflects the end of active play
    // We keep the turn object alive because Review/SecondChance needs the history
    if (secondChanceEnabled && candidates.length > 0) {
      set({
        phase: 'SECOND_CHANCE',
        isPaused: false,
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
        phase: 'REVIEW',
        isPaused: false,
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
      // If we don't have a word, try to draw one (first draw of the game)
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
    if (status === 'SKIPPED' && skipsRemaining !== 'Infinite') {
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
        phase: 'REVIEW',
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

    // Importing shuffleArray here would be circular if we aren't careful, 
    // but deckSlice exports it. However, we have availableWords in state.
    // We should use the deckSlice logic? 
    // Actually, simple array spread is fine, deckSlice handles the shuffle on draw usually.
    // But we want to return words to the deck randomly? 
    // For now, just append. The deck logic shuffles when the deck is empty.
    
    set({
      teams: newTeams,
      availableWords: [...availableWords, ...wordsToReturnToDeck],
      usedWords: [...usedWords, ...wordsUsed],
      phase: 'SCOREBOARD',
      turn: null, // Clean up the turn object
    });
  },
});
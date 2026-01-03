import type { DeckItem } from '@/data/decks/types';
import type { GameSliceCreator, TurnSlice, WordResult, TurnData } from '../types';

export const createTurnSlice: GameSliceCreator<TurnSlice> = (set, get) => ({
  startTurn: () => {
    const { roundDuration, skipsPerTurn } = get();
    set({
      gameState: {
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
      }
    });
  },

  beginActiveRound: () => {
    const { gameState } = get();
    if (gameState.phase !== 'COUNTDOWN') return;

    const nextCard = get().drawNextCard();
    set({
      gameState: {
        ...gameState,
        phase: 'ACTIVE',
        turn: {
          ...gameState.turn,
          activeWord: nextCard
        }
      }
    });
  },

  endTurn: () => {
    const { gameState, secondChanceEnabled } = get();
    if (gameState.phase !== 'ACTIVE' && gameState.phase !== 'COUNTDOWN') return;

    const { turn } = gameState;
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
        gameState: {
          phase: 'SECOND_CHANCE',
          isPaused: false,
          turn: {
            ...turn,
            activeWord: null,
            wordsPlayed: newHistory,
            secondChanceQueue: candidates,
            secondChanceIndex: 0,
          }
        }
      });
    } else {
      set({
        gameState: {
          phase: 'REVIEW',
          turn: {
            ...turn,
            activeWord: null,
            wordsPlayed: newHistory,
          }
        }
      });
    }
  },

  markWord: (status) => {
    const { gameState } = get();
    if (gameState.phase !== 'ACTIVE') return;

    const { turn } = gameState;
    const { activeWord, wordsPlayed, skipsRemaining } = turn;

    let nextHistory = wordsPlayed;
    if (activeWord) {
      nextHistory = [
        ...wordsPlayed,
        {
          word: activeWord.word,
          status,
          originalItem: activeWord,
        },
      ];
    }

    let newSkips = skipsRemaining;
    if (status === 'SKIPPED' && skipsRemaining !== 'unlimited') {
      newSkips = Math.max(0, skipsRemaining - 1);
    }

    const nextCard = get().drawNextCard();

    set({
      gameState: {
        ...gameState,
        turn: {
          ...turn,
          wordsPlayed: nextHistory,
          skipsRemaining: newSkips,
          activeWord: nextCard,
        }
      }
    });
  },

  resolveSecondChance: (success) => {
    const { gameState } = get();
    if (gameState.phase !== 'SECOND_CHANCE') return;

    const { turn } = gameState;
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
    const updates: Partial<TurnData> = {
      wordsPlayed: newHistory,
      secondChanceIndex: nextIndex
    };

    if (nextIndex >= secondChanceQueue.length) {
      set({
        gameState: {
          phase: 'REVIEW',
          turn: { ...turn, ...updates }
        }
      });
    } else {
      set({
        gameState: {
          ...gameState,
          turn: { ...turn, ...updates }
        }
      });
    }
  },

  updateReviewWord: (index, status) => {
    const { gameState } = get();
    if (gameState.phase !== 'REVIEW') return;

    const { turn } = gameState;
    const newWords = [...turn.wordsPlayed];
    if (newWords[index]) {
      newWords[index].status = status;
    }
    
    set({
      gameState: {
        ...gameState,
        turn: {
          ...turn,
          wordsPlayed: newWords
        }
      }
    });
  },

  applyReviewScores: () => {
    const {
      gameState,
      teams,
      currentTeamIndex,
      pointsPerWord,
      usedWords,
      availableWords,
      secondChanceValue,
    } = get();

    if (gameState.phase !== 'REVIEW') return;

    const { turn } = gameState;
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
    });
  },
});

import { GamePhase, TurnSubPhase, WordStatus } from '../types';
import type { DeckItem } from '@/data/decks/types';
import type { GameSliceCreator, TurnSlice, TurnData } from '../types';

export const createTurnSlice: GameSliceCreator<TurnSlice> = (set, get) => ({
  startTurn: () => {
    const { roundDuration, skipsPerTurn } = get();
    set({
      gameState: {
        phase: GamePhase.ACTIVE_TURN,
        subPhase: TurnSubPhase.COUNTDOWN,
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
    if (gameState.phase !== GamePhase.ACTIVE_TURN || gameState.subPhase !== TurnSubPhase.COUNTDOWN) return;

    const nextCard = get().drawNextCard();
    set({
      gameState: {
        ...gameState,
        subPhase: TurnSubPhase.PLAYING,
        turn: {
          ...gameState.turn,
          activeWord: nextCard
        }
      }
    });
  },

  updateTimer: (time) => {
    const { gameState } = get();
    if (gameState.phase !== GamePhase.ACTIVE_TURN) return;

    set({
      gameState: {
        ...gameState,
        turn: { ...gameState.turn, timeRemaining: time }
      }
    });
  },

  endTurn: () => {
    const { gameState, secondChanceEnabled } = get();
    if (gameState.phase !== GamePhase.ACTIVE_TURN) return;

    const { turn } = gameState;
    const { activeWord, wordsPlayed } = turn;
    const newHistory = [...wordsPlayed];

    if (activeWord) {
      newHistory.push({
        word: activeWord.word,
        status: WordStatus.SECOND_CHANCE,
        originalItem: activeWord,
      });
    }

    const candidates = newHistory
      .filter((w) => w.status === WordStatus.SECOND_CHANCE)
      .map((w) => w.word);

    if (secondChanceEnabled && candidates.length > 0) {
      set({
        gameState: {
          ...gameState,
          subPhase: TurnSubPhase.SECOND_CHANCE,
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
      // If no second chance, convert SECOND_CHANCE statuses to SKIPPED
      const finalHistory = newHistory.map(w => 
        w.status === WordStatus.SECOND_CHANCE ? { ...w, status: WordStatus.SKIPPED } : w
      );
      set({
        gameState: {
          phase: GamePhase.REVIEW,
          turn: {
            ...turn,
            activeWord: null,
            wordsPlayed: finalHistory,
          }
        }
      });
    }
  },

  markWord: (status) => {
    const { gameState } = get();
    if (gameState.phase !== GamePhase.ACTIVE_TURN || gameState.subPhase !== TurnSubPhase.PLAYING) return;

    const { turn } = gameState;
    const { activeWord, wordsPlayed, skipsRemaining } = turn;

    let nextHistory = wordsPlayed;
    if (activeWord) {
      nextHistory = [
        ...wordsPlayed,
        {
          word: activeWord.word,
          status: status === WordStatus.SKIPPED ? WordStatus.SECOND_CHANCE : status,
          originalItem: activeWord,
        },
      ];
    }

    let newSkips = skipsRemaining;
    if (status === WordStatus.SKIPPED && skipsRemaining !== 'unlimited') {
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
    if (gameState.phase !== GamePhase.ACTIVE_TURN || gameState.subPhase !== TurnSubPhase.SECOND_CHANCE) return;

    const { turn } = gameState;
    const { secondChanceQueue, secondChanceIndex, wordsPlayed } = turn;
    const currentWord = secondChanceQueue[secondChanceIndex];
    
    const newHistory = wordsPlayed.map((w) =>
      w.word === currentWord
        ? { ...w, status: success ? WordStatus.RECOVERED : WordStatus.SKIPPED }
        : w
    );

    const nextIndex = secondChanceIndex + 1;
    const updates: Partial<TurnData> = {
      wordsPlayed: newHistory,
      secondChanceIndex: nextIndex
    };

    if (nextIndex >= secondChanceQueue.length) {
      set({
        gameState: {
          phase: GamePhase.REVIEW,
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
    if (gameState.phase !== GamePhase.REVIEW) return;

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

    if (gameState.phase !== GamePhase.REVIEW) return;

    const { turn } = gameState;
    let points = 0;
    const wordsToReturnToDeck: DeckItem[] = [];
    const wordsUsed: DeckItem[] = [];

    turn.wordsPlayed.forEach((w) => {
      const item = w.originalItem || { word: w.word };
      if (w.status === WordStatus.GOT_IT) {
        points += pointsPerWord;
        wordsUsed.push(item);
      } else if (w.status === WordStatus.RECOVERED) {
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
      gameState: { phase: GamePhase.SCOREBOARD },
    });
  },
});
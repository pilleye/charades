import { GamePhase, TurnSubPhase, WordStatus } from '../types';
import type { DeckItem } from '@/data/decks/types';
import type { GameSliceCreator, TurnSlice } from '../types';
import { addToScore } from '../types/branded';
import { isValidTeamIndex } from '../utils/teamAccess';

export const createTurnSlice: GameSliceCreator<TurnSlice> = (set, get) => ({
  startTurn: () => {
    const { roundDuration, skipsPerTurn, gameState } = get();
    const currentTeamIndex = 'currentTeamIndex' in gameState ? gameState.currentTeamIndex : 0;
    
    set({
      gameState: {
        phase: GamePhase.ACTIVE_TURN,
        currentTeamIndex,
        isPaused: false,
        turn: {
          subPhase: TurnSubPhase.COUNTDOWN,
          timeRemaining: roundDuration,
          skipsRemaining: skipsPerTurn,
          wordsPlayed: [],
        }
      }
    });
  },

  beginActiveRound: () => {
    const { gameState } = get();
    if (gameState.phase !== GamePhase.ACTIVE_TURN || gameState.turn.subPhase !== TurnSubPhase.COUNTDOWN) return;

    const nextCard = get().drawNextCard();
    if (!nextCard) {
      // Edge case: No cards left in deck at the start of a turn
      get().endTurn();
      return;
    }

    set({
      gameState: {
        ...gameState,
        turn: {
          subPhase: TurnSubPhase.PLAYING,
          timeRemaining: gameState.turn.timeRemaining,
          skipsRemaining: gameState.turn.skipsRemaining,
          wordsPlayed: gameState.turn.wordsPlayed,
          activeWord: nextCard
        }
      }
    });
  },

  updateTimer: (time) => {
    const { gameState } = get();
    if (gameState.phase !== GamePhase.ACTIVE_TURN) return;
    if (gameState.turn.subPhase === TurnSubPhase.SECOND_CHANCE) return;

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

    const { turn, currentTeamIndex } = gameState;
    const newHistory = [...turn.wordsPlayed];

    let candidates: DeckItem[] = [];

    if (turn.subPhase === TurnSubPhase.PLAYING) {
      newHistory.push({
        word: turn.activeWord.word,
        status: WordStatus.SECOND_CHANCE,
        originalItem: turn.activeWord,
      });
      candidates.push(turn.activeWord);
    }

    const skippedInTurn = turn.wordsPlayed
      .filter((w) => w.status === WordStatus.SECOND_CHANCE)
      .map((w) => w.originalItem as DeckItem); // We know originalItem exists for these
    
    candidates = [...candidates, ...skippedInTurn];

    if (secondChanceEnabled && candidates.length > 0) {
      set({
        gameState: {
          phase: GamePhase.ACTIVE_TURN,
          currentTeamIndex,
          isPaused: false,
          turn: {
            subPhase: TurnSubPhase.SECOND_CHANCE,
            wordsPlayed: newHistory,
            secondChanceQueue: candidates,
            secondChanceIndex: 0,
          }
        }
      });
    } else {
      const finalHistory = newHistory.map(w => 
        w.status === WordStatus.SECOND_CHANCE ? { ...w, status: WordStatus.SKIPPED } : w
      );
      set({
        gameState: {
          phase: GamePhase.REVIEW,
          currentTeamIndex,
          wordsPlayed: finalHistory,
        }
      });
    }
  },

  markWord: (status) => {
    const { gameState } = get();
    if (gameState.phase !== GamePhase.ACTIVE_TURN || gameState.turn.subPhase !== TurnSubPhase.PLAYING) return;

    const { turn, currentTeamIndex, isPaused } = gameState;
    const { activeWord, wordsPlayed, skipsRemaining, timeRemaining } = turn;

    const nextHistory = [
      ...wordsPlayed,
      {
        word: activeWord.word,
        status: status === WordStatus.SKIPPED ? WordStatus.SECOND_CHANCE : status,
        originalItem: activeWord,
      },
    ];

    let newSkips = skipsRemaining;
    if (status === WordStatus.SKIPPED && skipsRemaining !== 'unlimited') {
      newSkips = Math.max(0, skipsRemaining - 1);
    }

    const nextCard = get().drawNextCard();

    if (!nextCard) {
      // If no more cards, transition to next phase immediately
      set({
        gameState: {
          phase: GamePhase.ACTIVE_TURN,
          currentTeamIndex,
          isPaused,
          turn: {
            subPhase: TurnSubPhase.PLAYING, // Temporary so endTurn can transition
            activeWord: activeWord, // Won't be used as we call endTurn next
            wordsPlayed: nextHistory,
            skipsRemaining: newSkips,
            timeRemaining
          }
        }
      });
      get().endTurn();
      return;
    }

    set({
      gameState: {
        ...gameState,
        turn: {
          subPhase: TurnSubPhase.PLAYING,
          wordsPlayed: nextHistory,
          skipsRemaining: newSkips,
          activeWord: nextCard,
          timeRemaining
        }
      }
    });
  },

  resolveSecondChance: (success) => {
    const { gameState } = get();
    if (gameState.phase !== GamePhase.ACTIVE_TURN || gameState.turn.subPhase !== TurnSubPhase.SECOND_CHANCE) return;

    const { turn, currentTeamIndex } = gameState;
    const { secondChanceQueue, secondChanceIndex, wordsPlayed } = turn;
    const currentItem = secondChanceQueue[secondChanceIndex];
    const currentWord = currentItem.word;
    
    const newHistory = wordsPlayed.map((w) =>
      w.word === currentWord
        ? { ...w, status: success ? WordStatus.RECOVERED : WordStatus.SKIPPED }
        : w
    );

    const nextIndex = secondChanceIndex + 1;

    if (nextIndex >= secondChanceQueue.length) {
      set({
        gameState: {
          phase: GamePhase.REVIEW,
          currentTeamIndex,
          wordsPlayed: newHistory,
        }
      });
    } else {
      set({
        gameState: {
          ...gameState,
          turn: {
            ...turn,
            wordsPlayed: newHistory,
            secondChanceIndex: nextIndex,
          }
        }
      });
    }
  },

  updateReviewWord: (index, status) => {
    const { gameState } = get();
    if (gameState.phase !== GamePhase.REVIEW) return;

    const newWords = [...gameState.wordsPlayed];
    if (newWords[index]) {
      newWords[index].status = status;
    }
    
    set({
      gameState: {
        ...gameState,
        wordsPlayed: newWords
      }
    });
  },

  applyReviewScores: () => {
    const {
      gameState,
      teams,
      pointsPerWord,
      usedWords,
      availableWords,
      secondChanceValue,
    } = get();

    if (gameState.phase !== GamePhase.REVIEW) return;

    const { wordsPlayed, currentTeamIndex } = gameState;

    // Guard against invalid team index
    if (!isValidTeamIndex(currentTeamIndex, teams.length)) {
      console.error(`applyReviewScores: Invalid team index ${currentTeamIndex}`);
      // Transition to scoreboard anyway to avoid being stuck
      set({
        gameState: {
          phase: GamePhase.SCOREBOARD,
          currentTeamIndex: 0
        },
      });
      return;
    }

    let points = 0;
    const wordsToReturnToDeck: DeckItem[] = [];
    const wordsUsed: DeckItem[] = [];

    wordsPlayed.forEach((w) => {
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
    newTeams[currentTeamIndex] = {
      ...newTeams[currentTeamIndex],
      score: addToScore(newTeams[currentTeamIndex].score, points),
    };

    set({
      teams: newTeams,
      availableWords: [...availableWords, ...wordsToReturnToDeck],
      usedWords: [...usedWords, ...wordsUsed],
      gameState: {
        phase: GamePhase.SCOREBOARD,
        currentTeamIndex
      },
    });
  },
});
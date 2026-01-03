import { GameSliceCreator, TurnSlice, WordResult } from '../types';
import { shuffleArray } from './deckSlice';

export const createTurnSlice: GameSliceCreator<TurnSlice> = (set, get) => ({
  currentTurnWords: [],
  turnTimeRemaining: 60,
  turnSkipsRemaining: 'Infinite',
  secondChanceQueue: [],
  secondChanceIndex: 0,

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

  endTurn: () => {
    const { currentActiveWord, currentTurnWords, secondChanceEnabled } = get();
    const newHistory = [...currentTurnWords];

    if (currentActiveWord) {
      newHistory.push({
        word: currentActiveWord.word,
        status: 'SKIPPED',
        originalItem: currentActiveWord,
      });
    }

    const candidates = newHistory
      .filter((w) => w.status === 'SKIPPED')
      .map((w) => w.word);

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
      set({
        phase: 'REVIEW',
        currentActiveWord: null,
        isPaused: false,
        currentTurnWords: newHistory,
      });
    }
  },

  markWord: (status) => {
    const { currentActiveWord, currentTurnWords, turnSkipsRemaining } = get();
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

  resolveSecondChance: (success) => {
    const { secondChanceQueue, secondChanceIndex, currentTurnWords } = get();
    const currentWord = secondChanceQueue[secondChanceIndex];

    if (success) {
      const newHistory = currentTurnWords.map((w) =>
        w.word === currentWord
          ? { ...w, status: 'SECOND_CHANCE' as const }
          : w
      );
      set({ currentTurnWords: newHistory });
    }

    const nextIndex = secondChanceIndex + 1;
    if (nextIndex >= secondChanceQueue.length) {
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
    const wordsToReturnToDeck = [];
    const wordsUsed = [];

    currentTurnWords.forEach((w) => {
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
      availableWords: shuffleArray([...availableWords, ...wordsToReturnToDeck]),
      usedWords: [...usedWords, ...wordsUsed],
      phase: 'SCOREBOARD',
    });
  },
});

import { DEFAULT_DECKS, FREE_TIER_CARD_LIMIT, normalizeForDuplicateCheck } from '@/data/decks';
import type { DeckItem } from '@/data/decks/types';
import { useSubscriptionStore } from '../subscriptionStore';
import type { GameSliceCreator, DeckSlice } from '../types';

export const shuffleArray = (array: DeckItem[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export const getEffectiveDeck = (selectedDeck: string, isPremium: boolean): DeckItem[] => {
  const deckKey = DEFAULT_DECKS[selectedDeck] ? selectedDeck : 'Default';
  let deckWords = DEFAULT_DECKS[deckKey] || [];

  if (!isPremium) {
    if (deckKey === 'Default') {
      deckWords = deckWords.slice(0, FREE_TIER_CARD_LIMIT);
    } else {
      deckWords = [];
    }
  }
  return deckWords;
};

export const createDeckSlice: GameSliceCreator<DeckSlice> = (set, get) => ({
  selectedDeck: 'Default',
  customWords: [],
  availableWords: [],
  usedWords: [],

  drawNextCard: (): DeckItem | null => {
    const { availableWords, usedWords, selectedDeck, customWords } = get();
    const isPremium = useSubscriptionStore.getState().status === 'active';
    let deck = [...availableWords];

    if (deck.length === 0) {
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
    set({ availableWords: deck });
    
    return nextWord || null;
  },

  setDeckConfig: (selectedDeck, customWords) => set({ selectedDeck, customWords }),

  addCustomWord: (word) => set((state) => {
    const trimmed = word.trim();
    if (!trimmed) return {};
    const normalizedNew = normalizeForDuplicateCheck(trimmed);
    const isDuplicateCustom = state.customWords.some(
      (existing) => normalizeForDuplicateCheck(existing) === normalizedNew
    );
    const deckWords = DEFAULT_DECKS[state.selectedDeck] || [];
    const isDuplicateDeck = deckWords.some(
      (deckItem) => normalizeForDuplicateCheck(deckItem.word) === normalizedNew
    );
    if (isDuplicateCustom || isDuplicateDeck) return {};
    return { customWords: [...state.customWords, trimmed] };
  }),

  removeCustomWord: (word) => set((state) => ({
    customWords: state.customWords.filter((w) => w !== word),
  })),

  initializeDeck: () => {
    const { selectedDeck, customWords } = get();
    const isPremium = useSubscriptionStore.getState().status === 'active';
    const baseDeck = getEffectiveDeck(selectedDeck, isPremium);
    const customDeckItems: DeckItem[] = isPremium
      ? customWords.map((w) => ({ word: w }))
      : [];
    set({
      availableWords: shuffleArray([...baseDeck, ...customDeckItems]),
      usedWords: [],
    });
  },
});
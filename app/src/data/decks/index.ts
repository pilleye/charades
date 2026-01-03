import type { DeckItem } from "./types";
import { defaultDeckItems } from "./default";
import { christmasDeckItems } from "./christmas";

// Free tier configuration
export const FREE_TIER_CARD_LIMIT = 50;
export const FREE_TIER_CUSTOM_WORDS_ENABLED = false;

// Normalize text for smarter duplicate detection
// "Sleeping Beauty" and "SleepingBeauty" should be treated as the same
export function normalizeForDuplicateCheck(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

function createDeck(name: string, items: (string | DeckItem)[]): DeckItem[] {
  const uniqueWords = new Set<string>();
  const duplicates: string[] = [];
  const deckItems: DeckItem[] = [];
  items.forEach((item) => {
    const word = typeof item === "string" ? item : item.word;
    const hint = typeof item === "string" ? undefined : item.hint;
    const normalizedWord = normalizeForDuplicateCheck(word);

    if (uniqueWords.has(normalizedWord)) {
      duplicates.push(word);
    } else {
      uniqueWords.add(normalizedWord);
      deckItems.push({ word, hint });
    }
  });
  if (duplicates.length > 0) {
    console.error(
      `[Deck Validation] Duplicate words found in deck "${name}":`,
      duplicates
    );
  }
  return deckItems;
}

export const DEFAULT_DECKS: Record<string, DeckItem[]> = {
  Default: createDeck("Default", defaultDeckItems),
  Christmas: createDeck("Christmas", christmasDeckItems),
};

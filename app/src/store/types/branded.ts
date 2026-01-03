declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

// Score: non-negative number
export type Score = Brand<number, 'Score'>;

export function makeScore(n: number): Score {
  return Math.max(0, n) as Score;
}

export function addToScore(current: Score, delta: number): Score {
  return makeScore(current + delta);
}

// TeamName: non-empty trimmed string
export type TeamName = Brand<string, 'TeamName'>;

export function makeTeamName(s: string): TeamName | null {
  const trimmed = s.trim();
  return trimmed.length > 0 ? (trimmed as TeamName) : null;
}

// ValidIndex: index guaranteed within bounds
export type ValidIndex<T extends readonly unknown[]> = number & {
  readonly __arrayBrand: T;
};

export function makeValidIndex<T extends readonly unknown[]>(
  index: number,
  array: T
): ValidIndex<T> | null {
  return index >= 0 && index < array.length ? (index as ValidIndex<T>) : null;
}

// PositiveNumber: greater than zero
export type PositiveNumber = Brand<number, 'PositiveNumber'>;

export function makePositiveNumber(n: number): PositiveNumber | null {
  return n > 0 ? (n as PositiveNumber) : null;
}

// NonNegativeNumber: zero or greater
export type NonNegativeNumber = Brand<number, 'NonNegativeNumber'>;

export function makeNonNegativeNumber(n: number): NonNegativeNumber {
  return Math.max(0, n) as NonNegativeNumber;
}

// Multiplier: number between 0 and 1 inclusive
export type Multiplier = Brand<number, 'Multiplier'>;

export function makeMultiplier(n: number): Multiplier {
  return Math.max(0, Math.min(1, n)) as Multiplier;
}

// WordId: reference to a word in a deck
export type WordId = Brand<string, 'WordId'>;

export function makeWordId(word: string): WordId {
  return word as WordId;
}

// DeckId: identifier for a deck
export type DeckId = Brand<string, 'DeckId'>;

export function makeDeckId(id: string): DeckId | null {
  return id.length > 0 ? (id as DeckId) : null;
}

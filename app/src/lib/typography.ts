/**
 * Typography utilities for dynamic text sizing based on content length.
 */

/**
 * Returns a Tailwind CSS font-size class based on word length.
 * Used for displaying game words that need to fit on screen.
 */
export function getWordFontSize(word: string): string {
  const length = word.length;
  if (length <= 6) return 'text-7xl';
  if (length <= 10) return 'text-6xl';
  if (length <= 14) return 'text-5xl';
  return 'text-4xl';
}

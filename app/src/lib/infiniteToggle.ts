/**
 * Utilities for toggling between finite and infinite values.
 * Used for game settings like rounds and skips that can be either
 * a specific number or 'Infinite'.
 */

export type InfiniteValue = number | 'Infinite';

/**
 * Creates a toggle function for switching between a finite value and 'Infinite'.
 * 
 * @param currentValue - The current value (number or 'Infinite')
 * @param lastFiniteValue - The last known finite value to restore when toggling off infinite
 * @param minValue - Optional minimum value constraint (e.g., currentRound for totalRounds)
 * @returns The new value to set
 */
export function toggleInfinite(
  currentValue: InfiniteValue,
  lastFiniteValue: number,
  minValue: number = 1
): InfiniteValue {
  if (currentValue === 'Infinite') {
    // Restore last finite value, ensuring it's at least minValue
    return Math.max(minValue, lastFiniteValue);
  } else {
    return 'Infinite';
  }
}

/**
 * Creates handlers for adjusting a value that can be infinite.
 * Returns null for the adjust function if value is infinite.
 */
export function adjustInfiniteValue(
  currentValue: InfiniteValue,
  delta: number,
  minValue: number = 0,
  maxValue: number = Infinity
): number | null {
  if (currentValue === 'Infinite') {
    return null;
  }
  return Math.max(minValue, Math.min(maxValue, currentValue + delta));
}

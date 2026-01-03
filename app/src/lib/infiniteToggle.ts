import type { GameLimit } from '@/store/types';

export function toggleInfinite(
  currentValue: GameLimit,
  lastFiniteValue: number,
  minValue: number = 1
): GameLimit {
  if (currentValue === 'unlimited') {
    return Math.max(minValue, lastFiniteValue);
  }
  return 'unlimited';
}

export function adjustInfiniteValue(
  currentValue: GameLimit,
  delta: number,
  minValue: number = 0,
  maxValue: number = Infinity
): number | null {
  if (currentValue === 'unlimited') {
    return null;
  }
  return Math.max(minValue, Math.min(maxValue, currentValue + delta));
}

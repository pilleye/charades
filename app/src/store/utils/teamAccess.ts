import type { Team, GameState } from '../types';

/**
 * Safely get a team by index with bounds checking.
 * Returns null if index is out of bounds instead of crashing with undefined access.
 *
 * @param teams - Array of teams
 * @param index - Index to access
 * @returns Team at index or null if out of bounds
 */
export function getTeamByIndex(teams: Team[], index: number): Team | null {
  if (index < 0 || index >= teams.length || teams.length === 0) {
    return null;
  }
  return teams[index];
}

/**
 * Get the current team from game state safely.
 * Handles phases that don't have currentTeamIndex and validates bounds.
 *
 * @param teams - Array of teams
 * @param gameState - Current game state
 * @returns Current team or null if not available/invalid
 */
export function getCurrentTeam(teams: Team[], gameState: GameState): Team | null {
  if (!('currentTeamIndex' in gameState)) {
    return null;
  }
  return getTeamByIndex(teams, gameState.currentTeamIndex);
}

/**
 * Clamp a team index to valid bounds.
 * Returns 0 if teams array is empty.
 *
 * @param index - Index to clamp
 * @param teamsLength - Length of teams array
 * @returns Valid index within bounds
 */
export function clampTeamIndex(index: number, teamsLength: number): number {
  if (teamsLength === 0) return 0;
  if (index < 0) return 0;
  if (index >= teamsLength) return teamsLength - 1;
  return index;
}

/**
 * Validate if a team index is within valid bounds.
 *
 * @param index - Index to validate
 * @param teamsLength - Length of teams array
 * @returns true if index is valid
 */
export function isValidTeamIndex(index: number, teamsLength: number): boolean {
  return teamsLength > 0 && index >= 0 && index < teamsLength;
}

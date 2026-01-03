import type { Team, GameState } from '../types';

export function getTeamByIndex(teams: Team[], index: number): Team | null {
  if (index < 0 || index >= teams.length || teams.length === 0) {
    return null;
  }
  return teams[index];
}

export function getCurrentTeam(teams: Team[], gameState: GameState): Team | null {
  if (!('currentTeamIndex' in gameState)) {
    return null;
  }
  return getTeamByIndex(teams, gameState.currentTeamIndex);
}

export function clampTeamIndex(index: number, teamsLength: number): number {
  if (teamsLength === 0) return 0;
  if (index < 0) return 0;
  if (index >= teamsLength) return teamsLength - 1;
  return index;
}

export function isValidTeamIndex(index: number, teamsLength: number): boolean {
  return teamsLength > 0 && index >= 0 && index < teamsLength;
}

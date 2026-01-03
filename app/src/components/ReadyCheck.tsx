'use client';

import React from 'react';
import { useGameStore, GamePhase } from '@/store/gameStore';
import { useWakeLock } from '@/hooks/useWakeLock';
import { Button } from './ui/Button';
import { TEAM_COLORS } from '@/constants';

export const ReadyCheck: React.FC = () => {
  const { teams, gameState, startTurn, currentRound, totalRounds } =
    useGameStore();
  
  useWakeLock(gameState.phase === GamePhase.READY_CHECK);
  
  if (gameState.phase !== GamePhase.READY_CHECK) return null;
  
  const { currentTeamIndex } = gameState;
  const currentTeam = teams[currentTeamIndex];
  const teamColorBg = TEAM_COLORS[currentTeam.colorIndex % TEAM_COLORS.length];

  const roundLabel =
    totalRounds === 'unlimited'
      ? `ROUND ${currentRound}`
      : `ROUND ${currentRound} / ${totalRounds}`;

  const turnLabel = `TURN ${currentTeamIndex + 1} / ${teams.length}`;

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-slate-100 p-8`}
    >
      {/* Ambient background glow - Smaller and centered to fade before edges */}
      <div
        className={`absolute top-1/2 left-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 ${teamColorBg} pointer-events-none z-0 rounded-full opacity-40 blur-[100px]`}
      ></div>

      {/* Round & Turn Info Pill */}
      <div className="animate-fade-in absolute top-12 right-0 left-0 z-10 flex justify-center safe-margin-top">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-2 shadow-sm">
          <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
            {roundLabel}
          </span>
          <div className="h-3 w-px bg-slate-300"></div>
          <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
            {turnLabel}
          </span>
        </div>
      </div>

      <div className="animate-fade-in relative z-10 w-full max-w-sm space-y-10 text-center">
        <div className="space-y-2">
          <p className="text-xl font-bold tracking-widest text-slate-400 uppercase">
            Up Next
          </p>
          <h1 className="text-6xl leading-tight font-black break-words text-slate-900 drop-shadow-sm">
            {currentTeam.name}
          </h1>
        </div>

        <div className="flex justify-center">
          <div
            className={`h-3 w-32 rounded-full ${teamColorBg} shadow-sm`}
          ></div>
        </div>

        <div className="w-full pt-8">
          <Button
            variant="primary"
            size="xl"
            fullWidth
            onClick={startTurn}
            className="animate-bounce-subtle border-blue-700 shadow-blue-700"
          >
            I'M READY
          </Button>
        </div>
      </div>
    </div>
  );
};

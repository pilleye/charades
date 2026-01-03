'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { soundEngine } from '@/lib/audio';
import { useWakeLock } from '@/hooks/useWakeLock';
import { TEAM_COLORS } from '@/constants';
import { SkipIcon, RecoverIcon, PauseIcon } from './ui/Icons';
import { getWordFontSize } from '@/lib/typography';
import { PauseMenuOverlay } from './ui/PauseMenuOverlay';

export const SecondChanceRound: React.FC = () => {
  const {
    resolveSecondChance,
    resetGame,
    gameState,
    togglePause,
    teams,
    currentTeamIndex,
  } = useGameStore();

  const isSecondChance = gameState.phase === 'SECOND_CHANCE';
  const turn = isSecondChance ? gameState.turn : null;
  const isPaused = isSecondChance ? gameState.isPaused : false;

  const secondChanceQueue = turn?.secondChanceQueue || [];
  const secondChanceIndex = turn?.secondChanceIndex || 0;

  const currentTeam = teams[currentTeamIndex];
  const teamColorBg = TEAM_COLORS[currentTeam.colorIndex % TEAM_COLORS.length];

  const currentWord = secondChanceQueue[secondChanceIndex];
  const remaining = secondChanceQueue.length - secondChanceIndex;

  // Wake Lock Management
  useWakeLock(!isPaused);

  const handleRecover = () => {
    if (isPaused) return;
    soundEngine.playRecovery().catch(console.error);
    resolveSecondChance(true);
  };

  const handleDiscard = () => {
    if (isPaused) return;
    soundEngine.playSkip().catch(console.error);
    resolveSecondChance(false);
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-indigo-950 text-white">
      {/* Portrait-only safe area spacer for Dynamic Island */}
      <div className="safe-top-spacer shrink-0 bg-indigo-950" />

      {/* Background Decor & Team Color Mix */}
      <div className="absolute top-0 right-0 left-0 z-0 h-40 bg-gradient-to-b from-indigo-900 to-transparent opacity-50" />
      <div
        className={`absolute top-1/2 left-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 ${teamColorBg} pointer-events-none z-0 rounded-full opacity-20 mix-blend-screen blur-[100px]`}
      />

      {/* Main Content: Column in Portrait, Row in Landscape */}
      <div className="relative z-10 flex h-full flex-1 flex-col landscape:flex-row">
        {/* Left/Top: Info + Word */}
        <div className="relative flex flex-1 flex-col safe-landscape-left">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pt-8 landscape:pt-4">
            <div className="w-12"></div> {/* Spacer to balance Pause Button */}
            <div className="flex flex-col items-center space-y-2">
              <div className="text-xs font-black tracking-widest text-indigo-300 uppercase opacity-80">
                {currentTeam.name}
              </div>

              <div className="flex flex-col items-center gap-2">
                <h2 className="text-sm leading-none font-black tracking-widest text-indigo-400 uppercase">
                  Second Chance
                </h2>
                <div className="flex items-baseline gap-2 rounded-2xl border border-indigo-500/30 bg-indigo-900/60 px-6 py-3 shadow-lg backdrop-blur-sm">
                  <span className="text-3xl leading-none font-black text-indigo-100">
                    {remaining}
                  </span>
                  <span className="text-xs font-bold tracking-wider text-indigo-400 uppercase">
                    Words Left
                  </span>
                </div>
              </div>
            </div>
            <div className="flex w-12 justify-end">
              <button
                onClick={togglePause}
                className="rounded-2xl border border-indigo-500/30 bg-indigo-900/50 p-3 text-indigo-300 shadow-sm transition-colors active:bg-indigo-800 active:text-white"
              >
                <PauseIcon />
              </button>
            </div>
          </div>

          {/* Word */}
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="animate-pop-in pb-10 text-center">
              <h1
                className={`leading-tight font-black break-words drop-shadow-2xl ${getWordFontSize(currentWord)}`}
              >
                {currentWord}
              </h1>
            </div>
          </div>
        </div>

        {/* Right/Bottom: Controls */}
        <div className="flex h-[35vh] gap-4 p-4 landscape:h-full landscape:w-72 landscape:flex-col landscape:justify-center landscape:border-l landscape:border-indigo-900/30 landscape:pb-4 safe-landscape-right">
          {/* SKIP Button */}
          <button
            onClick={handleDiscard}
            className={`flex flex-1 touch-manipulation flex-col items-center justify-center gap-2 rounded-3xl border-b-[8px] border-slate-900 bg-slate-800 text-slate-300 transition-all active:translate-y-[8px] active:border-b-0 active:bg-slate-700`}
          >
            <SkipIcon />
            <span className="text-xl font-black tracking-wider uppercase">
              Skip
            </span>
          </button>

          {/* RECOVER Button */}
          <button
            onClick={handleRecover}
            className={`flex flex-[1.5] touch-manipulation flex-col items-center justify-center gap-2 rounded-3xl border-b-[8px] border-indigo-700 bg-indigo-500 text-white shadow-lg shadow-indigo-900/50 transition-all active:translate-y-[8px] active:border-b-0 active:bg-indigo-600`}
          >
            <RecoverIcon className="h-10 w-10" />
            <span className="text-2xl font-black tracking-wider uppercase">
              Recover
            </span>
          </button>
        </div>
      </div>

      {/* PAUSE MENU OVERLAY */}
      <PauseMenuOverlay
        isOpen={isPaused}
        onResume={togglePause}
        onQuit={resetGame}
        variant="dark"
        pauseTitle="PAUSED"
      />
    </div>
  );
};
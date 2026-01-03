'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { soundEngine } from '@/lib/audio';
import { useWakeLock } from '@/hooks/useWakeLock';
import { TEAM_COLORS } from '@/constants';
import { PauseMenuOverlay } from './ui/PauseMenuOverlay';

// Icons
const PauseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="h-8 w-8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 5.25v13.5m-7.5-13.5v13.5"
    />
  </svg>
);

export const Countdown: React.FC = () => {
  const [count, setCount] = useState(3);
  const {
    drawWord,
    teams,
    currentTeamIndex,
    isPaused,
    togglePause,
    resetGame,
  } = useGameStore();

  const currentTeam = teams[currentTeamIndex];
  const teamColorBg = TEAM_COLORS[currentTeam.colorIndex % TEAM_COLORS.length];

  // Wake Lock Management
  useWakeLock(!isPaused);

  // Timer Logic
  useEffect(() => {
    if (isPaused) return undefined;

    let timer: NodeJS.Timeout;

    if (count > 0) {
      // Play tick sound
      soundEngine.playCountdown(false).catch(console.error);

      timer = setTimeout(() => {
        setCount((prev) => prev - 1);
      }, 1000);
    } else {
      // GO! logic
      soundEngine.playCountdown(true).catch(console.error);

      timer = setTimeout(() => {
        useGameStore.setState({ phase: 'ACTIVE' });
        drawWord();
      }, 800);
    }

    return () => clearTimeout(timer);
  }, [count, isPaused, drawWord]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-slate-50">
      {/* Pause Button (Top Right) - with safe area for Dynamic Island */}
      <div className="absolute top-4 right-4 z-20 safe-margin-top safe-margin-right">
        <button
          onClick={togglePause}
          className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-400 shadow-sm transition-colors active:bg-slate-50 active:text-slate-900"
        >
          <PauseIcon />
        </button>
      </div>

      {/* Ambient background glow */}
      <div
        className={`absolute top-1/2 left-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 ${teamColorBg} pointer-events-none z-0 rounded-full opacity-25 blur-[80px]`}
      />

      {/* Main Countdown Display */}
      <div className="flex h-full w-full items-center justify-center">
        <style>{`
              @keyframes zoomInFace {
                  0% { transform: scale(0.1); opacity: 0; }
                  50% { transform: scale(1.5); opacity: 1; }
                  100% { transform: scale(1); opacity: 1; }
              }
              .animate-zoom-face {
                  animation: zoomInFace 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
              }
          `}</style>
        <div
          key={count}
          className="animate-zoom-face relative z-10 text-center text-[35vw] leading-none font-black text-slate-900 drop-shadow-md landscape:text-[20vh]"
        >
          {count > 0 ? count : 'GO!'}
        </div>
      </div>

      {/* PAUSE MENU OVERLAY */}
      <PauseMenuOverlay
        isOpen={isPaused}
        onResume={togglePause}
        onQuit={resetGame}
        variant="light"
      />
    </div>
  );
};

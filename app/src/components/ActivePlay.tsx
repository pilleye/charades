'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore, GamePhase, TurnSubPhase, WordStatus } from '@/store/gameStore';
import { useGameAudio } from '@/hooks/useGameAudio';
import { useTimer } from '@/hooks/useTimer';
import { getWordFontSize } from '@/lib/typography';
import { TeamBadge } from './ui/TeamBadge';
import { PauseIcon, SkipIcon, CheckIcon, CogIcon, BackIcon } from './ui/Icons';
import { PauseMenuOverlay as Overlay } from './ui/PauseMenuOverlay';
import { Button } from './ui/Button';
import { NumberControl, InfiniteToggleControl } from './ui/Controls';
import { SegmentedControl } from './ui/SegmentedControl';
import { TEAM_COLORS } from '@/constants';
import { HintDisplay } from './ui/HintDisplay';

export const ActivePlay: React.FC = () => {
  const {
    markWord,
    endTurn,
    updateTimer,
    gameState,
    togglePause,
    roundDuration,
    updateDurationInGame,
    resetGame,
    hintsEnabled,
    setHintsEnabled,
    totalRounds,
    updateTotalRounds,
    currentRound,
    skipsPerTurn,
    updateSkipsPerTurn,
    teams,
    currentTeamIndex,
  } = useGameStore();

  const isActiveTurn = gameState.phase === GamePhase.ACTIVE_TURN && gameState.subPhase === TurnSubPhase.PLAYING;
  const turn = isActiveTurn ? gameState.turn : null;
  const isPaused = gameState.phase === GamePhase.ACTIVE_TURN ? gameState.isPaused : false;

  const turnTimeRemaining = turn?.timeRemaining ?? 0;
  const turnSkipsRemaining = turn?.skipsRemaining ?? 0;
  const currentActiveWord = turn?.activeWord;

  const currentTeam = teams[currentTeamIndex];
  const teamColorBg = TEAM_COLORS[currentTeam.colorIndex % TEAM_COLORS.length];

  const { playCorrect, playSkip, playTimeUp, playTick, playUrgentTick } = useGameAudio();

  const { pause, start } = useTimer({
    initialTime: turnTimeRemaining,
    autoStart: !isPaused,
    onTick: (rem) => {
      updateTimer(rem);
      
      if (rem > 0) {
        if (rem <= 5) {
          playUrgentTick(rem);
        } else {
          // Audio Logic:
          // Quiet (0.005) until 10s
          // Gradually louder (up to 0.05) from 10s to 6s
          
          let volume = 0.005;
          const freq = 800;
          
          if (rem <= 10) {
            volume = 0.005 + (11 - rem) * 0.01; 
          }
          
          playTick(freq, volume);
        }
      }
    },
    onFinish: () => {
      playTimeUp();
      endTurn();
    },
  });

  // Handle Pause/Resume sync
  useEffect(() => {
    if (isPaused) pause();
    else start();
  }, [isPaused, pause, start]);

  const [view, setView] = useState<'PAUSED' | 'SETTINGS'>('PAUSED');
  
  // Helpers for settings controls
  const toggleInfiniteSkips = () => {
    updateSkipsPerTurn(skipsPerTurn === 'unlimited' ? 3 : 'unlimited');
  };
  const toggleInfiniteRounds = () => {
    updateTotalRounds(totalRounds === 'unlimited' ? 5 : 'unlimited');
  };

  const lastSkipsValue = typeof skipsPerTurn === 'number' ? skipsPerTurn : 3;
  const lastRoundsValue = typeof totalRounds === 'number' ? totalRounds : 5;

  const handleGotIt = () => {
    playCorrect();
    markWord(WordStatus.GOT_IT);
  };

  const handleSkip = () => {
    if (turnSkipsRemaining === 0) return;
    playSkip();
    markWord(WordStatus.SKIPPED);
  };

  const handleResume = () => {
    setView('PAUSED'); // Reset view on resume
    togglePause();
  };

  const displayWord = currentActiveWord?.word || 'Get Ready!';
  const displayHint = currentActiveWord?.hint;

  const progressPercent = Math.min(
    100,
    (turnTimeRemaining / roundDuration) * 100
  );

  // Timer State Logic
  const isCritical = turnTimeRemaining <= 5;
  const isWarning = turnTimeRemaining <= 10 && !isCritical;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-slate-100">
      {/* Portrait-only safe area spacer for Dynamic Island */}
      <div className="safe-top-spacer shrink-0 bg-slate-200" />

      {/* 1. Timer Bar (Always Top) - Thicker and Ticking Animation */}

      <div className="relative z-30 h-6 w-full shrink-0 border-b border-slate-300 bg-slate-200">
        <div
          className={`h-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isCritical
            ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.6)]'
            : isWarning
              ? 'bg-orange-500'
              : 'bg-blue-500'
            }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Content Area - Switches to Row in Landscape */}

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden landscape:flex-row">
        {/* Left/Top Section: Info + Word + Gradient */}

        <div className="relative flex flex-1 flex-col overflow-hidden safe-landscape-left">
          {/* Ambient Team Color Background - Scoped to content area so it doesn't bleed into sidebar in landscape */}

          <div
            className={`absolute top-1/2 left-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 ${teamColorBg} pointer-events-none z-0 rounded-full opacity-40 blur-[100px]`}
          />

          {/* Header Row (Skips, Time, Pause) */}

          <div className="relative z-10 flex h-32 shrink-0 items-start justify-between p-4 pt-4 landscape:h-24">
            {/* Left: Skips */}

            <div className="flex w-20 flex-col items-center justify-center pt-2">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Skips
              </span>

              <div className="mt-1 text-3xl leading-none font-black text-yellow-500">
                {turnSkipsRemaining === 'unlimited' ? '∞' : turnSkipsRemaining}
              </div>
            </div>

            {/* Center: Time (Large & Reactive) */}

            <div className="flex flex-col items-center justify-start">
              <TeamBadge
                name={currentTeam.name}
                colorIndex={currentTeam.colorIndex}
                variant="compact"
                className="animate-fade-in mb-2"
              />

              <div
                className={`flex flex-col items-center transition-all duration-300 ${isCritical
                  ? 'translate-y-2 scale-125'
                  : isWarning
                    ? 'translate-y-1 scale-110'
                    : ''
                  }`}
              >
                <span
                  className={`font-mono leading-none font-black transition-colors duration-300 ${isCritical
                    ? 'animate-pulse text-8xl text-red-600 drop-shadow-sm'
                    : isWarning
                      ? 'text-7xl text-orange-500'
                      : 'text-6xl text-slate-900'
                    }`}
                >
                  {turnTimeRemaining}
                </span>
              </div>
            </div>

            {/* Right: Pause */}

            <div className="flex w-20 justify-end pt-2">
              <button
                onClick={togglePause}
                className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-400 shadow-sm transition-colors active:bg-slate-50 active:text-slate-900"
              >
                <PauseIcon />
              </button>
            </div>
          </div>

          {/* Center: Word */}

          <div className="relative z-10 -mt-8 flex flex-1 flex-col items-center justify-center px-6">
            <h1
              className={`animate-pop-in relative text-center leading-tight font-black break-words text-slate-900 drop-shadow-sm select-none ${getWordFontSize(displayWord)}`}
            >
              {displayWord}
            </h1>

            {displayHint && hintsEnabled && (
              <HintDisplay key={displayWord} hint={displayHint} />
            )}
          </div>
        </div>

        {/* Right/Bottom Section: Controls */}
        {/* Landscape: Sidebar style */}
        <div className="relative z-20 flex h-[35vh] gap-4 p-4 landscape:h-full landscape:w-72 landscape:flex-col landscape:justify-center landscape:border-l landscape:border-slate-100 landscape:bg-white/60 landscape:pb-4 landscape:backdrop-blur-sm safe-landscape-right">
          {/* PASS Button */}
          <button
            onClick={handleSkip}
            disabled={turnSkipsRemaining === 0}
            className={`flex flex-1 touch-manipulation flex-col items-center justify-center gap-2 rounded-3xl border-b-[8px] border-yellow-600 bg-yellow-400 text-yellow-900 transition-all active:translate-y-[8px] active:border-b-0 active:bg-yellow-500 disabled:translate-y-0 disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-400`}
          >
            <SkipIcon />
            <span className="text-2xl font-black tracking-wider uppercase">
              Skip
            </span>
          </button>

          {/* GOT IT Button */}
          <button
            onClick={handleGotIt}
            className={`flex flex-[1.5] touch-manipulation flex-col items-center justify-center gap-2 rounded-3xl border-b-[8px] border-green-700 bg-green-500 text-white transition-all active:translate-y-[8px] active:border-b-0 active:bg-green-600`}
          >
            <CheckIcon />
            <span className="text-3xl font-black tracking-wider uppercase">
              Got It
            </span>
          </button>
        </div>
      </div>

      <Overlay isOpen={isPaused && view === 'PAUSED'} onResume={handleResume} onQuit={resetGame}>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => setView('SETTINGS')}
          className="gap-2"
          icon={<CogIcon />}
        >
          GAME SETTINGS
        </Button>
      </Overlay>

      {/* Settings View - Renders on top of everything when active */}
      {isPaused && view === 'SETTINGS' && (
        <div className="absolute inset-0 z-50 flex h-full w-full flex-col bg-slate-50">
            {/* Settings Header */}
            <header className="flex shrink-0 items-center justify-between p-4">
              <button
                onClick={() => setView('PAUSED')}
                className="-ml-2 p-2 text-slate-400 transition-transform hover:text-slate-600 active:scale-95"
              >
                <BackIcon />
              </button>
              <h2 className="text-2xl font-black tracking-wide text-slate-800 uppercase">
                SETTINGS
              </h2>
              <div className="w-8"></div>
            </header>

            {/* Settings Content */}
            <div className="mask-fade-bottom flex-1 space-y-6 overflow-y-auto px-6 pb-4">
              <section className="space-y-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <NumberControl
                  label="Round Timer"
                  value={roundDuration}
                  onDecrease={() => updateDurationInGame(Math.max(10, roundDuration - 10))}
                  onIncrease={() => updateDurationInGame(roundDuration + 10)}
                  unit="SECONDS"
                />

                <InfiniteToggleControl
                  label="Skips Allowed"
                  value={skipsPerTurn}
                  onDecrease={() =>
                    typeof skipsPerTurn === 'number' &&
                    updateSkipsPerTurn(Math.max(0, skipsPerTurn - 1))
                  }
                  onIncrease={() =>
                    typeof skipsPerTurn === 'number' &&
                    updateSkipsPerTurn(Math.min(10, skipsPerTurn + 1))
                  }
                  onToggleInfinite={toggleInfiniteSkips}
                  unit="PER TURN"
                  color="yellow"
                  lastFiniteValue={lastSkipsValue}
                />

                <InfiniteToggleControl
                  label="Total Rounds"
                  value={totalRounds}
                  onDecrease={() =>
                    typeof totalRounds === 'number' &&
                    updateTotalRounds(Math.max(currentRound, totalRounds - 1))
                  }
                  onIncrease={() =>
                    typeof totalRounds === 'number' &&
                    updateTotalRounds(totalRounds + 1)
                  }
                  onToggleInfinite={toggleInfiniteRounds}
                  unit="ROUNDS"
                  color="indigo"
                  lastFiniteValue={lastRoundsValue}
                />

                <div className="flex flex-col gap-2 border-t border-slate-100 pt-2">
                  <label className="text-sm font-bold text-slate-400 uppercase">
                    Show Hints
                  </label>
                  <SegmentedControl
                    options={[
                      { label: 'Disabled', value: false },
                      { label: 'Enabled', value: true },
                    ]}
                    value={hintsEnabled}
                    onChange={setHintsEnabled}
                  />
                </div>
              </section>
            </div>

            <div className="shrink-0 p-6 pt-2 pb-8">
              <Button
                variant="primary"
                size="xl"
                fullWidth
                onClick={() => setView('PAUSED')}
              >
                DONE
              </Button>
            </div>
        </div>
      )}
    </div>
  );
};

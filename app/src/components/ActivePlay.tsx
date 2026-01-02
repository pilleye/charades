'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { soundEngine } from '@/lib/audio';
import { wakeLockManager } from '@/lib/wakeLock';
import { Button } from './ui/Button';
import { SkipIcon, CheckIcon, PauseIcon, CogIcon, BackIcon } from './ui/Icons';
import { HintDisplay } from './ui/HintDisplay';
import { SegmentedControl } from './ui/SegmentedControl';
import { TeamBadge } from './ui/TeamBadge';
import { NumberControl, InfiniteToggleControl } from './ui/Controls';
import { Overlay } from './ui/Modal';
import { TEAM_COLORS } from '@/constants';

export const ActivePlay: React.FC = () => {
  const {
    currentActiveWord,
    turnTimeRemaining,
    turnSkipsRemaining,
    markWord,
    endTurn,
    isPaused,
    togglePause,
    roundDuration,
    updateDurationInGame,
    resetGame,
    teams,
    currentTeamIndex,
    hintsEnabled,
    setHintsEnabled,
    totalRounds,
    updateTotalRounds,
    currentRound,
    skipsPerTurn,
    updateSkipsPerTurn,
  } = useGameStore();

  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [view, setView] = useState<'PAUSED' | 'SETTINGS'>('PAUSED');
  const lastRoundsValue = typeof totalRounds === 'number' ? totalRounds : Math.max(currentRound, 5);
  const lastSkipsValue = typeof skipsPerTurn === 'number' ? skipsPerTurn : 3;

  const currentTeam = teams[currentTeamIndex];

  const teamColorBg = TEAM_COLORS[currentTeam.colorIndex % TEAM_COLORS.length];

  useEffect(() => {
    // Enable wake lock reactively based on pause state
    if (isPaused) {
      wakeLockManager.disable();
    } else {
      wakeLockManager.enable();
    }

    // Cleanup on unmount
    return () => {
      wakeLockManager.disable();
    };
  }, [isPaused]);


  const toggleInfiniteRounds = () => {
    if (totalRounds === 'Infinite') {
      // Restore last value, ensuring it's at least the current round
      updateTotalRounds(Math.max(currentRound, lastRoundsValue));
    } else {
      updateTotalRounds('Infinite');
    }
  };

  const toggleInfiniteSkips = () => {
    if (skipsPerTurn === 'Infinite') {
      updateSkipsPerTurn(lastSkipsValue);
    } else {
      updateSkipsPerTurn('Infinite');
    }
  };

  useEffect(() => {
    // If paused, do nothing
    if (isPaused) return;

    // Timer Logic

    if (turnTimeRemaining <= 0) {
      soundEngine.playBuzzer().catch(console.error);

      endTurn();

      return;
    }

    const timer = setInterval(() => {
      // Direct store update for performance

      useGameStore.setState((state) => ({
        turnTimeRemaining: state.turnTimeRemaining - 1,
      }));

      if (turnTimeRemaining > 0) {
        soundEngine.playTick().catch(console.error);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [turnTimeRemaining, endTurn, isPaused]);

  const handleGotIt = () => {
    soundEngine.playSuccess().catch(console.error);

    markWord('GOT_IT');
  };

  const handleSkip = () => {
    if (turnSkipsRemaining === 0) return;

    soundEngine.playSkip().catch(console.error);

    markWord('SKIPPED');
  };

  const handleResume = () => {
    setShowQuitConfirm(false);
    setView('PAUSED'); // Reset view on resume
    togglePause();

    // Re-enable wake lock when resuming is now handled by useEffect
  };

  const displayWord = currentActiveWord?.word || 'Done!';

  const displayHint = currentActiveWord?.hint;

  const progressPercent = Math.min(
    100,

    (turnTimeRemaining / roundDuration) * 100
  );

  // Dynamic Font Size

  const getFontSize = (word: string) => {
    if (word.length <= 6) return 'text-7xl';

    if (word.length <= 10) return 'text-6xl';

    if (word.length <= 14) return 'text-5xl';

    return 'text-4xl';
  };

  // Timer State Logic

  const isCritical = turnTimeRemaining <= 5;

  const isWarning = turnTimeRemaining <= 10 && !isCritical;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-slate-50">
      {/* Portrait-only safe area spacer for Dynamic Island */}
      <div className="safe-top-spacer shrink-0 bg-slate-200" />

      {/* 1. Timer Bar (Always Top) - Thicker and Ticking Animation */}

      <div className="relative z-30 h-6 w-full shrink-0 border-b border-slate-300 bg-slate-200">
        <div
          className={`h-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
            isCritical
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
            className={`absolute top-1/2 left-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 ${teamColorBg} pointer-events-none z-0 rounded-full opacity-25 blur-[80px]`}
          />

          {/* Header Row (Skips, Time, Pause) */}

          <div className="relative z-10 flex h-32 shrink-0 items-start justify-between p-4 pt-4 landscape:h-24">
            {/* Left: Skips */}

            <div className="flex w-20 flex-col items-center justify-center pt-2">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                Skips
              </span>

              <div className="mt-1 text-3xl leading-none font-black text-yellow-500">
                {turnSkipsRemaining === 'Infinite' ? '∞' : turnSkipsRemaining}
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
                className={`flex flex-col items-center transition-all duration-300 ${
                  isCritical
                    ? 'translate-y-2 scale-125'
                    : isWarning
                      ? 'translate-y-1 scale-110'
                      : ''
                }`}
              >
                <span
                  className={`font-mono leading-none font-black transition-colors duration-300 ${
                    isCritical
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
              className={`animate-pop-in relative text-center leading-tight font-black break-words text-slate-900 drop-shadow-sm select-none ${getFontSize(displayWord)}`}
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

      <Overlay isOpen={isPaused} className="space-y-8 p-6">
          {view === 'PAUSED' && !showQuitConfirm && (
            <div className="flex w-full flex-col space-y-8 p-6">
              <h2 className="text-center text-4xl font-black text-slate-900">
                GAME PAUSED
              </h2>

              <div className="space-y-4">
                <Button
                  variant="primary"
                  size="xl"
                  fullWidth
                  onClick={handleResume}
                >
                  RESUME
                </Button>

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

                <div className="pt-4">
                  <Button
                    variant="ghost"
                    size="lg"
                    fullWidth
                    onClick={() => setShowQuitConfirm(true)}
                    className="bg-red-50 text-red-500 hover:bg-red-100"
                  >
                    QUIT GAME
                  </Button>
                </div>
              </div>
            </div>
          )}

          {view === 'SETTINGS' && (
            <div className="flex h-full w-full flex-col bg-slate-50">
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

          {showQuitConfirm && (
            <div className="flex w-full max-w-sm flex-col space-y-6 p-6">
              <h2 className="text-center text-3xl font-black text-slate-900">
                EXIT TO MENU?
              </h2>
              <p className="-mt-4 text-center font-bold text-slate-500">
                Current game progress will be lost.
              </p>

              <div className="w-full max-w-sm space-y-4">
                <Button
                  variant="danger"
                  size="xl"
                  fullWidth
                  onClick={resetGame}
                >
                  YES, EXIT GAME
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={() => setShowQuitConfirm(false)}
                >
                  CANCEL
                </Button>
              </div>
            </div>
          )}
      </Overlay>
    </div>
  );
};

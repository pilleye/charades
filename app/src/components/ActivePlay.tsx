'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { soundEngine } from '@/lib/audio';
import { wakeLockManager } from '@/lib/wakeLock';
import { Button } from './ui/Button';
import { TEAM_COLORS } from '@/constants';

// Icons
const SkipIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={3}
    stroke="currentColor"
    className="h-8 w-8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={3}
    stroke="currentColor"
    className="h-10 w-10"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

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

const CogIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className="h-5 w-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.217.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.581-.495.644-.869l.214-1.281z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const BackIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={3}
    stroke="currentColor"
    className="h-6 w-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </svg>
);

// Internal Component for Hint Logic

const HintDisplay = ({ hint }: { hint: string }) => {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="mt-8 flex flex-col items-center">
      {!showHint ? (
        <button
          onClick={() => setShowHint(true)}
          className="animate-fade-in flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-bold text-yellow-600 transition-all hover:bg-yellow-100 active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.89 0 32.91 32.91 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zM8.05 14.943a33.54 33.54 0 003.9 0 2 2 0 00-3.9 0z" />
          </svg>
          NEED A HINT?
        </button>
      ) : (
        <div className="animate-fade-in-up max-w-lg rounded-xl border border-yellow-200 bg-yellow-50/80 px-4 py-3 text-center text-sm font-medium text-yellow-800 backdrop-blur-sm">
          <span className="mr-1 font-bold tracking-wider text-yellow-600 uppercase">
            Hint:
          </span>

          {hint}
        </div>
      )}
    </div>
  );
};

// Reusable Segmented Control (Copied from Setup.tsx for consistency)
const SegmentedControl = <T,>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (val: T) => void;
}) => {
  const activeIndex = options.findIndex((o) => o.value === value);
  const widthPercent = 100 / options.length;

  return (
    <div className="relative flex h-12 items-center rounded-2xl border border-slate-100 bg-slate-100 p-1">
      <div
        className="absolute top-1 bottom-1 rounded-xl bg-white shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{
          width: `calc(${widthPercent}% - 0.5rem)`,
          left: `calc(${activeIndex * widthPercent}% + 0.25rem)`,
        }}
      />
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          className={`relative z-10 flex-1 text-xs font-black tracking-wide uppercase transition-colors ${value === opt.value ? 'text-blue-600' : 'text-slate-400'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

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

        <div className="relative flex flex-1 flex-col overflow-hidden">
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
              {/* Team Name Badge */}

              <div className="animate-fade-in mb-2 rounded-full border border-white/50 bg-white/60 px-3 py-1 shadow-sm backdrop-blur-sm">
                <span className="block max-w-[150px] truncate text-xs leading-none font-black tracking-widest text-slate-500 uppercase">
                  {currentTeam.name}
                </span>
              </div>

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

            {/* Hint Section */}
            {displayHint && hintsEnabled && (
              <HintDisplay key={displayWord} hint={displayHint} />
            )}
          </div>
        </div>

        {/* Right/Bottom Section: Controls */}
        {/* Landscape: Sidebar style */}
        <div className="relative z-20 flex h-[35vh] gap-4 p-4 landscape:h-full landscape:w-72 landscape:flex-col landscape:justify-center landscape:border-l landscape:border-slate-100 landscape:bg-white/60 landscape:pb-4 landscape:backdrop-blur-sm">
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

      {/* PAUSE MENU OVERLAY */}
      {isPaused && (
        <div className="animate-fade-in absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/95 backdrop-blur-sm">
          {view === 'PAUSED' && !showQuitConfirm && (
            <div className="flex w-full max-w-sm flex-col space-y-8 p-6">
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
                  {/* Duration Control */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-400 uppercase">
                      Round Timer
                    </label>
                    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-2">
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() =>
                          updateDurationInGame(Math.max(10, roundDuration - 10))
                        }
                        className="!h-12 !w-16 !px-0 text-xl"
                      >
                        -
                      </Button>
                      <div className="flex-1 text-center">
                        <span className="text-3xl font-black text-slate-800">
                          {roundDuration}
                        </span>
                        <span className="block text-xs font-bold text-slate-500">
                          SECONDS
                        </span>
                      </div>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => updateDurationInGame(roundDuration + 10)}
                        className="!h-12 !w-16 !px-0 text-xl"
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Skips Control */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-400 uppercase">
                      Skips Allowed
                    </label>
                    <div className="flex gap-2">
                      <div
                        className={`flex flex-1 items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-2 transition-opacity duration-200 ${skipsPerTurn === 'Infinite' ? 'opacity-40 grayscale' : ''}`}
                      >
                        <Button
                          variant="secondary"
                          size="md"
                          onClick={() =>
                            typeof skipsPerTurn === 'number' &&
                            updateSkipsPerTurn(Math.max(0, skipsPerTurn - 1))
                          }
                          disabled={
                            skipsPerTurn === 'Infinite' ||
                            (typeof skipsPerTurn === 'number' &&
                              skipsPerTurn <= 0)
                          }
                          className="!h-12 !w-14 !px-0 text-xl"
                        >
                          -
                        </Button>
                        <div className="flex-1 text-center">
                          <span className="text-3xl font-black text-yellow-500">
                            {skipsPerTurn === 'Infinite'
                              ? lastSkipsValue
                              : skipsPerTurn}
                          </span>
                          <span className="mt-1 block text-xs leading-none font-bold text-slate-500">
                            PER TURN
                          </span>
                        </div>
                        <Button
                          variant="secondary"
                          size="md"
                          onClick={() =>
                            typeof skipsPerTurn === 'number' &&
                            updateSkipsPerTurn(Math.min(10, skipsPerTurn + 1))
                          }
                          disabled={skipsPerTurn === 'Infinite'}
                          className="!h-12 !w-14 !px-0 text-xl"
                        >
                          +
                        </Button>
                      </div>

                      <button
                        onClick={toggleInfiniteSkips}
                        className={`flex w-16 items-center justify-center rounded-2xl border text-xl font-bold transition-all active:scale-95 ${skipsPerTurn === 'Infinite' ? 'border-yellow-200 bg-yellow-100 text-yellow-600 shadow-inner' : 'border-slate-200 bg-white text-slate-300 hover:border-slate-300'} `}
                      >
                        ∞
                      </button>
                    </div>
                  </div>

                  {/* Rounds Control */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-400 uppercase">
                      Total Rounds
                    </label>
                    <div className="flex gap-2">
                      <div
                        className={`flex flex-1 items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-2 transition-opacity duration-200 ${totalRounds === 'Infinite' ? 'opacity-40 grayscale' : ''}`}
                      >
                        <Button
                          variant="secondary"
                          size="md"
                          onClick={() =>
                            typeof totalRounds === 'number' &&
                            updateTotalRounds(
                              Math.max(currentRound, totalRounds - 1)
                            )
                          }
                          disabled={
                            totalRounds === 'Infinite' ||
                            (typeof totalRounds === 'number' &&
                              totalRounds <= currentRound)
                          }
                          className="!h-12 !w-14 !px-0 text-xl"
                        >
                          -
                        </Button>
                        <div className="flex-1 text-center">
                          <span className="text-3xl font-black text-indigo-500">
                            {totalRounds === 'Infinite'
                              ? lastRoundsValue
                              : totalRounds}
                          </span>
                          <span className="mt-1 block text-xs leading-none font-bold text-slate-500">
                            ROUNDS
                          </span>
                        </div>
                        <Button
                          variant="secondary"
                          size="md"
                          onClick={() =>
                            typeof totalRounds === 'number' &&
                            updateTotalRounds(totalRounds + 1)
                          }
                          disabled={totalRounds === 'Infinite'}
                          className="!h-12 !w-14 !px-0 text-xl"
                        >
                          +
                        </Button>
                      </div>

                      <button
                        onClick={toggleInfiniteRounds}
                        className={`flex w-16 items-center justify-center rounded-2xl border text-xl font-bold transition-all active:scale-95 ${totalRounds === 'Infinite' ? 'border-indigo-200 bg-indigo-100 text-indigo-600 shadow-inner' : 'border-slate-200 bg-white text-slate-300 hover:border-slate-300'} `}
                      >
                        ∞
                      </button>
                    </div>
                  </div>

                  {/* Hints Toggle */}
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
        </div>
      )}
    </div>
  );
};

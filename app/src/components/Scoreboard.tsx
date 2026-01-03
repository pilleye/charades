'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from './ui/Button';
import { HomeIcon } from './ui/Icons';
import { RankBadge } from './ui/Badge';
import { StatusIndicator } from './ui/StatusIndicator';
import { Overlay } from './ui/Modal';
import { TEAM_COLORS } from '@/constants';

export const Scoreboard: React.FC = () => {
  const {
    teams,
    nextTeam,
    resetGame,
    availableWords,
    currentRound,
    totalRounds,
    currentTeamIndex,
  } = useGameStore();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Determine Game State logic for UI
  const isRoundComplete = currentTeamIndex === teams.length - 1;
  const isGameComplete =
    isRoundComplete &&
    totalRounds !== 'unlimited' &&
    currentRound >= totalRounds;

  const isDarkMode = isRoundComplete || isGameComplete;

  const getButtonText = () => {
    if (isGameComplete) return 'FINISH GAME';
    if (isRoundComplete) return `START ROUND ${currentRound + 1}`;
    return 'NEXT TEAM';
  };

  const getHeaderText = () => {
    if (isGameComplete) return 'Final Results';
    if (isRoundComplete) return `End of Round ${currentRound}`;
    return `Round ${currentRound} Standings`;
  };

  const getMainTitle = () => {
    if (isGameComplete) return 'GAME OVER';
    if (isRoundComplete) return 'ROUND COMPLETE';
    return 'LEADERBOARD';
  };

  // Sort logic for display, but we need original index for "Played" status
  const sortedTeams = [...teams]
    .map((t, originalIndex) => ({ ...t, originalIndex }))
    .sort((a, b) => b.score - a.score);

  const containerClass = isDarkMode ? 'bg-slate-900' : 'bg-slate-50';
  const textMainClass = isDarkMode ? 'text-white' : 'text-slate-900';
  const textSubClass = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const cardClass = isDarkMode
    ? 'bg-slate-800 border-slate-700'
    : 'bg-white border-slate-100';
  const rankBgClass = isDarkMode
    ? 'bg-slate-900 border-slate-700'
    : 'bg-slate-50 border-slate-100';

  return (
    <div
      className={`flex h-full w-full flex-col ${containerClass} relative py-6 transition-colors duration-500 safe-screen`}
    >
      {/* Background Decor for Round Complete */}
      {isDarkMode && (
        <>
          <div className="pointer-events-none absolute top-0 right-0 left-0 h-64 bg-gradient-to-b from-blue-900/20 to-transparent"></div>
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-64 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
        </>
      )}

      <header className="relative z-10 flex shrink-0 items-center justify-center py-6 text-center">
        <div className="flex flex-col items-center">
          <h1
            className={`text-3xl font-black tracking-widest uppercase ${textMainClass}`}
          >
            {getMainTitle()}
          </h1>
          <p
            className={`${textSubClass} mt-2 text-sm font-bold tracking-wide uppercase ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200/50'} rounded-full px-3 py-1`}
          >
            {getHeaderText()}
          </p>
        </div>

        {/* Subtle Exit Button Top Right */}
        <div className="absolute top-1/2 right-0 mt-2 -translate-y-1/2">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="p-3 text-slate-400 transition-colors hover:text-red-400"
            aria-label="Exit Game"
          >
            <HomeIcon />
          </button>
        </div>
      </header>

      <div className="mask-fade-y relative z-10 flex-1 space-y-4 overflow-y-auto px-1 pb-4">
        {sortedTeams.map((team, rank) => {
          // A team has played this round if their original index is <= the current index
          // (Since currentTeamIndex points to the one who just finished)
          const hasPlayedThisRound = team.originalIndex <= currentTeamIndex;

          return (
            <div
              key={team.id}
              className={`relative flex items-center overflow-hidden rounded-3xl border p-1 shadow-sm transition-all ${cardClass} ${hasPlayedThisRound ? '' : 'opacity-80'} `}
            >
              {/* Rank Badge */}
              <div
                className={`absolute top-0 bottom-0 left-0 z-10 flex w-16 items-center justify-center border-r ${rankBgClass}`}
              >
                <RankBadge rank={rank} isDark={isDarkMode} />
              </div>

              {/* Team Info */}
              <div className="relative z-0 flex flex-1 items-center justify-between py-4 pr-4 pl-20">
                <div
                  className={`absolute top-0 bottom-0 left-0 w-2 ${TEAM_COLORS[team.colorIndex % TEAM_COLORS.length]}`}
                ></div>

                <div className="flex flex-col gap-1">
                  <h3
                    className={`max-w-[140px] truncate text-xl leading-none font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}
                  >
                    {team.name}
                  </h3>
                  {!isGameComplete && (
                    <div className="flex">
                      <StatusIndicator
                        played={hasPlayedThisRound}
                        isDark={isDarkMode}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end">
                  <div
                    className={`text-4xl leading-none font-black ${textMainClass}`}
                  >
                    {team.score % 1 === 0 ? team.score : team.score.toFixed(1)}
                  </div>
                  <span
                    className={`text-[10px] font-bold tracking-wider uppercase ${textSubClass}`}
                  >
                    Points
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative z-10 mt-4 flex shrink-0 flex-col items-center gap-4">
        {!isGameComplete && (
          <div
            className={`${textSubClass} text-xs font-medium ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'} rounded-full border px-4 py-2 tracking-wide uppercase`}
          >
            {availableWords.length} cards remaining in deck
          </div>
        )}

        <div className="w-full">
          <Button
            variant={
              isGameComplete
                ? 'primary'
                : isRoundComplete
                  ? 'primary'
                  : 'success'
            }
            fullWidth
            size="xl"
            onClick={nextTeam}
            className={
              isRoundComplete && !isGameComplete
                ? 'border-blue-900 shadow-blue-900'
                : ''
            }
          >
            {getButtonText()}
          </Button>
        </div>
      </div>

      <Overlay 
        isOpen={showExitConfirm} 
        isDark={isDarkMode}
        className="space-y-8 p-6"
      >
          <h2 className={`text-3xl font-black ${textMainClass} text-center`}>
            EXIT TO MENU?
          </h2>
          <p className={`${textSubClass} -mt-4 text-center font-bold`}>
            Current game progress will be lost.
          </p>

          <div className="w-full max-w-sm space-y-4">
            <Button variant="danger" size="xl" fullWidth onClick={resetGame}>
              YES, EXIT GAME
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => setShowExitConfirm(false)}
              className={
                isDarkMode ? 'bg-slate-700 text-slate-200 shadow-slate-900' : ''
              }
            >
              CANCEL
            </Button>
          </div>
      </Overlay>
    </div>
  );
};

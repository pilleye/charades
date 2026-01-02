'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from './ui/Button';
import { TEAM_COLORS } from '@/constants';

// --- Icons ---
const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="h-6 w-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
    />
  </svg>
);

const RankBadge = ({ rank, isDark }: { rank: number; isDark: boolean }) => {
  const baseClasses =
    'w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-sm';

  if (rank === 0)
    return (
      <div
        className={`${baseClasses} border-2 border-yellow-500 bg-yellow-400 text-yellow-900`}
      >
        1
      </div>
    );
  if (rank === 1)
    return (
      <div
        className={`${baseClasses} border-2 border-slate-400 bg-slate-300 text-slate-800`}
      >
        2
      </div>
    );
  if (rank === 2)
    return (
      <div
        className={`${baseClasses} border-2 border-orange-400 bg-orange-300 text-orange-900`}
      >
        3
      </div>
    );

  return (
    <span
      className={`text-xl font-black ${isDark ? 'text-slate-500' : 'text-slate-400'} opacity-60`}
    >
      #{rank + 1}
    </span>
  );
};

const StatusIcon = ({
  played,
  isDark,
}: {
  played: boolean;
  isDark: boolean;
}) => {
  if (played) {
    return (
      <div
        className={`flex items-center gap-1 rounded-lg px-2 py-1 ${isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path
            fillRule="evenodd"
            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-[10px] font-bold tracking-wide uppercase">
          Done
        </span>
      </div>
    );
  }
  return (
    <div
      className={`flex items-center gap-1 rounded-lg px-2 py-1 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-[10px] font-bold tracking-wide uppercase">
        Waiting
      </span>
    </div>
  );
};

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
    totalRounds !== 'Infinite' &&
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
      className={`flex h-full w-full flex-col ${containerClass} relative p-6 transition-colors duration-500`}
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
                      <StatusIcon
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

      {/* Exit Confirmation Overlay */}
      {showExitConfirm && (
        <div
          className={`absolute inset-0 z-50 ${isDarkMode ? 'bg-slate-900/95' : 'bg-slate-50/95'} animate-fade-in flex flex-col items-center justify-center space-y-8 p-6 backdrop-blur-sm`}
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
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { useGameStore, GamePhase } from '@/store/gameStore';
import { Button } from './ui/Button';
import { HomeIcon } from './ui/Icons';
import { RankBadge } from './ui/Badge';
import { StatusIndicator } from './ui/StatusIndicator';
import { ConfirmationModal } from './ui/ConfirmationModal';
import { TEAM_COLORS } from '@/constants';

export const Scoreboard: React.FC = () => {
  const {
    teams,
    gameState,
    nextTeam,
    resetGame,
    availableWords,
    currentRound,
    totalRounds,
  } = useGameStore();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  if (gameState.phase !== GamePhase.SCOREBOARD) return null;
  const { currentTeamIndex } = gameState;

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
    if (isGameComplete) return 'RESULTS';
    return 'STANDINGS';
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
      className={`flex h-full w-full flex-col ${containerClass} relative transition-colors duration-500 overflow-hidden`}
    >
      {/* Top safe area spacer to match ActivePlay */}
      <div className="safe-top-spacer shrink-0" />

      {/* Background Decor for Round Complete */}
      {isDarkMode && (
        <>
          <div className="pointer-events-none absolute top-0 right-0 left-0 h-64 bg-gradient-to-b from-blue-900/20 to-transparent"></div>
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-64 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
        </>
      )}

      <header className="relative z-10 flex shrink-0 flex-col p-4 pt-4">
        <div className="flex w-full items-start justify-between">
          <div className="flex flex-grow flex-col items-start sm:items-center pt-2">
            <h1
              className={`text-3xl font-black tracking-[0.1em] uppercase ${textMainClass} drop-shadow-sm`}
            >
              {getMainTitle()}
            </h1>
            
            <div className="mt-3">
              <p
                className={`${textSubClass} text-[10px] font-black tracking-[0.2em] uppercase ${
                  isDarkMode ? 'bg-slate-800' : 'bg-slate-200/50'
                } rounded-full px-5 py-2 shadow-sm whitespace-nowrap`}
              >
                {getHeaderText()}
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowExitConfirm(true)}
              className={`rounded-2xl border shadow-sm transition-all p-3 active:scale-95 ${
                isDarkMode 
                  ? 'border-slate-700 bg-slate-800 text-slate-400 active:bg-slate-700 active:text-white' 
                  : 'border-slate-200 bg-white text-slate-400 active:bg-slate-50 active:text-slate-900'
              }`}
              aria-label="Exit Game"
            >
              <HomeIcon className="h-8 w-8" />
            </button>
          </div>
        </div>
      </header>

      <div className="mask-fade-y relative z-10 flex-1 space-y-4 overflow-y-auto px-4 pt-4 pb-4">
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

      <div className="relative z-10 mt-4 flex shrink-0 flex-col items-center gap-4 px-6">
        {!isGameComplete && (
          <div
            className={`${textSubClass} text-xs font-medium ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'} rounded-full border px-4 py-2 tracking-wide uppercase`}
          >
            {availableWords.length} cards remaining in deck
          </div>
        )}

        <div className="w-full pb-8">
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

      <ConfirmationModal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={resetGame}
        title="EXIT TO MENU?"
        message="Current game progress will be lost."
        isDark={isDarkMode}
      />
    </div>
  );
};
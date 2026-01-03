'use client';

import React, { useState } from 'react';
import { useGameStore, GamePhase, WordStatus } from '@/store/gameStore';
import { Button } from './ui/Button';
import { RecoverIcon } from './ui/Icons';
import { TeamBadge } from './ui/TeamBadge';
import { TEAM_COLORS } from '@/constants';

export const Review: React.FC = () => {
  const {
    gameState,
    updateReviewWord,
    applyReviewScores,
    pointsPerWord,
    secondChanceValue,
    secondChanceEnabled,
    teams,
  } = useGameStore();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (gameState.phase !== GamePhase.REVIEW) return null;

  const { currentTeamIndex, wordsPlayed: currentTurnWords } = gameState;
  const currentTeam = teams[currentTeamIndex];
  const teamColorBg = TEAM_COLORS[currentTeam.colorIndex % TEAM_COLORS.length];
  
  const handleSelectStatus = (
    index: number,
    status: WordStatus
  ) => {
    updateReviewWord(index, status);
    setExpandedIndex(null);
  };

  const getStatusStyles = (status: WordStatus) => {
    switch (status) {
      case WordStatus.GOT_IT:
        return 'bg-green-100 border-green-200 text-green-800';
      case WordStatus.RECOVERED:
      case WordStatus.SECOND_CHANCE:
        return 'bg-indigo-100 border-indigo-200 text-indigo-800';
      case WordStatus.SKIPPED:
        return 'bg-slate-100 border-slate-200 text-slate-400 opacity-75';
      default:
        return 'bg-slate-50 border-slate-100';
    }
  };

  const getStatusIcon = (status: WordStatus) => {
    const iconContainerClass = 'h-6 flex items-center justify-center mb-1';
    const labelClass =
      'text-[10px] font-bold uppercase tracking-wider leading-none';

    switch (status) {
      case WordStatus.GOT_IT:
        return (
          <div className="flex w-16 flex-col items-center text-inherit">
            <div className={iconContainerClass}>
              <span className="text-xl leading-none font-black">✓</span>
            </div>
            <span className={labelClass}>Got It</span>
          </div>
        );
      case WordStatus.RECOVERED:
      case WordStatus.SECOND_CHANCE:
        return (
          <div className="flex w-16 flex-col items-center text-inherit">
            <div className={iconContainerClass}>
              <RecoverIcon />
            </div>
            <span className={labelClass}>Recovery</span>
          </div>
        );
      default:
        return (
          <div className="flex w-16 flex-col items-center text-inherit">
            <div className={iconContainerClass}>
              <span className="text-xl leading-none font-black">✕</span>
            </div>
            <span className={labelClass}>Missed</span>
          </div>
        );
    }
  };

  const roundScore = currentTurnWords.reduce((acc, word) => {
    if (word.status === WordStatus.GOT_IT) return acc + pointsPerWord;
    if (word.status === WordStatus.RECOVERED || word.status === WordStatus.SECOND_CHANCE)
      return acc + pointsPerWord * secondChanceValue;
    return acc;
  }, 0);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-slate-50 py-6 safe-screen">
      {/* Header Background Glow */}
      <div
        className={`absolute top-[-30%] left-1/2 h-[60%] w-[150%] -translate-x-1/2 ${teamColorBg} pointer-events-none z-0 rounded-[100%] opacity-20 blur-[100px]`}
      />

      <header className="relative z-10 shrink-0 py-6 text-center">
        <TeamBadge 
          name={currentTeam.name}
          colorIndex={currentTeam.colorIndex}
          variant="compact"
          className="mb-3"
        />
        <h2 className="mb-2 text-sm font-black tracking-widest text-slate-400 uppercase">
          Round Score
        </h2>
        <div className="text-6xl font-black text-slate-900 drop-shadow-sm">
          {roundScore}
        </div>
      </header>

      <div className="mask-fade-y relative z-10 flex-1 space-y-3 overflow-y-auto py-2 pr-1">
        {currentTurnWords.length === 0 && (
          <div className="flex h-full items-center justify-center font-medium text-slate-400">
            No cards played this turn.
          </div>
        )}
        {currentTurnWords.map((item, index) => {
          const isExpanded = expandedIndex === index;

          return (
            <div
              key={index}
              className={`flex w-full flex-col overflow-hidden rounded-2xl border-2 shadow-sm transition-all duration-300 ${isExpanded ? 'z-10 border-blue-400 bg-white ring-4 ring-blue-100' : getStatusStyles(item.status)} `}
            >
              {/* Row Header - Click to Expand */}
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="flex cursor-pointer touch-manipulation items-center justify-between p-4 active:opacity-70"
              >
                <span
                  className={`flex-1 truncate pr-4 text-left text-xl font-bold select-none ${isExpanded ? 'text-slate-800' : ''}`}
                >
                  {item.word}
                </span>

                <div className="flex shrink-0 items-center gap-2">
                  <div className="pointer-events-none opacity-90">
                    {getStatusIcon(item.status)}
                  </div>
                </div>
              </div>

              {/* Expandable Options Panel */}
              {isExpanded && (
                <div className={`animate-fade-in grid gap-2 p-2 pt-0 pb-3 ${secondChanceEnabled ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectStatus(index, WordStatus.SKIPPED);
                    }}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl border-b-[3px] px-1 py-3 text-xs font-bold tracking-wider uppercase transition-all active:translate-y-[3px] active:border-b-0 ${item.status === WordStatus.SKIPPED ? 'border-slate-900 bg-slate-700 text-white shadow-lg' : 'border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-200'} `}
                  >
                    <span className="mb-1 text-lg leading-none">✕</span>
                    Missed
                  </button>

                  {secondChanceEnabled && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectStatus(index, WordStatus.RECOVERED);
                      }}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border-b-[3px] px-1 py-3 text-xs font-bold tracking-wider uppercase transition-all active:translate-y-[3px] active:border-b-0 ${item.status === WordStatus.RECOVERED || item.status === WordStatus.SECOND_CHANCE ? 'border-indigo-700 bg-indigo-500 text-white shadow-lg' : 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'} `}
                    >
                      <RecoverIcon />
                      Recovery
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectStatus(index, WordStatus.GOT_IT);
                    }}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl border-b-[3px] px-1 py-3 text-xs font-bold tracking-wider uppercase transition-all active:translate-y-[3px] active:border-b-0 ${item.status === WordStatus.GOT_IT ? 'border-green-700 bg-green-500 text-white shadow-lg' : 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100'} `}
                  >
                    <span className="mb-1 text-lg leading-none">✓</span>
                    Got It
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="relative z-10 mt-6 shrink-0 border-t border-slate-200 pt-2">
        <Button
          variant="primary"
          fullWidth
          size="xl"
          onClick={applyReviewScores}
        >
          CONFIRM SCORES
        </Button>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { useGameStore, type WordResult } from '@/store/gameStore';
import { Button } from './ui/Button';
import { TEAM_COLORS } from '@/constants';

// Reuse the same sparkle icon for consistency
const RecoverIconSmall = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={3}
    stroke="currentColor"
    className="h-5 w-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
    />
  </svg>
);

export const Review: React.FC = () => {
  const {
    currentTurnWords,
    updateReviewWord,
    applyReviewScores,
    pointsPerWord,
    secondChanceValue,
    teams,
    currentTeamIndex,
  } = useGameStore();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const currentTeam = teams[currentTeamIndex];
  const teamColorBg = TEAM_COLORS[currentTeam.colorIndex % TEAM_COLORS.length];

  const handleSelectStatus = (
    index: number,
    status: 'GOT_IT' | 'SKIPPED' | 'SECOND_CHANCE'
  ) => {
    updateReviewWord(index, status);
    setExpandedIndex(null);
  };

  const getStatusStyles = (status: WordResult['status']) => {
    switch (status) {
      case 'GOT_IT':
        return 'bg-green-100 border-green-200 text-green-800';
      case 'SECOND_CHANCE':
        return 'bg-indigo-100 border-indigo-200 text-indigo-800';
      case 'SKIPPED':
      case 'UNPLAYED':
        return 'bg-slate-100 border-slate-200 text-slate-400 opacity-75';
      default:
        return 'bg-slate-50 border-slate-100';
    }
  };

  const getStatusIcon = (status: WordResult['status']) => {
    const iconContainerClass = 'h-6 flex items-center justify-center mb-1';
    const labelClass =
      'text-[10px] font-bold uppercase tracking-wider leading-none';

    switch (status) {
      case 'GOT_IT':
        return (
          <div className="flex w-16 flex-col items-center text-inherit">
            <div className={iconContainerClass}>
              <span className="text-xl leading-none font-black">✓</span>
            </div>
            <span className={labelClass}>Got It</span>
          </div>
        );
      case 'SECOND_CHANCE':
        return (
          <div className="flex w-16 flex-col items-center text-inherit">
            <div className={iconContainerClass}>
              <RecoverIconSmall />
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
    if (word.status === 'GOT_IT') return acc + pointsPerWord;
    if (word.status === 'SECOND_CHANCE')
      return acc + pointsPerWord * secondChanceValue;
    return acc;
  }, 0);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-slate-50 p-6">
      {/* Ambient Background - Top wash only */}
      <div
        className={`absolute top-[-30%] left-1/2 h-[60%] w-[150%] -translate-x-1/2 ${teamColorBg} pointer-events-none z-0 rounded-[100%] opacity-20 blur-[80px]`}
      />

      <header className="relative z-10 shrink-0 py-6 text-center">
        <div className="mb-3 inline-block rounded-full border border-slate-100 bg-white px-3 py-1 shadow-sm">
          <span className="text-xs font-black tracking-widest text-slate-500 uppercase">
            {currentTeam.name}
          </span>
        </div>
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
                <div className="animate-fade-in grid grid-cols-3 gap-2 p-2 pt-0 pb-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectStatus(index, 'SKIPPED');
                    }}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl border-b-[3px] px-1 py-3 text-xs font-bold tracking-wider uppercase transition-all active:translate-y-[3px] active:border-b-0 ${item.status === 'SKIPPED' ? 'border-slate-900 bg-slate-700 text-white shadow-lg' : 'border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-200'} `}
                  >
                    <span className="mb-1 text-lg leading-none">✕</span>
                    Missed
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectStatus(index, 'SECOND_CHANCE');
                    }}
                    disabled={secondChanceValue === 0}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl border-b-[3px] px-1 py-3 text-xs font-bold tracking-wider uppercase transition-all active:translate-y-[3px] active:border-b-0 ${secondChanceValue === 0 ? 'cursor-not-allowed border-slate-200 bg-slate-100 opacity-30 grayscale' : ''} ${item.status === 'SECOND_CHANCE' ? 'border-indigo-700 bg-indigo-500 text-white shadow-lg' : 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'} `}
                  >
                    <RecoverIconSmall />
                    Recovery
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectStatus(index, 'GOT_IT');
                    }}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl border-b-[3px] px-1 py-3 text-xs font-bold tracking-wider uppercase transition-all active:translate-y-[3px] active:border-b-0 ${item.status === 'GOT_IT' ? 'border-green-700 bg-green-500 text-white shadow-lg' : 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100'} `}
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

import React, { useState } from 'react';
import { HintIcon } from './Icons';

interface HintDisplayProps {
  hint: string;
  className?: string;
}

export const HintDisplay: React.FC<HintDisplayProps> = ({ hint, className = '' }) => {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className={`mt-8 flex flex-col items-center ${className}`}>
      {!showHint ? (
        <button
          onClick={() => setShowHint(true)}
          className="animate-fade-in flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-bold text-yellow-600 transition-all hover:bg-yellow-100 active:scale-95"
        >
          <HintIcon />
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
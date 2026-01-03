import React, { useState } from 'react';
import { HintIcon } from './Icons';

interface HintDisplayProps {

  hint: string;

  className?: string;

  isDark?: boolean;

}



export const HintDisplay: React.FC<HintDisplayProps> = ({ hint, className = '', isDark = false }) => {

  const [showHint, setShowHint] = useState(false);



  const buttonClasses = isDark

    ? 'border-indigo-500/30 bg-indigo-900/40 text-indigo-300 hover:bg-indigo-900/60'

    : 'border-yellow-200 bg-yellow-50 text-yellow-600 hover:bg-yellow-100';



  const contentClasses = isDark

    ? 'border-indigo-500/30 bg-indigo-900/60 text-indigo-100'

    : 'border-yellow-200 bg-yellow-50/80 text-yellow-800';



  const labelClasses = isDark ? 'text-indigo-400' : 'text-yellow-600';



  return (

    <div className={`mt-8 flex flex-col items-center ${className}`}>

      {!showHint ? (

        <button

          onClick={() => setShowHint(true)}

          className={`animate-fade-in flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-all active:scale-95 ${buttonClasses}`}

        >

          <HintIcon />

          NEED A HINT?

        </button>

      ) : (

        <div className={`animate-fade-in-up max-w-lg rounded-xl border px-4 py-3 text-center text-sm font-medium backdrop-blur-sm ${contentClasses}`}>

          <span className={`mr-1 font-bold tracking-wider uppercase ${labelClasses}`}>

            Hint:

          </span>

          {hint}

        </div>

      )}

    </div>

  );

};

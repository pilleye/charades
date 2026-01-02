import React from 'react';

interface StatusIndicatorProps {
  played: boolean;
  isDark?: boolean;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  played, 
  isDark = false, 
  className = '' 
}) => {
  if (played) {
    return (
      <div
        className={`flex items-center gap-1 rounded-lg px-2 py-1 ${
          isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
        } ${className}`}
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
      className={`flex items-center gap-1 rounded-lg px-2 py-1 ${
        isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
      } ${className}`}
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
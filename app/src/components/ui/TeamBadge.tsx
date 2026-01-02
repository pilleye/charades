import React from 'react';
import { TEAM_COLORS } from '@/constants';

interface TeamBadgeProps {
  name: string;
  colorIndex: number;
  className?: string;
  variant?: 'default' | 'compact';
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  name,
  colorIndex,
  className = '',
  variant = 'default',
}) => {
  const teamColor = TEAM_COLORS[colorIndex % TEAM_COLORS.length];

  if (variant === 'compact') {
    return (
      <div className={`inline-block rounded-full border border-white/50 bg-white/60 px-3 py-1 shadow-sm backdrop-blur-sm ${className}`}>
        <span className="block max-w-[150px] truncate text-xs leading-none font-black tracking-widest text-slate-500 uppercase">
          {name}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`h-3 w-3 rounded-full ${teamColor}`} />
      <span className="font-bold text-slate-700 truncate">{name}</span>
    </div>
  );
};

interface TeamColorButtonProps {
  colorIndex: number;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TeamColorButton: React.FC<TeamColorButtonProps> = ({
  colorIndex,
  onClick,
  size = 'md',
  className = '',
}) => {
  const teamColor = TEAM_COLORS[colorIndex % TEAM_COLORS.length];
  
  const sizes = {
    sm: 'h-8 w-10',
    md: 'h-10 w-12 sm:h-12 sm:w-16',
    lg: 'h-12 w-16',
  };

  return (
    <button
      onClick={onClick}
      className={`${sizes[size]} shrink-0 rounded-xl ${teamColor} flex items-center justify-center shadow-md transition-transform active:scale-95 ${className}`}
    >
      <div className="h-1.5 w-1.5 rounded-full bg-white/40 sm:h-2 sm:w-2" />
    </button>
  );
};
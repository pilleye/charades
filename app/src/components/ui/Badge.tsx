import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-full font-bold tracking-wide uppercase transition-all';

  const variants = {
    default: 'bg-slate-100 text-slate-600 border border-slate-200',
    success: 'bg-green-100 text-green-700 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    danger: 'bg-red-100 text-red-700 border border-red-200',
    info: 'bg-blue-100 text-blue-700 border border-blue-200',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

interface RankBadgeProps {
  rank: number;
  isDark?: boolean;
  className?: string;
}

export const RankBadge: React.FC<RankBadgeProps> = ({ rank, isDark = false, className = '' }) => {
  const baseClasses = 'w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-sm';

  if (rank === 0) {
    return (
      <div className={`${baseClasses} border-2 border-yellow-500 bg-yellow-400 text-yellow-900 ${className}`}>
        1
      </div>
    );
  }
  
  if (rank === 1) {
    return (
      <div className={`${baseClasses} border-2 border-slate-400 bg-slate-300 text-slate-800 ${className}`}>
        2
      </div>
    );
  }
  
  if (rank === 2) {
    return (
      <div className={`${baseClasses} border-2 border-orange-400 bg-orange-300 text-orange-900 ${className}`}>
        3
      </div>
    );
  }

  return (
    <span className={`text-xl font-black ${isDark ? 'text-slate-500' : 'text-slate-400'} opacity-60 ${className}`}>
      #{rank + 1}
    </span>
  );
};
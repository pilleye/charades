import React from 'react';
import { Button } from './Button';

interface NumberControlProps {
  label: string;
  value: number | string;
  onDecrease: () => void;
  onIncrease: () => void;
  disabled?: boolean;
  unit?: string;
  className?: string;
}

export const NumberControl: React.FC<NumberControlProps> = ({
  label,
  value,
  onDecrease,
  onIncrease,
  disabled = false,
  unit,
  className = '',
}) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <label className="text-sm font-bold text-slate-400 uppercase">
      {label}
    </label>
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-2">
      <Button
        variant="secondary"
        size="md"
        onClick={onDecrease}
        disabled={disabled}
        className="!h-12 !w-16 !px-0 text-xl"
      >
        -
      </Button>
      <div className="flex-1 text-center">
        <span className="text-3xl font-black text-slate-800">
          {value}
        </span>
        {unit && (
          <span className="block text-xs font-bold text-slate-500">
            {unit}
          </span>
        )}
      </div>
      <Button
        variant="secondary"
        size="md"
        onClick={onIncrease}
        disabled={disabled}
        className="!h-12 !w-16 !px-0 text-xl"
      >
        +
      </Button>
    </div>
  </div>
);

interface InfiniteToggleControlProps {
  label: string;
  value: number | 'Infinite';
  onDecrease: () => void;
  onIncrease: () => void;
  onToggleInfinite: () => void;
  unit: string;
  color: 'yellow' | 'indigo' | 'blue';
  lastFiniteValue: number;
  className?: string;
}

export const InfiniteToggleControl: React.FC<InfiniteToggleControlProps> = ({
  label,
  value,
  onDecrease,
  onIncrease,
  onToggleInfinite,
  unit,
  color,
  lastFiniteValue,
  className = '',
}) => {
  const colorClasses = {
    yellow: {
      text: 'text-yellow-500',
      activeButton: 'border-yellow-200 bg-yellow-100 text-yellow-600 shadow-inner',
    },
    indigo: {
      text: 'text-indigo-500',
      activeButton: 'border-indigo-200 bg-indigo-100 text-indigo-600 shadow-inner',
    },
    blue: {
      text: 'text-blue-500',
      activeButton: 'border-blue-200 bg-blue-100 text-blue-600 shadow-inner',
    },
  };

  const isInfinite = value === 'Infinite';
  const displayValue = isInfinite ? lastFiniteValue : value;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-bold text-slate-400 uppercase">
        {label}
      </label>
      <div className="flex gap-2">
        <div
          className={`flex flex-1 items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-2 transition-opacity duration-200 ${
            isInfinite ? 'opacity-40 grayscale' : ''
          }`}
        >
          <Button
            variant="secondary"
            size="md"
            onClick={onDecrease}
            disabled={isInfinite}
            className="!h-12 !w-14 !px-0 text-xl"
          >
            -
          </Button>
          <div className="flex-1 text-center">
            <span className={`text-3xl font-black ${colorClasses[color].text}`}>
              {displayValue}
            </span>
            <span className="mt-1 block text-xs leading-none font-bold text-slate-500">
              {unit}
            </span>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={onIncrease}
            disabled={isInfinite}
            className="!h-12 !w-14 !px-0 text-xl"
          >
            +
          </Button>
        </div>

        <button
          onClick={onToggleInfinite}
          className={`flex w-16 items-center justify-center rounded-2xl border text-xl font-bold transition-all active:scale-95 ${
            isInfinite
              ? colorClasses[color].activeButton
              : 'border-slate-200 bg-white text-slate-300 hover:border-slate-300'
          }`}
        >
          ∞
        </button>
      </div>
    </div>
  );
};
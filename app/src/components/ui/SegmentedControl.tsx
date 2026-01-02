import React from 'react';

interface SegmentedControlProps<T> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export const SegmentedControl = <T,>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) => {
  const activeIndex = options.findIndex((o) => o.value === value);
  const widthPercent = 100 / options.length;

  return (
    <div className={`relative flex h-12 items-center rounded-2xl border border-slate-100 bg-slate-100 p-1 ${className}`}>
      <div
        className="absolute top-1 bottom-1 rounded-xl bg-white shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{
          width: `calc(${widthPercent}% - 0.5rem)`,
          left: `calc(${activeIndex * widthPercent}% + 0.25rem)`,
        }}
      />
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          className={`relative z-10 flex-1 text-xs font-black tracking-wide uppercase transition-colors ${
            value === opt.value ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
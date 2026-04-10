'use client';

import { m, useReducedMotion } from 'motion/react';

export type FilterMode = 'all' | 'pending' | 'completed';

interface FilterOption {
  mode: FilterMode;
  label: string;
  count: number;
}

interface FilterBarProps {
  options: FilterOption[];
  activeMode: FilterMode;
  onChange: (mode: FilterMode) => void;
}

export function FilterBar({ options, activeMode, onChange }: FilterBarProps) {
  const prefersReduced = useReducedMotion();

  return (
    <div className="flex justify-center gap-2 mb-6">
      {options.map(({ mode, label, count }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={`relative px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors ${
            activeMode === mode
              ? 'text-white'
              : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
          }`}
        >
          {activeMode === mode && (
            <m.div
              className="absolute inset-0 bg-primary rounded-lg"
              layoutId={prefersReduced ? undefined : 'filter-pill'}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{label} (<span aria-live="polite">{count}</span>)</span>
        </button>
      ))}
    </div>
  );
}

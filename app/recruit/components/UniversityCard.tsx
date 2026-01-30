'use client';

import { memo } from 'react';
import type { University } from '@/app/data/universities';
import type { SupportStats } from '../types';

interface UniversityCardProps {
  university: University;
  stats?: SupportStats;
  isSelected: boolean;
  onClick: () => void;
}

function UniversityCardComponent({
  university,
  stats,
  isSelected,
  onClick,
}: UniversityCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-xl border transition-all duration-200
        ${isSelected
          ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
          : 'border-border-light bg-bg-card hover:border-primary/50 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-text-primary">{university.name}</h3>
          <p className="text-sm text-text-muted flex items-center gap-2 mt-1">
            <span>{university.city}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              university.type === 'public' ? 'bg-sky-100 text-sky-600' : 'bg-orange-100 text-orange-600'
            }`}>
              {university.type === 'public' ? '國立' : '私立'}
            </span>
          </p>
        </div>
        {stats && stats.total_supporters > 0 && (
          <div className="text-right">
            <p className="text-xl font-bold text-accent">{stats.total_supporters}</p>
            <p className="text-xs text-text-muted">人應援</p>
          </div>
        )}
      </div>
    </button>
  );
}

export const UniversityCard = memo(UniversityCardComponent);
export default UniversityCard;

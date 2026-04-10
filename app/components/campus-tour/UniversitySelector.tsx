'use client';

import { memo } from 'react';
import { getUniversitiesByCity, type University } from '@/app/data/universities';

interface UniversitySelectorProps {
  selectedCity: string | null;
  selectedUniversity: University | null;
  onSelectUniversity: (uni: University) => void;
}

interface UniversityCardProps {
  uni: University;
  isSelected: boolean;
  onSelect: (uni: University) => void;
}

const UniversityCard = memo(function UniversityCard({ uni, isSelected, onSelect }: UniversityCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onSelect(uni)}
      className={`
        flex items-center gap-2 rounded-xl px-4 py-3 min-h-[80px]
        text-left transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30
        ${isSelected
          ? 'border-2 border-primary bg-primary/10 shadow-sm shadow-primary/20'
          : 'border border-border bg-bg-card shadow-sm hover:shadow-md hover:border-primary/40'
        }
      `}
    >
      <span className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
        {uni.displayCode}
      </span>
      <span className="text-sm font-medium text-text-primary">
        {uni.name}
      </span>
    </button>
  );
});

function PlaceholderCard() {
  return (
    <div className="flex items-center gap-2 rounded-xl px-4 py-3 min-h-[80px] border border-gray-200 bg-gray-50/50">
      <span className="w-14 h-5 bg-gray-200 rounded" />
      <span className="w-24 h-4 bg-gray-200 rounded" />
    </div>
  );
}

export default function UniversitySelector({
  selectedCity,
  selectedUniversity,
  onSelectUniversity,
}: UniversitySelectorProps) {
  if (!selectedCity) {
    return (
      <div className="px-5 py-4">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-16 h-5 bg-gray-200 rounded" />
          <span className="w-12 h-4 bg-gray-200 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <PlaceholderCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  const unis = getUniversitiesByCity(selectedCity);

  if (unis.length === 0) {
    return (
      <div className="px-5 py-4 text-center text-sm text-text-muted">
        此城市目前沒有大學資料
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-base font-semibold text-text-primary">
          {selectedCity}
        </h3>
        <span className="text-xs text-text-muted bg-bg-secondary px-2 py-0.5 rounded-full">
          {unis.length} 所大學
        </span>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
        role="radiogroup"
        aria-label="選擇大學"
      >
        {unis.map(uni => (
          <UniversityCard
            key={uni.id}
            uni={uni}
            isSelected={selectedUniversity?.id === uni.id}
            onSelect={onSelectUniversity}
          />
        ))}
      </div>
    </div>
  );
}

'use client';

import { citiesByRegion, getUniversitiesByCity } from '@/app/data/universities';
import type { CityInfo } from '@/app/data/universities';

interface CitySelectorProps {
  selectedRegion: string;
  selectedCity: string | null;
  onSelectCity: (city: string) => void;
}

export default function CitySelector({
  selectedRegion,
  selectedCity,
  onSelectCity,
}: CitySelectorProps) {
  const cities = citiesByRegion[selectedRegion as keyof typeof citiesByRegion] || [];

  return (
    <div className="py-4 px-5">
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="城市選擇">
        {cities.map((city: CityInfo) => {
          const isSelected = selectedCity === city.name;
          const uniCount = getUniversitiesByCity(city.name).length;

          return (
            <button
              key={city.code}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectCity(city.name)}
              className={`
                shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                ${isSelected
                  ? 'bg-accent text-white shadow-sm shadow-accent/20'
                  : 'bg-bg-secondary text-text-secondary border border-border hover:text-text-primary hover:border-accent/40'
                }
              `}
            >
              {city.name}
              <span className={`ml-1 ${isSelected ? 'text-white/70' : 'text-text-muted'}`}>
                {uniCount}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Ambassador } from '@/app/types/ambassador';

export default function AmbassadorStatus() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAmbassadors() {
      const { data, error } = await supabase
        .from('ambassadors')
        .select('*')
        .order('ambassador_id', { ascending: true });

      if (error) {
        console.error('Error fetching ambassadors:', error);
      } else if (data) {
        setAmbassadors(data);
      }
      setIsLoading(false);
    }

    fetchAmbassadors();
  }, []);

  const aliveCount = ambassadors.filter((a) => a.is_alive).length;
  const totalCount = ambassadors.length;
  const survivalRate = totalCount > 0 ? Math.round((aliveCount / totalCount) * 100) : 0;

  const handleClick = (ambassador: Ambassador) => {
    if (!ambassador.is_alive) return;
    setSelectedId(selectedId === ambassador.id ? null : ambassador.id);
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!selectedId) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-ambassador-card]')) {
        setSelectedId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [selectedId]);

  return (
    <section id="ambassadors" className="bg-bg-card py-16 sm:py-20 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2 text-center relative pb-4">
          <span className="flex items-center justify-center gap-2">
            <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            校園大使存活狀態
          </span>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded" aria-hidden="true" />
        </h2>

        {/* Stats */}
        <div
          className="text-center mb-8 text-text-secondary text-sm sm:text-base"
          aria-live="polite"
        >
          <p>
            目前存活：
            <span className="text-primary font-bold text-lg sm:text-xl">{aliveCount}</span>
            <span className="text-text-muted"> / {totalCount}</span>
          </p>
          <p>
            存活率：
            <span className="text-primary font-bold">{survivalRate}%</span>
          </p>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {[...Array(21)].map((_, i) => (
              <div
                key={i}
                className="w-14 sm:w-16 h-12 sm:h-14 rounded-lg bg-bg-secondary animate-pulse"
              />
            ))}
          </div>
        ) : (
          /* Ambassador Grid */
          <div
            className="flex flex-wrap justify-center gap-2 sm:gap-3"
            role="list"
            aria-label="校園大使列表"
          >
            {ambassadors.map((ambassador) => {
              const isAlive = ambassador.is_alive;
              const isSelected = isAlive && selectedId === ambassador.id;

              return (
                <div
                  key={ambassador.id}
                  className="relative"
                  style={{ zIndex: isSelected ? 50 : 1 }}
                  role="listitem"
                  data-ambassador-card
                >
                  <button
                    type="button"
                    onClick={() => handleClick(ambassador)}
                    disabled={!isAlive}
                    aria-label={
                      isAlive
                        ? `${ambassador.name}，編號 ${ambassador.ambassador_id}${ambassador.school ? `，${ambassador.school}` : ''}，點擊查看詳情`
                        : `編號 ${ambassador.ambassador_id}，已淘汰`
                    }
                    aria-expanded={isSelected}
                    className={`
                      w-14 sm:w-16 p-1.5 sm:p-2 rounded-lg text-center transition-all duration-300 origin-center
                      focus:outline-none focus:ring-2 focus:ring-primary/30
                      ${isAlive
                        ? 'bg-success-light border-2 border-success hover:shadow-md'
                        : 'bg-bg-secondary border-2 border-border opacity-50 cursor-not-allowed'
                      }
                    `}
                    style={{
                      transform: isSelected ? 'scale(1.8)' : 'scale(1)',
                    }}
                  >
                    <div className={`text-[10px] sm:text-xs font-bold ${isAlive ? 'text-success' : 'text-text-muted'}`}>
                      #{ambassador.ambassador_id}
                    </div>

                    <div className={`text-xs sm:text-sm font-medium truncate ${isAlive ? 'text-success' : 'text-text-muted'}`}>
                      {isAlive ? ambassador.name : '✕'}
                    </div>
                  </button>

                  {/* Tooltip */}
                  {isSelected && ambassador.school && (
                    <div
                      className="absolute -top-8 left-1/2 -translate-x-1/2 z-50"
                      role="tooltip"
                    >
                      <div className="bg-text-primary text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        {ambassador.school}
                      </div>
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-text-primary"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-8 text-sm" role="legend" aria-label="狀態說明">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-success-light border-2 border-success rounded" aria-hidden="true" />
            <span className="text-text-secondary">存活中</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-bg-secondary border-2 border-border rounded" aria-hidden="true" />
            <span className="text-text-secondary">已淘汰</span>
          </div>
        </div>
      </div>
    </section>
  );
}

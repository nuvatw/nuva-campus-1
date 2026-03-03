'use client';

import { useEffect, useState } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { supabase } from '@/app/lib/supabase';
import { Ambassador } from '@/app/types/ambassador';
import { FadeIn } from '@/app/components/motion';
import { useReducedMotion } from '@/app/components/motion';
import { AnimatedCounter } from './AnimatedCounter';
import { spring } from '@/app/styles/tokens';

export default function AmbassadorStatus() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const prefersReduced = useReducedMotion();

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

  // SVG progress ring values
  const circumference = 2 * Math.PI * 15.9;
  const survivalDash = (survivalRate / 100) * circumference;

  return (
    <section id="ambassadors" className="bg-bg-card py-16 sm:py-20 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2 text-center relative pb-4">
            <span className="flex items-center justify-center gap-2">
              <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              校園大使存活狀態
            </span>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-primary to-accent rounded" aria-hidden="true" />
          </h2>
        </FadeIn>

        {/* Stats with animated ring */}
        <FadeIn delay={0.1}>
          <div className="flex items-center justify-center gap-6 sm:gap-10 mb-8">
            {/* Progress Ring */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--color-border)" strokeWidth="2.5" />
                <m.circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="var(--color-success)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${circumference}`}
                  initial={prefersReduced ? { strokeDashoffset: circumference - survivalDash } : { strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference - survivalDash }}
                  transition={{ duration: 1, ease: [0.2, 0, 0, 1], delay: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg sm:text-xl font-bold text-success">
                  <AnimatedCounter value={survivalRate} />%
                </span>
                <span className="text-[10px] text-text-muted">存活率</span>
              </div>
            </div>

            {/* Stat numbers */}
            <div className="space-y-2 text-sm sm:text-base" aria-live="polite">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-success rounded-full" />
                <span className="text-text-secondary">存活：</span>
                <span className="font-bold text-success">
                  <AnimatedCounter value={aliveCount} />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-neutral-300 rounded-full" />
                <span className="text-text-secondary">淘汰：</span>
                <span className="font-bold text-text-muted">
                  <AnimatedCounter value={totalCount - aliveCount} />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-primary rounded-full" />
                <span className="text-text-secondary">總計：</span>
                <span className="font-bold text-text-primary">
                  <AnimatedCounter value={totalCount} />
                </span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {[...Array(21)].map((_, i) => (
              <div key={i} className="w-14 sm:w-16 h-12 sm:h-14 rounded-xl bg-neutral-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3" role="list" aria-label="校園大使列表">
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
                  <m.button
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
                      w-14 sm:w-16 p-1.5 sm:p-2 rounded-xl text-center transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-primary/30
                      ${isAlive
                        ? 'bg-gradient-to-br from-success/15 to-success/5 border-2 border-success hover:shadow-elevation-2'
                        : 'bg-bg-secondary border-2 border-border opacity-50 cursor-not-allowed'
                      }
                    `.replace(/\s+/g, ' ').trim()}
                    whileHover={!prefersReduced && isAlive ? { scale: 1.05 } : undefined}
                    whileTap={!prefersReduced && isAlive ? { scale: 0.95 } : undefined}
                    animate={isSelected ? { scale: 1.8 } : { scale: 1 }}
                    transition={spring.tactile}
                  >
                    <div className={`text-[10px] sm:text-xs font-bold ${isAlive ? 'text-success' : 'text-text-muted'}`}>
                      #{ambassador.ambassador_id}
                    </div>
                    <div className={`text-xs sm:text-sm font-medium truncate ${isAlive ? 'text-success' : 'text-text-muted'}`}>
                      {isAlive ? ambassador.name : '✕'}
                    </div>
                  </m.button>

                  {/* Tooltip */}
                  <AnimatePresence>
                    {isSelected && ambassador.school && (
                      <m.div
                        className="absolute -top-8 left-1/2 -translate-x-1/2 z-50"
                        role="tooltip"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="bg-text-primary text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                          {ambassador.school}
                        </div>
                        <div
                          className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-text-primary"
                          aria-hidden="true"
                        />
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-8 text-sm" role="legend" aria-label="狀態說明">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-gradient-to-br from-success/15 to-success/5 border-2 border-success rounded" aria-hidden="true" />
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

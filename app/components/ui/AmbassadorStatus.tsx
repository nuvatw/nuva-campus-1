'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Ambassador } from '@/app/types/ambassador';

export default function AmbassadorStatus() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
    }

    fetchAmbassadors();
  }, []);

  const aliveCount = ambassadors.filter((a) => a.is_alive).length;
  const totalCount = ambassadors.length;
  const survivalRate = totalCount > 0 ? Math.round((aliveCount / totalCount) * 100) : 0;

  const handleClick = (ambassador: Ambassador) => {
    if (!ambassador.is_alive) return;
    // 點擊同一個就關閉，點擊不同的就切換
    setSelectedId(selectedId === ambassador.id ? null : ambassador.id);
  };

  return (
    <section id="ambassadors" className="bg-white py-16 sm:py-20 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center relative pb-4">
          🏆 校園大使存活狀態
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded" />
        </h2>

        <div className="text-center mb-8 text-gray-600 text-sm sm:text-base">
          <p>目前存活：<span className="text-primary font-bold text-lg sm:text-xl">{aliveCount}</span> / {totalCount}</p>
          <p>存活率：<span className="text-primary font-bold">{survivalRate}%</span></p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {ambassadors.map((ambassador) => {
            const isAlive = ambassador.is_alive;
            const isSelected = isAlive && selectedId === ambassador.id;
            
            return (
              <div
                key={ambassador.id}
                className="relative"
                style={{ zIndex: isSelected ? 50 : 1 }}
              >
                <div
                  className={`
                    w-14 sm:w-16 p-1.5 sm:p-2 rounded-lg text-center transition-all duration-300 origin-center
                    ${isAlive
                      ? 'bg-success-light border-2 border-success cursor-pointer'
                      : 'bg-gray-100 border-2 border-gray-300 opacity-50'
                    }
                  `}
                  style={{
                    transform: isSelected ? 'scale(1.8)' : 'scale(1)',
                  }}
                  onClick={() => handleClick(ambassador)}
                >
                  <div className={`text-[10px] sm:text-xs font-bold ${isAlive ? 'text-success' : 'text-gray-400'}`}>
                    #{ambassador.ambassador_id}
                  </div>
                  
                  <div className={`text-xs sm:text-sm font-medium ${isAlive ? 'text-success' : 'text-gray-400'}`}>
                    {isAlive ? ambassador.name : '✕'}
                  </div>

                  {isSelected && ambassador.school && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-50">
                      <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        {ambassador.school}
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
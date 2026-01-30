'use client';

import { memo } from 'react';
import type { SupportStats } from '../types';

interface LeaderboardProps {
  stats: SupportStats[];
}

function LeaderboardComponent({ stats }: LeaderboardProps) {
  const top10 = stats.slice(0, 10);

  if (top10.length === 0) {
    return (
      <div className="bg-bg-card rounded-2xl p-6 shadow-lg border border-border-light text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <h3 className="font-semibold text-text-primary mb-2">還沒有應援</h3>
        <p className="text-sm text-text-muted">成為第一個為學校應援的人！</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-2xl p-6 shadow-lg border border-border-light">
      <h3 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        學校應援排行榜
      </h3>

      <div className="space-y-3">
        {top10.map((stat, index) => (
          <div
            key={stat.university_id}
            className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
              index < 3 ? 'bg-accent/5' : 'bg-bg-secondary/50'
            }`}
          >
            <span className={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
              ${index === 0 ? 'bg-gradient-to-br from-accent to-accent-light text-white shadow-lg' :
                index === 1 ? 'bg-gradient-to-br from-primary-light to-primary text-white' :
                index === 2 ? 'bg-gradient-to-br from-primary to-primary-dark text-white' :
                'bg-bg-secondary text-text-secondary'
              }
            `}>
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary truncate">{stat.university_name}</p>
              <p className="text-xs text-text-muted">{stat.city}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-accent">{stat.total_supporters}</p>
              <p className="text-xs text-text-muted">人應援</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const Leaderboard = memo(LeaderboardComponent);
export default Leaderboard;

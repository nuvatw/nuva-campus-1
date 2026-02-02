'use client';

import { memo, useState } from 'react';
import type { SupportStats } from '../types';

interface LeaderboardProps {
  stats: SupportStats[];
}

interface FlipCardProps {
  stat: SupportStats;
  rank: number;
}

function FlipCard({ stat, rank }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const getRankStyle = () => {
    if (rank === 1) return 'from-amber-400 to-amber-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-amber-600 to-amber-800';
    return 'from-primary-light to-primary';
  };

  return (
    <div
      className="perspective-1000 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative w-20 h-24 md:w-24 md:h-28 transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* 正面 - 名次 */}
        <div
          className={`absolute inset-0 backface-hidden rounded-xl bg-gradient-to-br ${getRankStyle()}
            flex flex-col items-center justify-center text-white shadow-lg`}
        >
          <span className="text-3xl md:text-4xl font-bold">{rank}</span>
          <span className="text-xs opacity-80 mt-1">{stat.total_supporters} 人</span>
        </div>

        {/* 背面 - 大學 */}
        <div
          className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl bg-bg-card border border-border-light
            flex flex-col items-center justify-center p-2 shadow-lg"
        >
          <span className="text-xs md:text-sm font-medium text-text-primary text-center leading-tight">
            {stat.university_name.length > 8
              ? stat.university_name.replace('國立', '').replace('大學', '')
              : stat.university_name}
          </span>
          <span className="text-[10px] text-text-muted mt-1">{stat.city}</span>
        </div>
      </div>
    </div>
  );
}

function LeaderboardComponent({ stats }: LeaderboardProps) {
  const top10 = stats.slice(0, 10);

  if (top10.length === 0) {
    return (
      <div className="text-center py-8">
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
    <div>
      {/* 翻牌卡片 */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {top10.map((stat, index) => (
          <FlipCard key={stat.university_id} stat={stat} rank={index + 1} />
        ))}
      </div>

      <p className="text-center text-xs text-text-muted mt-6">
        點擊卡片查看學校名稱
      </p>
    </div>
  );
}

export const Leaderboard = memo(LeaderboardComponent);
export default Leaderboard;

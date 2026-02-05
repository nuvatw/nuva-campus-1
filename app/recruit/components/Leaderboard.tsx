'use client';

import { memo, useState, useEffect } from 'react';
import type { SupportStats } from '../types';

interface LeaderboardProps {
  stats: SupportStats[];
}

interface FlipCardProps {
  stat: SupportStats;
  rank: number;
  isTop3?: boolean;
}

function FlipCard({ stat, rank, isTop3 = false }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // 5 秒後自動翻回
  useEffect(() => {
    if (!isFlipped) return;

    const timer = setTimeout(() => {
      setIsFlipped(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isFlipped]);

  const getRankStyle = () => {
    if (rank === 1) return 'from-amber-400 to-amber-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-amber-600 to-amber-800';
    return 'from-primary-light to-primary';
  };

  // 橫向 2:1 比例 (寬:高) - 使用 inline style 確保尺寸
  const cardStyle = isTop3
    ? { width: 280, height: 140 }
    : { width: 160, height: 80 };

  const rankTextClass = isTop3 ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl';
  const supporterTextClass = isTop3 ? 'text-sm' : 'text-[10px]';
  const universityTextClass = isTop3 ? 'text-base md:text-lg' : 'text-xs md:text-sm';
  const cityTextClass = isTop3 ? 'text-xs' : 'text-[10px]';

  return (
    <div
      className="perspective-1000 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={cardStyle}
      >
        {/* 正面 - 名次 */}
        <div
          className={`absolute inset-0 backface-hidden rounded-xl bg-gradient-to-br ${getRankStyle()}
            flex items-center justify-center gap-2 text-white shadow-lg px-4`}
        >
          <span className={`${rankTextClass} font-bold`}>{rank}</span>
          <span className={`${supporterTextClass} opacity-80`}>{stat.total_supporters} 人</span>
        </div>

        {/* 背面 - 大學 */}
        <div
          className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl bg-bg-card border border-border-light
            flex items-center justify-center gap-2 px-3 shadow-lg"
        >
          <span className={`${universityTextClass} font-medium text-text-primary whitespace-nowrap`}>
            {stat.university_name}
          </span>
          <span className={`${cityTextClass} text-text-muted whitespace-nowrap`}>{stat.city}</span>
        </div>
      </div>
    </div>
  );
}

function LeaderboardComponent({ stats }: LeaderboardProps) {
  const top3 = stats.slice(0, 3);
  const rest = stats.slice(3, 10);

  if (stats.length === 0) {
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
      {/* Top 3 - 較大的卡片，手機垂直排列 */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-6">
        {top3.map((stat, index) => (
          <FlipCard key={stat.university_id} stat={stat} rank={index + 1} isTop3 />
        ))}
      </div>

      {/* 4-10 名 - 較小的卡片 */}
      {rest.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {rest.map((stat, index) => (
            <FlipCard key={stat.university_id} stat={stat} rank={index + 4} />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-text-muted mt-6">
        點擊卡片查看學校名稱
      </p>
    </div>
  );
}

export const Leaderboard = memo(LeaderboardComponent);
export default Leaderboard;

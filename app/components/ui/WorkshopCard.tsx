'use client';

import Link from 'next/link';
import { Workshop } from '@/app/types/workshop';

interface WorkshopCardProps {
  workshop: Workshop;
}

export default function WorkshopCard({ workshop }: WorkshopCardProps) {
  const isOffline = workshop.type === 'offline';
  
  const dateObj = new Date(workshop.date);
  const formattedDate = dateObj.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });

  return (
    <Link
      href={`/workshops/${workshop.id}`}
      className={`
        block bg-white rounded-2xl p-6 border-2 transition-all duration-300
        hover:shadow-lg hover:-translate-y-1
        ${isOffline ? 'border-primary/30 hover:border-primary' : 'border-primary/30 hover:border-primary'}
      `}
    >
      {/* 標籤區 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="px-3 py-1 rounded-full text-sm font-medium text-white bg-primary">
          {isOffline ? '📍 實體工作坊' : '💻 線上直播'}
        </span>
        {isOffline && (
          <span className="px-3 py-1 rounded-full text-sm font-medium border-2 border-primary text-primary">
            立即報名
          </span>
        )}
      </div>

      {/* 標題 */}
      <h3 className="text-xl font-bold text-gray-800 mb-4">{workshop.title}</h3>

      {/* 資訊 */}
      <div className="space-y-2 text-gray-600">
        <div className="flex items-center gap-2">
          <span className="text-primary">📅</span>
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-primary">🕐</span>
          <span>{workshop.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-primary">📍</span>
          <span>{workshop.location}</span>
        </div>
      </div>

      {/* 點擊查看 */}
      <div className="mt-4 text-right">
        <span className="text-primary font-medium text-sm hover:underline">
          點擊查看 →
        </span>
      </div>
    </Link>
  );
}
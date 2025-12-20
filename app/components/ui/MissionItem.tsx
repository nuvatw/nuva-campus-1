'use client';

import Link from 'next/link';

interface MissionItemProps {
  mission: {
    id: string;
    name: string;
    status: 'completed' | 'ongoing' | 'locked';
    description: string;
  };
}

export default function MissionItem({ mission }: MissionItemProps) {
  const statusConfig = {
    completed: {
      bg: 'bg-success-light',
      border: 'border-success',
      text: 'text-success',
      icon: '✓',
      iconBg: 'bg-success',
      clickable: false,
      animate: false,
    },
    ongoing: {
      bg: 'bg-blue-50',
      border: 'border-primary',
      text: 'text-primary',
      icon: '→',
      iconBg: 'bg-primary',
      clickable: true,
      animate: true,
    },
    locked: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-400',
      icon: '🔒',
      iconBg: 'bg-gray-300',
      clickable: false,
      animate: false,
    },
  };

  const config = statusConfig[mission.status] || statusConfig.locked;
  const missionNumber = mission.id.toUpperCase();;

  const content = (
    <div className="relative">
      {/* 發光光暈 */}
      {config.animate && (
        <div className="absolute -inset-2 bg-primary/30 rounded-2xl blur-xl animate-pulse" />
      )}
      
      <div
        className={`
          relative w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center
          transition-all duration-300
          ${config.bg} ${config.border}
          ${config.clickable ? 'cursor-pointer hover:shadow-xl hover:scale-110' : 'opacity-60 cursor-not-allowed'}
          ${config.animate ? 'shadow-lg shadow-primary/40' : ''}
        `}
      >
        {/* 狀態圖示 */}
        <div className={`absolute -top-2 -right-2 w-5 h-5 ${config.iconBg} rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm z-10 ${config.animate ? 'animate-bounce' : ''}`}>
          {config.icon}
        </div>

        {/* 任務編號 */}
        <div className={`text-xl font-bold ${config.text} relative z-10`}>
          {missionNumber}
        </div>
      </div>
    </div>
  );

  if (config.clickable) {
    return (
      <Link href={`/missions/${mission.id}`}>
        {content}
      </Link>
    );
  }

  return content;
}
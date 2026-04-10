'use client';

import { memo } from 'react';
import type { Supporter } from '@/app/types/supporter';
import { formatName } from '../../utils';

interface SupporterCardProps {
  supporter: Supporter;
  orderNumber: number;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

function SupporterCardComponent({
  supporter,
  orderNumber,
  onClick,
  className = '',
  style,
}: SupporterCardProps) {
  const isHelp = supporter.support_type === 'help';

  return (
    <button
      onClick={onClick}
      className={`
        text-left bg-bg-card rounded-2xl p-4 shadow-elevation-1 border
        transition-all duration-200 ease-out
        hover:shadow-elevation-2 hover:-translate-y-0.5
        active:scale-[0.98]
        ${isHelp ? 'border-primary/15' : 'border-accent/15'}
        ${className}
      `}
      style={style}
    >
      <div className="flex items-start gap-3">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0
          ${isHelp ? 'bg-gradient-to-br from-primary to-primary-dark' : 'bg-gradient-to-br from-accent to-amber-600'}
        `}>
          {supporter.supporter_name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-text-primary text-sm">
            {formatName(supporter.supporter_name)}
          </p>
          <p className="text-xs text-text-muted truncate">
            {supporter.university_name}
          </p>
          {supporter.message && (
            <p className="text-sm text-text-secondary mt-2 line-clamp-2">
              「{supporter.message}」
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className={`
          inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
          ${isHelp ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}
        `}>
          <span className={`w-1.5 h-1.5 rounded-full ${isHelp ? 'bg-primary' : 'bg-accent'}`} />
          {isHelp ? '願意幫忙' : '想參加'}
        </div>
        <span className="text-xs text-text-muted tabular-nums">#{orderNumber}</span>
      </div>
    </button>
  );
}

export const SupporterCard = memo(SupporterCardComponent);
export default SupporterCard;

'use client';

import { memo } from 'react';
import type { Supporter } from '../../types';
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
        text-left bg-bg-card rounded-2xl p-4 shadow-md border
        transition-transform duration-200 ease-out
        hover:scale-[1.02] active:scale-[0.98]
        ${isHelp ? 'border-error/20' : 'border-accent/20'}
        ${className}
      `}
      style={style}
    >
      <div className="flex items-start gap-3">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0
          ${isHelp ? 'bg-error' : 'bg-accent'}
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
          inline-block px-2 py-0.5 rounded-full text-xs
          ${isHelp ? 'bg-error/10 text-error' : 'bg-accent/10 text-accent'}
        `}>
          {isHelp ? '願意幫忙' : '想參加'}
        </div>
        <span className="text-xs text-text-muted">#{orderNumber}</span>
      </div>
    </button>
  );
}

export const SupporterCard = memo(SupporterCardComponent);
export default SupporterCard;

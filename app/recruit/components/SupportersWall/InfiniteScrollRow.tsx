'use client';

import { memo } from 'react';
import type { Supporter } from '../../types';
import { SupporterCard } from './SupporterCard';

interface InfiniteScrollRowProps {
  supporters: Supporter[];
  rowIndex: number;
  onCardClick: (supporter: Supporter, orderNumber: number) => void;
  getOrderNumber: (index: number) => number;
  direction?: 'left' | 'right';
}

function InfiniteScrollRowComponent({
  supporters,
  rowIndex,
  onCardClick,
  getOrderNumber,
  direction = 'left',
}: InfiniteScrollRowProps) {
  // 複製卡片以實現無縫循環
  const duplicatedSupporters = [...supporters, ...supporters];

  return (
    <div className="relative overflow-hidden py-2">
      <div
        className={`flex gap-4 ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}`}
        style={{ width: 'fit-content' }}
      >
        {duplicatedSupporters.map((supporter, index) => {
          const originalIndex = index % supporters.length;

          return (
            <div
              key={`${supporter.id}-${index}`}
              className="flex-shrink-0"
            >
              <SupporterCard
                supporter={supporter}
                orderNumber={getOrderNumber(originalIndex)}
                onClick={() => onCardClick(supporter, getOrderNumber(originalIndex))}
                className="w-72"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const InfiniteScrollRow = memo(InfiniteScrollRowComponent);
export default InfiniteScrollRow;

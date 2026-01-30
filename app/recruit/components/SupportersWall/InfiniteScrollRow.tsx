'use client';

import { useState, useEffect, memo } from 'react';
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
  const [floatOffsets, setFloatOffsets] = useState<number[]>([]);

  useEffect(() => {
    // 為每張卡片生成隨機的浮動偏移
    setFloatOffsets(supporters.map(() => Math.random() * 20 - 10));
  }, [supporters]);

  // 複製卡片以實現無縫循環
  const duplicatedSupporters = [...supporters, ...supporters];

  return (
    <div className="relative overflow-hidden py-4">
      <div
        className={`flex gap-4 ${direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right'}`}
        style={{
          width: 'fit-content',
          animationDuration: '240s',
        }}
      >
        {duplicatedSupporters.map((supporter, index) => {
          const originalIndex = index % supporters.length;
          const floatOffset = floatOffsets[originalIndex] || 0;

          return (
            <div
              key={`${supporter.id}-${index}`}
              className="flex-shrink-0 animate-float-gentle"
              style={{
                animationDelay: `${(originalIndex * 0.3)}s`,
                animationDuration: `${3 + (originalIndex % 3)}s`,
              }}
            >
              <SupporterCard
                supporter={supporter}
                orderNumber={getOrderNumber(originalIndex)}
                onClick={() => onCardClick(supporter, getOrderNumber(originalIndex))}
                className="w-72"
                style={{
                  transform: `translateY(${floatOffset}px)`,
                }}
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

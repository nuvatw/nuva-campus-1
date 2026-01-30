'use client';

import { useState, useEffect, memo } from 'react';
import type { Supporter, SupportType } from '../../types';
import { formatName } from '../../utils';
import { LoadingSpinner } from '@/app/components/ui';
import { InfiniteScrollRow } from './InfiniteScrollRow';
import { FlipCardPopup } from './FlipCardPopup';

interface SupportersWallProps {
  supporters: Supporter[];
  isLoading: boolean;
  newCardAnimation?: { name: string; university: string; type: SupportType } | null;
}

function SupportersWallComponent({
  supporters,
  isLoading,
  newCardAnimation,
}: SupportersWallProps) {
  const [selectedSupporter, setSelectedSupporter] = useState<{ supporter: Supporter; orderNumber: number } | null>(null);
  const [showNewCard, setShowNewCard] = useState(false);

  // 當有新卡片動畫時觸發
  useEffect(() => {
    if (newCardAnimation) {
      setShowNewCard(true);
      const timer = setTimeout(() => setShowNewCard(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [newCardAnimation]);

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-bg-primary to-bg-secondary/50">
        <div className="max-w-6xl mx-auto text-center px-6">
          <LoadingSpinner label="載入應援訊息..." />
        </div>
      </section>
    );
  }

  if (supporters.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-b from-bg-primary to-bg-secondary/50">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-text-primary mb-4">應援牆</h2>
          <p className="text-text-secondary mb-8">成為第一個應援的人！</p>
          <div className="bg-bg-card rounded-2xl p-12 border border-border-light">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-text-muted">快來為你的學校應援，讓大家看到你的支持！</p>
          </div>
        </div>
      </section>
    );
  }

  // 計算順序號（從最早到最晚）
  const getOrderNumber = (index: number) => supporters.length - index;

  // 將 supporters 分成多列
  const row1 = supporters.filter((_, i) => i % 3 === 0);
  const row2 = supporters.filter((_, i) => i % 3 === 1);
  const row3 = supporters.filter((_, i) => i % 3 === 2);

  const handleCardClick = (supporter: Supporter, orderNumber: number) => {
    setSelectedSupporter({ supporter, orderNumber });
  };

  return (
    <section className="py-16 bg-gradient-to-b from-bg-primary to-bg-secondary/50 overflow-hidden relative">
      {/* 新卡片飛入動畫 */}
      {showNewCard && newCardAnimation && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* 卡片從中央飛向應援牆 */}
          <div className="absolute animate-fly-to-wall">
            <div className={`
              w-72 bg-bg-card rounded-2xl p-4 shadow-2xl border-2
              ${newCardAnimation.type === 'help' ? 'border-error' : 'border-accent'}
            `}>
              <div className="flex items-center gap-3">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg
                  ${newCardAnimation.type === 'help' ? 'bg-gradient-to-br from-error to-red-700' : 'bg-gradient-to-br from-accent to-amber-600'}
                `}>
                  {newCardAnimation.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-text-primary">
                    {formatName(newCardAnimation.name)}
                  </p>
                  <p className="text-sm text-text-muted">
                    {newCardAnimation.university}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* 散開的粒子效果 */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full animate-particle-burst"
                style={{
                  background: newCardAnimation.type === 'help' ? 'var(--color-primary)' : 'var(--color-accent)',
                  animationDelay: `${i * 0.05}s`,
                  '--particle-angle': `${(i * 30)}deg`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-text-primary mb-3">應援牆</h2>
          <p className="text-text-secondary">感謝這 {supporters.length} 位夥伴的支持！點擊卡片看更多</p>
        </div>
      </div>

      {/* 無限滾動卡片 - 多列 */}
      <div className="space-y-2">
        {row1.length > 0 && (
          <InfiniteScrollRow
            supporters={row1}
            rowIndex={0}
            onCardClick={handleCardClick}
            getOrderNumber={(i) => getOrderNumber(i * 3)}
            direction="left"
          />
        )}
        {row2.length > 0 && (
          <InfiniteScrollRow
            supporters={row2}
            rowIndex={1}
            onCardClick={handleCardClick}
            getOrderNumber={(i) => getOrderNumber(i * 3 + 1)}
            direction="right"
          />
        )}
        {row3.length > 0 && (
          <InfiniteScrollRow
            supporters={row3}
            rowIndex={2}
            onCardClick={handleCardClick}
            getOrderNumber={(i) => getOrderNumber(i * 3 + 2)}
            direction="left"
          />
        )}
      </div>

      {/* 翻牌彈窗 */}
      {selectedSupporter && (
        <FlipCardPopup
          supporter={selectedSupporter.supporter}
          orderNumber={selectedSupporter.orderNumber}
          totalCount={supporters.length}
          onClose={() => setSelectedSupporter(null)}
        />
      )}
    </section>
  );
}

export const SupportersWall = memo(SupportersWallComponent);
export default SupportersWall;

'use client';

import { useState, useEffect, memo } from 'react';
import type { Supporter } from '../../types';
import { formatName } from '../../utils';

interface FlipCardPopupProps {
  supporter: Supporter;
  orderNumber: number;
  totalCount: number;
  onClose: () => void;
}

function FlipCardPopupComponent({
  supporter,
  orderNumber,
  totalCount,
  onClose,
}: FlipCardPopupProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const isHelp = supporter.support_type === 'help';

  // 點擊背景關閉
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ESC 鍵關閉
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-80 h-96 cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* 正面 - 第幾位 */}
          <div className={`absolute inset-0 backface-hidden rounded-3xl shadow-2xl overflow-hidden ${
            isHelp ? 'bg-gradient-to-br from-error via-red-600 to-error' : 'bg-gradient-to-br from-accent via-amber-500 to-accent'
          }`}>
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
            <div className="relative h-full flex flex-col items-center justify-center p-8 text-white">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm">
                <span className="text-5xl font-bold">{supporter.supporter_name.charAt(0)}</span>
              </div>
              <p className="text-lg opacity-80 mb-2">第</p>
              <p className="text-6xl font-bold mb-2">{orderNumber}</p>
              <p className="text-lg opacity-80">位支持者</p>
              <div className="absolute bottom-6 flex items-center gap-2 text-sm opacity-60">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>點擊翻面</span>
              </div>
            </div>
          </div>

          {/* 背面 - 詳細資訊 */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl shadow-2xl overflow-hidden bg-bg-card border border-border-light">
            <div className="h-full flex flex-col p-6">
              {/* 頭部 */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold ${
                  isHelp ? 'bg-gradient-to-br from-error to-red-700' : 'bg-gradient-to-br from-accent to-amber-600'
                }`}>
                  {supporter.supporter_name.charAt(0)}
                </div>
                <div>
                  <p className="text-xl font-bold text-text-primary">
                    {formatName(supporter.supporter_name)}
                  </p>
                  <p className="text-sm text-text-muted">{supporter.university_name}</p>
                </div>
              </div>

              {/* 類型標籤 */}
              <div className={`inline-flex self-start items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4 ${
                isHelp ? 'bg-error/10 text-error' : 'bg-accent/10 text-accent'
              }`}>
                {isHelp ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    願意幫忙
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    想參加活動
                  </>
                )}
              </div>

              {/* 留言 */}
              <div className="flex-1 overflow-y-auto">
                {supporter.message ? (
                  <div className="bg-bg-secondary/50 rounded-xl p-4">
                    <p className="text-text-secondary leading-relaxed">「{supporter.message}」</p>
                  </div>
                ) : (
                  <div className="bg-bg-secondary/50 rounded-xl p-4 text-center">
                    <p className="text-text-muted text-sm">沒有留下訊息</p>
                  </div>
                )}
              </div>

              {/* 底部資訊 */}
              <div className="mt-4 pt-4 border-t border-border-light flex items-center justify-between text-xs text-text-muted">
                <span>#{orderNumber} / {totalCount}</span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  點擊翻面
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const FlipCardPopup = memo(FlipCardPopupComponent);
export default FlipCardPopup;

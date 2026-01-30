'use client';

import { memo } from 'react';
import type { SupportType } from '../types';

interface ActionButtonsProps {
  onSelectType: (type: SupportType) => void;
  selectedType: SupportType | null;
}

function ActionButtonsComponent({
  onSelectType,
  selectedType,
}: ActionButtonsProps) {
  const notSelected = selectedType === null;

  return (
    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
      {/* 我可以幫忙 - 手的 icon (紅色) */}
      <button
        onClick={() => onSelectType('help')}
        className={`
          group relative px-10 py-5 rounded-2xl font-semibold text-lg
          transition-all duration-300 overflow-hidden
          ${selectedType === 'help'
            ? 'bg-error text-white shadow-xl shadow-error/30 scale-105'
            : selectedType === 'attend'
              ? 'bg-bg-card border-2 border-border text-text-muted'
              : 'bg-bg-card border-2 border-error text-error hover:bg-error hover:text-white hover:shadow-lg'
          }
          ${notSelected ? 'animate-button-glow-error' : ''}
        `}
      >
        {/* 發光效果背景 */}
        {notSelected && (
          <span className="absolute inset-0 rounded-2xl bg-error/20 animate-pulse-glow" />
        )}
        <span className="relative z-10 flex items-center justify-center gap-3">
          {/* 手舉起的 icon */}
          <svg className={`w-7 h-7 ${notSelected ? 'animate-wave' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
          </svg>
          我可以幫忙
        </span>
      </button>

      {/* 分隔文字 */}
      {notSelected && (
        <span className="text-text-muted text-sm hidden sm:block">或</span>
      )}

      {/* 我想參加活動 - 愛心 icon */}
      <button
        onClick={() => onSelectType('attend')}
        className={`
          group relative px-10 py-5 rounded-2xl font-semibold text-lg
          transition-all duration-300 overflow-hidden
          ${selectedType === 'attend'
            ? 'bg-accent text-white shadow-xl shadow-accent/30 scale-105'
            : selectedType === 'help'
              ? 'bg-bg-card border-2 border-border text-text-muted'
              : 'bg-bg-card border-2 border-accent text-accent hover:bg-accent hover:text-white hover:shadow-lg'
          }
          ${notSelected ? 'animate-button-glow-accent' : ''}
        `}
      >
        {/* 發光效果背景 */}
        {notSelected && (
          <span className="absolute inset-0 rounded-2xl bg-accent/20 animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
        )}
        <span className="relative z-10 flex items-center justify-center gap-3">
          {/* 愛心 icon */}
          <svg className={`w-7 h-7 ${notSelected ? 'animate-heartbeat' : ''}`} fill={selectedType === 'attend' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          我想參加活動
        </span>
      </button>

      {/* 提示文字 */}
      {notSelected && (
        <p className="text-sm text-text-muted mt-2 sm:hidden text-center">
          請選擇一個選項繼續
        </p>
      )}
    </div>
  );
}

export const ActionButtons = memo(ActionButtonsComponent);
export default ActionButtons;

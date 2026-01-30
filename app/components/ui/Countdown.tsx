'use client';

import { useState, useEffect, memo, useCallback } from 'react';

interface TimeLeft {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownProps {
  /** 目標日期時間 */
  targetDate: Date | string;
  /** 倒數完成時的回調 */
  onComplete?: () => void;
  /** 顯示格式：'full' 顯示天數，'compact' 只顯示時分秒 */
  format?: 'full' | 'compact';
  /** 自訂 className */
  className?: string;
  /** 完成時顯示的文字 */
  completedText?: string;
}

/**
 * 計算剩餘時間
 */
function calculateTimeLeft(targetDate: Date): TimeLeft {
  const total = targetDate.getTime() - Date.now();

  if (total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / 1000 / 60) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

/**
 * Countdown 倒數計時組件
 *
 * 特點：
 * - 使用 memo 防止父組件重新渲染時不必要的更新
 * - 只在內部更新狀態，不會觸發父組件重新渲染
 * - 支援多種顯示格式
 */
function CountdownComponent({
  targetDate,
  onComplete,
  format = 'full',
  className = '',
  completedText = '已截止',
}: CountdownProps) {
  // 將字串轉換為 Date 對象
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(target));

  // 使用 useCallback 穩定 onComplete 引用
  const handleComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    // 如果已經完成，不啟動 interval
    if (timeLeft.total <= 0) {
      return;
    }

    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(target);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0) {
        clearInterval(interval);
        handleComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [target, handleComplete, timeLeft.total]);

  // 已完成狀態
  if (timeLeft.total <= 0) {
    return (
      <span className={`text-text-muted ${className}`}>
        {completedText}
      </span>
    );
  }

  // Compact 格式：只顯示時分秒
  if (format === 'compact') {
    return (
      <span className={`font-mono tabular-nums ${className}`}>
        {String(timeLeft.hours + timeLeft.days * 24).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    );
  }

  // Full 格式：顯示天數
  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {timeLeft.days > 0 && `${timeLeft.days} 天 `}
      {timeLeft.hours} 小時 {timeLeft.minutes} 分 {timeLeft.seconds} 秒
    </span>
  );
}

/**
 * CountdownDisplay - 帶有標籤的倒數顯示組件
 */
interface CountdownDisplayProps extends CountdownProps {
  /** 標籤文字 */
  label?: string;
  /** 截止日期顯示 */
  showDeadline?: boolean;
}

function CountdownDisplayComponent({
  label = '繳交倒數',
  showDeadline = true,
  targetDate,
  ...props
}: CountdownDisplayProps) {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;

  return (
    <div className="bg-bg-card rounded-xl p-6 shadow-sm border-2 border-primary/20 text-center">
      <div className="text-sm text-text-secondary mb-2 flex items-center justify-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {label}
      </div>
      <div
        className="text-2xl sm:text-3xl font-bold text-primary"
        role="timer"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="sr-only">距離截止還有</span>
        <Countdown targetDate={targetDate} {...props} />
      </div>
      {showDeadline && (
        <div className="text-xs text-text-muted mt-2">
          截止日期：{target.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      )}
    </div>
  );
}

// 使用 memo 優化，避免父組件重新渲染時不必要的更新
export const Countdown = memo(CountdownComponent);
export const CountdownDisplay = memo(CountdownDisplayComponent);

export default Countdown;

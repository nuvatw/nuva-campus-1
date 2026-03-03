'use client';

import { memo } from 'react';
import { m } from 'motion/react';
import { Countdown } from './Countdown';
import { useReducedMotion } from '@/app/components/motion';

interface MissionCountdownProps {
  dueDate: string;
}

/**
 * MissionCountdown — countdown timer with urgency-based styling.
 * Extracted from MissionGrid to keep the grid from re-rendering every second.
 */
function MissionCountdownComponent({ dueDate }: MissionCountdownProps) {
  const prefersReduced = useReducedMotion();
  const targetDate = new Date(dueDate + 'T23:59:59');

  // Calculate urgency level based on remaining time
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  const hoursLeft = diff / (1000 * 60 * 60);

  let urgencyClass = 'border-primary/20 bg-primary/5';
  let textClass = 'text-primary';
  let pulseRing = false;

  if (hoursLeft <= 0) {
    urgencyClass = 'border-border bg-bg-secondary';
    textClass = 'text-text-muted';
  } else if (hoursLeft <= 24) {
    urgencyClass = 'border-error/30 bg-error/5';
    textClass = 'text-error';
    pulseRing = true;
  } else if (hoursLeft <= 72) {
    urgencyClass = 'border-warning/30 bg-warning/5';
    textClass = 'text-warning';
  }

  return (
    <m.div
      initial={prefersReduced ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      className={`relative rounded-xl p-6 shadow-elevation-1 border-2 text-center mb-8 ${urgencyClass}`}
    >
      {pulseRing && !prefersReduced && (
        <span className="absolute inset-0 rounded-xl border-2 border-error/40 animate-ping pointer-events-none" />
      )}
      <div className="text-sm text-text-secondary mb-2 flex items-center justify-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        繳交倒數
      </div>
      <div
        className={`text-2xl sm:text-3xl font-bold ${textClass}`}
        role="timer"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="sr-only">距離截止還有</span>
        <Countdown targetDate={targetDate} completedText="已截止" />
      </div>
      <div className="text-xs text-text-muted mt-2">
        截止日期：{new Date(dueDate).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </m.div>
  );
}

export const MissionCountdown = memo(MissionCountdownComponent);
export default MissionCountdown;

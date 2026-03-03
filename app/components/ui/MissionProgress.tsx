'use client';

import { memo } from 'react';
import { m } from 'motion/react';
import { useReducedMotion } from '@/app/components/motion';

interface MissionProgressProps {
  completed: number;
  total: number;
}

/**
 * MissionProgress — animated progress bar for mission completion.
 * Shows gradient fill that transitions from primary to success as completion increases.
 */
function MissionProgressComponent({ completed, total }: MissionProgressProps) {
  const prefersReduced = useReducedMotion();
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  // Gradient shifts toward success as more missions complete
  const gradientClass = percentage >= 80
    ? 'from-success to-success'
    : percentage >= 40
      ? 'from-primary to-success'
      : 'from-primary to-primary';

  return (
    <div className="mb-8" role="group" aria-label="任務進度">
      <div className="flex justify-between text-sm text-text-secondary mb-2">
        <span className="font-medium">任務進度</span>
        <span className="font-medium tabular-nums" aria-live="polite">{completed} / {total} 完成</span>
      </div>
      <div
        className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden"
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <m.div
          className={`h-3 rounded-full bg-gradient-to-r ${gradientClass}`}
          initial={prefersReduced ? { width: `${percentage}%` } : { width: '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }}
        />
      </div>
    </div>
  );
}

export const MissionProgress = memo(MissionProgressComponent);
export default MissionProgress;

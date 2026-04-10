'use client';

import { m } from 'motion/react';
import { FadeIn, useReducedMotion } from '@/app/components/motion';
import { AnimatedCounter } from '@/app/components/ui';
import type { NunuEventRegistration, ShirtSize } from '@/app/types/nunu';
import { SHIRT_SIZES } from '@/app/types/nunu';

interface SizeDistributionProps {
  registrations: NunuEventRegistration[];
}

function SizeBar({ size, count, total }: { size: ShirtSize; count: number; total: number }) {
  const prefersReduced = useReducedMotion();
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="group/size">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-text-secondary font-medium">{size}</span>
        <span className="text-text-muted tabular-nums">
          <AnimatedCounter value={count} />
        </span>
      </div>
      <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
        <m.div
          className="h-full bg-gradient-to-r from-primary-400 to-primary rounded-full"
          initial={prefersReduced ? { width: `${percentage}%` } : { width: 0 }}
          whileInView={prefersReduced ? undefined : { width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0, 0, 0.2, 1] }}
        />
      </div>
    </div>
  );
}

export function SizeDistribution({ registrations }: SizeDistributionProps) {
  const sizeStats = SHIRT_SIZES.reduce((acc, size) => {
    acc[size] = registrations.filter((r) => r.shirt_size === size).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <FadeIn delay={0.2} className="col-span-12 lg:col-span-4">
      <div className="bg-bg-card rounded-2xl p-5 border border-border hover:shadow-lg transition-all duration-300 h-full">
        <div className="mb-4">
          <p className="text-[10px] text-text-muted tracking-widest uppercase font-medium">Size Distribution</p>
          <h3 className="text-base font-semibold text-text-primary mt-0.5">尺寸統計</h3>
        </div>
        <div className="space-y-3">
          {SHIRT_SIZES.map((size) => (
            <SizeBar
              key={size}
              size={size}
              count={sizeStats[size]}
              total={registrations.length}
            />
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

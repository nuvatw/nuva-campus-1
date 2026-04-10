'use client';

import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring, m } from 'motion/react';
import { useReducedMotion } from '@/app/components/motion';
import { spring as springPresets } from '@/app/styles/tokens';

interface AnimatedCounterProps {
  value: number;
  formatOptions?: Intl.NumberFormatOptions;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({
  value,
  formatOptions,
  className = '',
  duration,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReduced = useReducedMotion();
  const isInView = useInView(ref, { once: true, margin: '-20px' });

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, duration
    ? { duration: duration / 1000 }
    : springPresets.counter
  );

  useEffect(() => {
    if (isInView && !prefersReduced) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue, prefersReduced]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        const formatted = formatOptions
          ? Math.round(latest).toLocaleString(undefined, formatOptions)
          : Math.round(latest).toLocaleString();
        ref.current.textContent = formatted;
      }
    });
    return unsubscribe;
  }, [springValue, formatOptions]);

  const formattedValue = formatOptions
    ? value.toLocaleString(undefined, formatOptions)
    : value.toLocaleString();

  if (prefersReduced) {
    return (
      <span ref={ref} className={className} aria-live="polite" aria-atomic="true">
        {formattedValue}
      </span>
    );
  }

  return (
    <span ref={ref} className={className} aria-live="polite" aria-atomic="true">
      <span className="sr-only">{formattedValue}</span>
      0
    </span>
  );
}

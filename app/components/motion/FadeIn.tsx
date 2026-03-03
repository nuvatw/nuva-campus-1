'use client';

import { m } from 'motion/react';
import type { HTMLMotionProps } from 'motion/react';

type FadeInDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface FadeInProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'exit'> {
  /** Direction the element fades in from. Default: 'up' */
  direction?: FadeInDirection;
  /** Offset distance in pixels. Default: 12 */
  offset?: number;
  /** Animation duration in seconds. Default: 0.3 */
  duration?: number;
  /** Delay before animation starts in seconds. Default: 0 */
  delay?: number;
  /** Whether to trigger animation only once when in viewport */
  once?: boolean;
  children: React.ReactNode;
}

const directionMap: Record<FadeInDirection, (offset: number) => { x?: number; y?: number }> = {
  up: (offset) => ({ y: offset }),
  down: (offset) => ({ y: -offset }),
  left: (offset) => ({ x: offset }),
  right: (offset) => ({ x: -offset }),
  none: () => ({}),
};

/**
 * Reusable fade-in animation wrapper.
 * Elements fade in from a direction with configurable offset and timing.
 *
 * Usage:
 *   <FadeIn direction="up" delay={0.1}>
 *     <Card />
 *   </FadeIn>
 */
export function FadeIn({
  direction = 'up',
  offset = 12,
  duration = 0.3,
  delay = 0,
  once = true,
  children,
  ...props
}: FadeInProps) {
  const directionOffset = directionMap[direction](offset);

  return (
    <m.div
      initial={{ opacity: 0, ...directionOffset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: '-50px' }}
      transition={{
        duration,
        delay,
        ease: [0, 0, 0.2, 1],
      }}
      {...props}
    >
      {children}
    </m.div>
  );
}

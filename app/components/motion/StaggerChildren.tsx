'use client';

import { m } from 'motion/react';
import type { HTMLMotionProps } from 'motion/react';

interface StaggerChildrenProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate'> {
  /** Delay between each child animation in seconds. Default: 0.05 */
  staggerDelay?: number;
  /** Initial delay before the first child. Default: 0.1 */
  initialDelay?: number;
  /** Whether to trigger animation only once when in viewport */
  once?: boolean;
  children: React.ReactNode;
}

/**
 * Container that staggers the entrance of its children.
 * Wrap child elements in StaggerChildren.Item for the stagger effect.
 *
 * Usage:
 *   <StaggerChildren>
 *     <StaggerChildren.Item><Card /></StaggerChildren.Item>
 *     <StaggerChildren.Item><Card /></StaggerChildren.Item>
 *   </StaggerChildren>
 */
export function StaggerChildren({
  staggerDelay = 0.05,
  initialDelay = 0.1,
  once = true,
  children,
  ...props
}: StaggerChildrenProps) {
  return (
    <m.div
      initial="initial"
      whileInView="animate"
      viewport={{ once, margin: '-50px' }}
      variants={{
        animate: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: initialDelay,
          },
        },
      }}
      {...props}
    >
      {children}
    </m.div>
  );
}

interface StaggerItemProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: React.ReactNode;
}

function StaggerItem({ children, ...props }: StaggerItemProps) {
  return (
    <m.div
      variants={{
        initial: { opacity: 0, y: 12 },
        animate: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.3,
            ease: [0, 0, 0.2, 1],
          },
        },
      }}
      {...props}
    >
      {children}
    </m.div>
  );
}

StaggerChildren.Item = StaggerItem;

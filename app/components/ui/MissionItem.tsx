'use client';

import Link from 'next/link';
import { m } from 'motion/react';
import { useReducedMotion } from '@/app/components/motion';
import { spring } from '@/app/styles/tokens';

interface MissionItemProps {
  id: string;
  status: 'completed' | 'ongoing' | 'locked';
}

const statusConfig = {
  completed: {
    bg: 'bg-gradient-to-br from-success/20 to-success/5',
    border: 'border-success',
    text: 'text-success',
    badge: 'bg-success',
    icon: (
      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
  },
  ongoing: {
    bg: 'bg-gradient-to-br from-primary/15 to-accent/10',
    border: 'border-primary',
    text: 'text-primary',
    badge: 'bg-primary',
    icon: (
      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    ),
  },
  locked: {
    bg: 'bg-bg-secondary',
    border: 'border-border',
    text: 'text-text-muted',
    badge: 'bg-text-muted',
    icon: (
      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
    ),
  },
} as const;

export default function MissionItem({ id, status }: MissionItemProps) {
  const displayId = id.replace('m', 'M').toUpperCase();
  const config = statusConfig[status];
  const prefersReduced = useReducedMotion();

  const motionProps = prefersReduced
    ? {}
    : status === 'ongoing'
      ? {
          whileHover: { scale: 1.1, y: -2 },
          whileTap: { scale: 0.95 },
          transition: spring.tactile,
        }
      : {};

  const content = (
    <m.div
      className={`
        w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center
        font-bold text-xs sm:text-sm transition-colors duration-200 relative
        border-2 ${config.bg} ${config.border} ${config.text}
        ${status === 'ongoing' ? 'shadow-elevation-2 cursor-pointer' : ''}
      `.replace(/\s+/g, ' ').trim()}
      {...motionProps}
    >
      {/* Status badge */}
      <div className={`absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 ${config.badge} rounded-full flex items-center justify-center`}>
        {config.icon}
      </div>

      {/* Animated pulse ring for ongoing missions */}
      {status === 'ongoing' && !prefersReduced && (
        <span className="absolute inset-0 rounded-xl border-2 border-primary/30 animate-pulse pointer-events-none" />
      )}

      {displayId}
    </m.div>
  );

  if (status === 'ongoing') {
    return (
      <Link href={`/ambassadors/missions/${id}`}>
        {content}
      </Link>
    );
  }

  return content;
}

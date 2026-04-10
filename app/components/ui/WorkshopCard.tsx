'use client';

import Link from 'next/link';
import { m } from 'motion/react';
import { Workshop } from '@/app/types/workshop';
import { useReducedMotion } from '@/app/components/motion';
import { spring } from '@/app/styles/tokens';
import { Badge } from './Badge';

interface WorkshopCardProps {
  workshop: Workshop;
}

/**
 * Calculate proximity label and urgency variant for a workshop date.
 */
function getProximity(dateStr: string): { label: string; variant: 'error' | 'warning' | 'primary' | 'default' } | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const workshopDate = new Date(dateStr);
  workshopDate.setHours(0, 0, 0, 0);
  const diffDays = Math.round((workshopDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: '已結束', variant: 'default' };
  if (diffDays === 0) return { label: '今天', variant: 'error' };
  if (diffDays === 1) return { label: '明天', variant: 'error' };
  if (diffDays <= 3) return { label: `${diffDays} 天後`, variant: 'warning' };
  if (diffDays <= 7) return { label: `${diffDays} 天後`, variant: 'primary' };
  return null;
}

export default function WorkshopCard({ workshop }: WorkshopCardProps) {
  const isOffline = workshop.type === 'offline';
  const prefersReduced = useReducedMotion();
  const proximity = getProximity(workshop.date);

  const dateObj = new Date(workshop.date);
  const formattedDate = dateObj.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });

  const motionProps = prefersReduced
    ? {}
    : {
        whileHover: { y: -4, boxShadow: '0 8px 24px -4px rgba(59, 130, 246, 0.15)' },
        whileTap: { scale: 0.98 },
        transition: spring.tactile,
      };

  return (
    <Link href={`/ambassadors/workshops/${workshop.id}`}>
      <m.div
        className="bg-bg-card rounded-xl p-6 border-2 border-border shadow-elevation-1 transition-colors duration-200 hover:border-primary/40"
        {...motionProps}
      >
        {/* Tags row */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge variant="primary" dot>
            {isOffline ? '實體工作坊' : '線上直播'}
          </Badge>
          {isOffline && (
            <Badge variant="success">立即報名</Badge>
          )}
          {proximity && (
            <Badge variant={proximity.variant} animated>
              {proximity.label}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-text-primary mb-4">{workshop.title}</h3>

        {/* Info */}
        <div className="space-y-2 text-text-secondary text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{workshop.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{workshop.location}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4 pt-3 border-t border-border-light text-right">
          <span className="text-primary font-medium text-sm inline-flex items-center gap-1">
            查看詳情
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </m.div>
    </Link>
  );
}

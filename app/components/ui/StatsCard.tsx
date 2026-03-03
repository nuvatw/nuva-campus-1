'use client';

import { ReactNode } from 'react';
import { m } from 'motion/react';
import { useReducedMotion } from '@/app/components/motion';
import { spring } from '@/app/styles/tokens';
import { AnimatedCounter } from './AnimatedCounter';

type StatVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: ReactNode;
  variant?: StatVariant;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
  className?: string;
  loading?: boolean;
}

const variantStyles: Record<StatVariant, { bg: string; text: string; icon: string }> = {
  default: {
    bg: 'bg-bg-card',
    text: 'text-text-primary',
    icon: 'text-text-muted',
  },
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    icon: 'text-success',
  },
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    icon: 'text-warning',
  },
  error: {
    bg: 'bg-error/10',
    text: 'text-error',
    icon: 'text-error',
  },
  info: {
    bg: 'bg-info/10',
    text: 'text-info',
    icon: 'text-info',
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  trend,
  onClick,
  className = '',
  loading = false,
}: StatsCardProps) {
  const styles = variantStyles[variant];
  const isClickable = !!onClick;
  const prefersReduced = useReducedMotion();

  const motionProps = prefersReduced || !isClickable
    ? {}
    : {
        whileHover: { y: -2, boxShadow: '0 8px 16px -4px rgba(28, 25, 23, 0.1)' },
        whileTap: { scale: 0.98 },
        transition: spring.tactile,
      };

  const content = (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-text-secondary">{title}</span>
        {icon && (
          <span className={styles.icon}>
            {icon}
          </span>
        )}
      </div>

      {loading ? (
        <div className="h-9 w-20 bg-neutral-200 animate-pulse rounded" />
      ) : (
        <p className={`text-3xl font-semibold ${styles.text}`}>
          {typeof value === 'number' ? (
            <AnimatedCounter value={value} className={styles.text} />
          ) : (
            value
          )}
        </p>
      )}

      <div className="mt-2 flex items-center gap-2">
        {trend && (
          <span
            className={`text-sm font-medium flex items-center gap-1 ${
              trend.isPositive ? 'text-success' : 'text-error'
            }`}
          >
            {trend.isPositive ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            {trend.value}%
            {trend.label && <span className="text-text-muted ml-1">{trend.label}</span>}
          </span>
        )}
        {subtitle && !trend && (
          <span className="text-sm text-text-muted">{subtitle}</span>
        )}
      </div>
    </>
  );

  const baseClasses = `
    ${styles.bg} rounded-xl p-5 border border-border shadow-elevation-1
    transition-colors duration-200
    ${isClickable ? 'cursor-pointer' : ''}
    ${className}
  `;

  if (isClickable) {
    return (
      <m.button
        onClick={onClick}
        className={`${baseClasses} text-left w-full`}
        type="button"
        {...motionProps}
      >
        {content}
      </m.button>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}

export function StatsGrid({
  children,
  columns = 4,
  className = '',
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${colClasses[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
}

export function MiniStat({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: number | string;
  variant?: StatVariant;
}) {
  const styles = variantStyles[variant];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-text-muted">{label}</span>
      <span className={`text-sm font-medium ${styles.text}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  );
}

'use client';

import { type ReactNode } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { useReducedMotion } from '@/app/components/motion';
import { spring } from '@/app/styles/tokens';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  animated?: boolean;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  default: {
    bg: 'bg-bg-secondary',
    text: 'text-text-secondary',
    dot: 'bg-text-muted',
  },
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    dot: 'bg-primary',
  },
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    dot: 'bg-success',
  },
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    dot: 'bg-warning',
  },
  error: {
    bg: 'bg-error/10',
    text: 'text-error',
    dot: 'bg-error',
  },
  info: {
    bg: 'bg-info/10',
    text: 'text-info',
    dot: 'bg-info',
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-3 py-1 text-sm gap-1.5',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  dot = false,
  removable = false,
  onRemove,
  className = '',
  animated = true,
}: BadgeProps) {
  const styles = variantStyles[variant];
  const prefersReduced = useReducedMotion();
  const shouldAnimate = animated && !prefersReduced;

  const content = (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${styles.bg} ${styles.text}
        ${sizeStyles[size]}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot} flex-shrink-0`} />
      )}
      {icon && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
      {children}
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="flex-shrink-0 ml-0.5 rounded-full p-0.5 hover:bg-black/10 transition-colors"
          aria-label="移除"
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </button>
      )}
    </span>
  );

  if (!shouldAnimate) return content;

  return (
    <m.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={spring.snappy}
      className="inline-flex"
    >
      {content}
    </m.span>
  );
}

export function BadgeGroup({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence mode="popLayout">
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {children}
      </div>
    </AnimatePresence>
  );
}

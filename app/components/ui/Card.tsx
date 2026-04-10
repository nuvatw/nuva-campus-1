'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { m } from 'motion/react';
import { useReducedMotion } from '@/app/components/motion';
import { spring } from '@/app/styles/tokens';

export type CardVariant = 'surface' | 'elevated' | 'interactive' | 'hero';

type MotionConflicts = 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag' | 'onAnimationEnd';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, MotionConflicts> {
  variant?: CardVariant;
  as?: 'div' | 'article' | 'section';
  noPadding?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  surface: `
    bg-bg-card border border-border rounded-xl shadow-elevation-1
  `,
  elevated: `
    bg-bg-card border border-border rounded-xl shadow-elevation-2
  `,
  interactive: `
    bg-bg-card border border-border rounded-xl shadow-elevation-1
    cursor-pointer
    focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none
  `,
  hero: `
    bg-bg-card rounded-xl shadow-elevation-3
    border border-primary/20
    bg-gradient-to-br from-bg-card via-bg-card to-primary-50/30
  `,
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'surface', as: Tag = 'div', noPadding = false, className = '', children, onClick, ...props }, ref) => {
    const prefersReduced = useReducedMotion();
    const isInteractive = variant === 'interactive' || !!onClick;

    const motionProps = prefersReduced || !isInteractive
      ? {}
      : {
          whileHover: { y: -3, boxShadow: '0 8px 16px -4px rgba(28, 25, 23, 0.1)' },
          whileTap: { scale: 0.99 },
          transition: spring.tactile,
        };

    return (
      <m.div
        ref={ref}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onClick={onClick}
        className={`
          ${variantStyles[variant]}
          ${noPadding ? '' : 'p-6'}
          transition-colors duration-200
          ${className}
        `.replace(/\s+/g, ' ').trim()}
        {...motionProps}
        {...props}
      >
        {children}
      </m.div>
    );
  }
);

Card.displayName = 'Card';

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mt-4 pt-4 border-t border-border-light flex items-center gap-3 ${className}`}>
      {children}
    </div>
  );
}

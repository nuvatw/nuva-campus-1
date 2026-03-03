'use client';

import type { ReactNode } from 'react';
import { Button } from './Button';
import { FadeIn } from '@/app/components/motion';

type EmptyStateVariant = 'generic' | 'missions' | 'events' | 'participants' | 'search' | 'data';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  variant?: EmptyStateVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  compact?: boolean;
}

const illustrations: Record<EmptyStateVariant, ReactNode> = {
  generic: (
    <svg className="w-20 h-20 text-text-muted" fill="none" viewBox="0 0 80 80" aria-hidden="true">
      <rect x="16" y="20" width="48" height="40" rx="6" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <path d="M16 34h48" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <circle cx="40" cy="48" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <path d="M37 48l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </svg>
  ),
  missions: (
    <svg className="w-20 h-20 text-text-muted" fill="none" viewBox="0 0 80 80" aria-hidden="true">
      <path d="M40 14l4 8h8l-6 5 2 8-8-5-8 5 2-8-6-5h8l4-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.4" />
      <rect x="20" y="40" width="40" height="6" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <rect x="24" y="50" width="32" height="6" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <rect x="28" y="60" width="24" height="6" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
    </svg>
  ),
  events: (
    <svg className="w-20 h-20 text-text-muted" fill="none" viewBox="0 0 80 80" aria-hidden="true">
      <rect x="16" y="20" width="48" height="44" rx="6" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <path d="M16 32h48" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <rect x="28" y="24" width="2" height="8" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="50" y="24" width="2" height="8" rx="1" fill="currentColor" opacity="0.3" />
      <circle cx="32" cy="44" r="3" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <circle cx="48" cy="44" r="3" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <circle cx="40" cy="54" r="3" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
    </svg>
  ),
  participants: (
    <svg className="w-20 h-20 text-text-muted" fill="none" viewBox="0 0 80 80" aria-hidden="true">
      <circle cx="40" cy="30" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <path d="M22 62c0-10 8-18 18-18s18 8 18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <circle cx="58" cy="34" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <circle cx="22" cy="34" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
    </svg>
  ),
  search: (
    <svg className="w-20 h-20 text-text-muted" fill="none" viewBox="0 0 80 80" aria-hidden="true">
      <circle cx="36" cy="36" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <path d="M46 46l14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M30 36h12M36 30v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
    </svg>
  ),
  data: (
    <svg className="w-20 h-20 text-text-muted" fill="none" viewBox="0 0 80 80" aria-hidden="true">
      <rect x="14" y="48" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <rect x="34" y="36" width="12" height="28" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <rect x="54" y="24" width="12" height="40" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <path d="M14 68h52" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
    </svg>
  ),
};

export function EmptyState({
  icon,
  title,
  description,
  variant = 'generic',
  action,
  secondaryAction,
  compact = false,
}: EmptyStateProps) {
  const illustration = icon || illustrations[variant];

  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="mb-3 opacity-60" aria-hidden="true">
          {illustration}
        </div>
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        {description && (
          <p className="text-xs text-text-muted mt-1 max-w-xs">{description}</p>
        )}
        {action && (
          <Button variant="ghost" size="sm" onClick={action.onClick} className="mt-3">
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="mb-5" aria-hidden="true">
          {illustration}
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-text-secondary max-w-sm mb-8 leading-relaxed">{description}</p>
        )}
        {(action || secondaryAction) && (
          <div className="flex items-center gap-3">
            {action && (
              <Button variant="secondary" size="sm" onClick={action.onClick}>
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button variant="ghost" size="sm" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </FadeIn>
  );
}

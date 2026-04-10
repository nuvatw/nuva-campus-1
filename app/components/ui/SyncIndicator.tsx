'use client';

interface SyncIndicatorProps {
  /** Whether data is currently being revalidated */
  isValidating: boolean;
  /** Optional label */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * SyncIndicator — Subtle background refresh indicator.
 *
 * Shows a pulsing dot when SWR is revalidating data in the background.
 * Non-intrusive, positioned inline with other UI elements.
 */
export function SyncIndicator({
  isValidating,
  label,
  size = 'sm',
  className = '',
}: SyncIndicatorProps) {
  if (!isValidating) return null;

  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  const ringSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="relative flex">
        <span
          className={`absolute inline-flex ${ringSize} rounded-full bg-primary/30 animate-ping`}
          aria-hidden="true"
        />
        <span
          className={`relative inline-flex ${dotSize} rounded-full bg-primary`}
          aria-hidden="true"
        />
      </span>
      {label && (
        <span className="text-xs text-text-muted">{label}</span>
      )}
      <span className="sr-only">資料同步中</span>
    </div>
  );
}

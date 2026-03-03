'use client';

import { m, useReducedMotion } from 'motion/react';
import { spring } from '@/app/styles/tokens';

interface ParticipantCardProps {
  name: string;
  email?: string;
  ambassadorId?: string | null;
  memberType: string;
  isCompleted: boolean;
  completedLabel: string;
  onClick: () => void;
}

export function ParticipantCard({
  name,
  email,
  ambassadorId,
  memberType,
  isCompleted,
  completedLabel,
  onClick,
}: ParticipantCardProps) {
  const prefersReduced = useReducedMotion();

  const initials = name
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleLabel = memberType === 'ambassador' ? '大使' : memberType === 'nunu' ? '努努' : '參與者';

  return (
    <m.button
      type="button"
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 text-left transition-colors w-full ${
        isCompleted
          ? 'bg-success/5 border-success/20'
          : 'bg-bg-card border-border-light hover:border-primary'
      }`}
      whileHover={prefersReduced ? undefined : { y: -2 }}
      whileTap={prefersReduced ? undefined : { scale: 0.97 }}
      transition={spring.tactile}
    >
      <div className="flex items-start gap-3">
        {/* Avatar / ID */}
        {ambassadorId ? (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shrink-0 ${
            isCompleted ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
          }`}>
            {ambassadorId}
          </div>
        ) : (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0 ${
            isCompleted ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
          }`}>
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-text-primary truncate">{name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
              memberType === 'ambassador'
                ? 'bg-primary/10 text-primary'
                : memberType === 'nunu'
                ? 'bg-accent/10 text-accent'
                : 'bg-bg-secondary text-text-muted'
            }`}>
              {roleLabel}
            </span>
          </div>
          {email && (
            <div className="text-xs text-text-muted truncate mt-0.5">{email}</div>
          )}
        </div>
      </div>

      {/* Status indicator */}
      {isCompleted && (
        <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-success">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>{completedLabel}</span>
        </div>
      )}
    </m.button>
  );
}

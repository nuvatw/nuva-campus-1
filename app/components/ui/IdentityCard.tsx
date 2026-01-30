'use client';

import { ReactNode } from 'react';

interface IdentityCardProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  onClick: () => void;
  index?: number;
  isShaking?: boolean;
  isLocked?: boolean;
  showLockOverlay?: boolean;
}

export function IdentityCard({
  title,
  subtitle,
  icon,
  onClick,
  index = 0,
  isShaking = false,
  isLocked = false,
  showLockOverlay = false,
}: IdentityCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group w-full p-6 rounded-xl border bg-bg-card
        text-center transition-all duration-300 ease-out relative overflow-hidden
        focus:outline-none focus:ring-2 focus:ring-primary/20
        animate-fade-in-up animate-initial
        ${isLocked
          ? 'border-border-light opacity-60 cursor-not-allowed'
          : 'border-border-light hover:border-primary/30 hover:shadow-lg hover:-translate-y-1'
        }
        ${isShaking ? 'animate-shake' : ''}
      `}
      style={{ animationDelay: `${index * 80 + 150}ms`, animationFillMode: 'forwards' }}
    >
      {/* Icon */}
      <div className={`flex justify-center mb-3 text-text-secondary transition-all duration-300 ${!isLocked && 'group-hover:text-primary group-hover:scale-110'}`}>
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-medium text-text-primary mb-1 tracking-wide">
        {title}
      </h3>

      {/* Divider */}
      <div className={`w-6 h-px bg-border mx-auto mb-2 transition-all duration-300 ${!isLocked && 'group-hover:w-10 group-hover:bg-primary'}`} />

      {/* Subtitle */}
      <p className="text-xs text-text-secondary">
        {subtitle}
      </p>

      {/* Lock Overlay */}
      {showLockOverlay && (
        <div className="absolute inset-0 bg-bg-card/90 flex items-center justify-center animate-fade-in rounded-xl">
          <div className="flex flex-col items-center">
            <div className="animate-bounce-in">
              <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-sm text-text-secondary mt-2">尚未開放</span>
          </div>
        </div>
      )}
    </button>
  );
}

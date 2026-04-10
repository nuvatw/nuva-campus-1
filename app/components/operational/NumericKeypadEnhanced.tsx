'use client';

import { useCallback } from 'react';
import { m, useReducedMotion } from 'motion/react';
import { spring } from '@/app/styles/tokens';

interface NumericKeypadEnhancedProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onConfirm?: () => void;
  showConfirm?: boolean;
  disabled?: boolean;
}

function KeypadButton({
  children,
  onClick,
  variant = 'default',
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'action' | 'backspace';
  disabled?: boolean;
}) {
  const prefersReduced = useReducedMotion();

  const variantClasses = {
    default: 'bg-bg-card text-text-primary hover:bg-bg-secondary',
    action: 'bg-success/10 text-success hover:bg-success/20',
    backspace: 'bg-bg-card text-text-secondary hover:bg-bg-secondary',
  };

  return (
    <m.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-14 md:h-16 rounded-xl border border-border-light
        text-xl md:text-2xl font-medium
        transition-colors duration-150 touch-target
        focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantClasses[variant]}`}
      whileTap={prefersReduced || disabled ? undefined : { scale: 0.92, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
      transition={spring.snappy}
    >
      {children}
    </m.button>
  );
}

export function NumericKeypadEnhanced({
  onDigit,
  onBackspace,
  onConfirm,
  showConfirm = false,
  disabled = false,
}: NumericKeypadEnhancedProps) {
  const handleDigit = useCallback((d: string) => {
    if (!disabled) onDigit(d);
  }, [disabled, onDigit]);

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
      {digits.map((digit) => (
        <KeypadButton key={digit} onClick={() => handleDigit(digit)} disabled={disabled}>
          {digit}
        </KeypadButton>
      ))}

      {/* Bottom row */}
      {showConfirm && onConfirm ? (
        <KeypadButton onClick={onConfirm} variant="action" disabled={disabled}>
          <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </KeypadButton>
      ) : (
        <div />
      )}

      <KeypadButton onClick={() => handleDigit('0')} disabled={disabled}>
        0
      </KeypadButton>

      <KeypadButton onClick={onBackspace} variant="backspace" disabled={disabled}>
        <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
        </svg>
      </KeypadButton>
    </div>
  );
}

'use client';

import { forwardRef, useState, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { useReducedMotion } from '@/app/components/motion';
import { spring } from '@/app/styles/tokens';

export type InputVariant = 'default' | 'error';
export type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  inputSize?: InputSize;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  showCharCount?: boolean;
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      inputSize = 'md',
      label,
      helperText,
      errorMessage,
      leftIcon,
      rightIcon,
      fullWidth = true,
      showCharCount = false,
      className = '',
      disabled,
      id,
      maxLength,
      value,
      defaultValue,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    const hasError = variant === 'error' || !!errorMessage;
    const prefersReduced = useReducedMotion();

    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const charCount = typeof value === 'string' ? value.length : typeof defaultValue === 'string' ? defaultValue.length : 0;

    const borderColor = hasError
      ? 'border-error focus:border-error'
      : isFocused
        ? 'border-primary'
        : 'border-border';

    const focusShadow = hasError
      ? 'focus:shadow-[0_0_0_3px_rgba(220,38,38,0.15)]'
      : 'focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]';

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <m.label
            htmlFor={inputId}
            className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
              hasError ? 'text-error' : isFocused ? 'text-primary' : 'text-text-primary'
            }`}
            {...(!prefersReduced && isFocused ? { animate: { x: [0, -1, 0] }, transition: { duration: 0.2 } } : {})}
          >
            {label}
          </m.label>
        )}

        <div className="relative">
          {leftIcon && (
            <span
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                hasError ? 'text-error' : isFocused ? 'text-primary' : 'text-text-muted'
              }`}
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            maxLength={maxLength}
            value={value}
            defaultValue={defaultValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`
              w-full rounded-xl border bg-bg-primary
              text-text-primary placeholder:text-text-muted
              transition-all duration-200
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-secondary
              ${borderColor}
              ${focusShadow}
              ${sizeStyles[inputSize]}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `.replace(/\s+/g, ' ').trim()}
            {...props}
          />

          {rightIcon && (
            <span
              className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                isFocused ? 'text-primary' : 'text-text-muted'
              }`}
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 min-h-[1.25rem]">
          <AnimatePresence mode="wait">
            {errorMessage && (
              <m.p
                key="error"
                id={errorId}
                className="text-sm text-error"
                role="alert"
                initial={prefersReduced ? undefined : { opacity: 0, y: -4 }}
                animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
                exit={prefersReduced ? undefined : { opacity: 0, y: -4 }}
                transition={prefersReduced ? undefined : spring.snappy}
              >
                {errorMessage}
              </m.p>
            )}
            {helperText && !errorMessage && (
              <m.p
                key="helper"
                id={helperId}
                className="text-sm text-text-muted"
                initial={prefersReduced ? undefined : { opacity: 0 }}
                animate={prefersReduced ? undefined : { opacity: 1 }}
                transition={prefersReduced ? undefined : { duration: 0.2 }}
              >
                {helperText}
              </m.p>
            )}
          </AnimatePresence>

          {showCharCount && maxLength && (
            <span className={`text-xs ml-auto ${
              charCount >= maxLength ? 'text-error' : 'text-text-muted'
            }`}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

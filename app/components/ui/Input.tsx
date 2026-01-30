'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

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
}

const variantStyles: Record<InputVariant, string> = {
  default: `
    border-border
    focus:border-primary focus:shadow-[0_0_0_3px_rgba(74,85,104,0.2)]
  `,
  error: `
    border-error
    focus:border-error focus:shadow-[0_0_0_3px_rgba(229,62,62,0.2)]
  `,
};

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
      className = '',
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    const hasError = variant === 'error' || !!errorMessage;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true">
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
            className={`
              w-full rounded-lg border bg-bg-primary
              text-text-primary placeholder:text-text-muted
              transition-all duration-200
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-secondary
              ${variantStyles[hasError ? 'error' : variant]}
              ${sizeStyles[inputSize]}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `.replace(/\s+/g, ' ').trim()}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </div>

        {errorMessage && (
          <p id={errorId} className="mt-2 text-sm text-error" role="alert">
            {errorMessage}
          </p>
        )}

        {helperText && !errorMessage && (
          <p id={helperId} className="mt-2 text-sm text-text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

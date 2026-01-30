'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-primary text-white border-transparent
    hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-hover
    active:translate-y-0 active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none
    focus-visible:ring-2 focus-visible:ring-primary/30
  `,
  secondary: `
    bg-transparent text-primary border border-border
    hover:border-primary hover:bg-bg-secondary
    disabled:opacity-50 disabled:cursor-not-allowed
    focus-visible:ring-2 focus-visible:ring-primary/30
  `,
  ghost: `
    bg-transparent text-text-secondary border-transparent
    hover:bg-bg-secondary hover:text-text-primary
    disabled:opacity-50 disabled:cursor-not-allowed
    focus-visible:ring-2 focus-visible:ring-primary/30
  `,
  danger: `
    bg-error text-white border-transparent
    hover:bg-error/90
    disabled:opacity-50 disabled:cursor-not-allowed
    focus-visible:ring-2 focus-visible:ring-error/30
  `,
  icon: `
    bg-transparent text-text-secondary border-transparent p-2
    hover:bg-bg-secondary hover:text-text-primary
    disabled:opacity-50 disabled:cursor-not-allowed
    focus-visible:ring-2 focus-visible:ring-primary/30
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center gap-2
          rounded-lg font-medium tracking-wide
          transition-all duration-200
          focus-visible:outline-none
          touch-target
          ${variantStyles[variant]}
          ${variant !== 'icon' ? sizeStyles[size] : ''}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `.replace(/\s+/g, ' ').trim()}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="sr-only">載入中</span>
          </>
        ) : (
          <>
            {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

'use client';

import Link from 'next/link';
import { FadeIn } from '@/app/components/motion/FadeIn';

interface BackConfig {
  href: string;
  label?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  variant?: 'centered' | 'left' | 'three-column';
  back?: BackConfig;
  trailing?: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: string;
}

function BackLink({ href, label = '返回' }: BackConfig) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span className="text-sm">{label}</span>
    </Link>
  );
}

export function PageHeader({
  title,
  subtitle,
  variant = 'centered',
  back,
  trailing,
  actions,
  maxWidth = 'max-w-4xl',
}: PageHeaderProps) {
  if (variant === 'three-column') {
    return (
      <FadeIn direction="none" duration={0.25}>
        <div className={`flex items-center justify-between mb-6 ${maxWidth} mx-auto`}>
          {back ? <BackLink {...back} /> : <div />}
          <h1 className="text-xl font-semibold font-display text-text-primary">{title}</h1>
          {trailing ?? <div />}
        </div>
      </FadeIn>
    );
  }

  if (variant === 'left') {
    return (
      <FadeIn direction="up" duration={0.3}>
        <div className={`mb-6 ${maxWidth} mx-auto`}>
          {back && (
            <div className="mb-4">
              <BackLink {...back} />
            </div>
          )}
          <h1 className="text-2xl font-semibold font-display text-text-primary">
            {title}
          </h1>
          {subtitle && (
            <p className="text-text-secondary mt-1">{subtitle}</p>
          )}
          {actions && <div className="mt-4 flex items-center gap-2">{actions}</div>}
        </div>
      </FadeIn>
    );
  }

  // centered (default)
  return (
    <FadeIn direction="up" duration={0.3}>
      <div className={`text-center mb-12 ${maxWidth} mx-auto`}>
        <h1 className="text-3xl font-semibold font-display text-text-primary mb-3">
          {title}
        </h1>
        {subtitle && (
          <p className="text-text-secondary">{subtitle}</p>
        )}
        {actions && <div className="mt-4 flex justify-center gap-2">{actions}</div>}
      </div>
    </FadeIn>
  );
}

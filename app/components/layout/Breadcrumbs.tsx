'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { m } from 'motion/react';

interface BreadcrumbSegment {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  /** Explicit segments override (skips auto-generation) */
  segments?: BreadcrumbSegment[];
  /** Map path segments to custom labels */
  labelMap?: Record<string, string>;
}

const DEFAULT_LABELS: Record<string, string> = {
  guardian: '守護者',
  nunu: '努努',
  fafa: '法法',
  ambassadors: '大使們',
  events: '活動',
  checkin: '報到',
  lunch: '便當',
  notify: '通知',
  run: '執行',
  dashboard: '總覽',
};

export function Breadcrumbs({ segments: explicitSegments, labelMap = {} }: BreadcrumbsProps) {
  const pathname = usePathname();

  const segments: BreadcrumbSegment[] = explicitSegments ?? (() => {
    const parts = pathname.split('/').filter(Boolean);
    return parts.map((part, index) => {
      const href = '/' + parts.slice(0, index + 1).join('/');
      const label = labelMap[part] ?? DEFAULT_LABELS[part] ?? part;
      return { label, href };
    });
  })();

  if (segments.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-sm text-text-secondary">
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          return (
            <m.li
              key={segment.href}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="flex items-center gap-1.5"
            >
              {index > 0 && (
                <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              {isLast ? (
                <span
                  className="text-text-primary font-medium"
                  aria-current="page"
                >
                  {segment.label}
                </span>
              ) : (
                <Link
                  href={segment.href}
                  className="hover:text-text-primary transition-colors"
                >
                  {segment.label}
                </Link>
              )}
            </m.li>
          );
        })}
      </ol>
    </nav>
  );
}

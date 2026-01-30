'use client';

import { ReactNode } from 'react';

type StatVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface StatsCardProps {
  /** 標題 */
  title: string;
  /** 數值 */
  value: number | string;
  /** 副標題/說明 */
  subtitle?: string;
  /** 圖標 */
  icon?: ReactNode;
  /** 變體樣式 */
  variant?: StatVariant;
  /** 是否顯示趨勢 */
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  /** 點擊回調 */
  onClick?: () => void;
  /** 額外的 className */
  className?: string;
  /** 載入中狀態 */
  loading?: boolean;
}

const variantStyles: Record<StatVariant, { bg: string; text: string; icon: string }> = {
  default: {
    bg: 'bg-bg-card',
    text: 'text-text-primary',
    icon: 'text-text-muted',
  },
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    icon: 'text-success',
  },
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    icon: 'text-warning',
  },
  error: {
    bg: 'bg-error/10',
    text: 'text-error',
    icon: 'text-error',
  },
  info: {
    bg: 'bg-info/10',
    text: 'text-info',
    icon: 'text-info',
  },
};

/**
 * StatsCard - 統計數據卡片元件
 *
 * 用於顯示單一統計數據，支援：
 * - 多種變體樣式
 * - 趨勢指示
 * - 圖標
 * - 點擊互動
 *
 * @example
 * ```tsx
 * <StatsCard
 *   title="總報名人數"
 *   value={156}
 *   icon={<UsersIcon />}
 *   variant="success"
 *   trend={{ value: 12, isPositive: true }}
 * />
 * ```
 */
export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  trend,
  onClick,
  className = '',
  loading = false,
}: StatsCardProps) {
  const styles = variantStyles[variant];
  const isClickable = !!onClick;

  const content = (
    <>
      {/* 頂部：圖標和標題 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-text-secondary">{title}</span>
        {icon && (
          <span className={`${styles.icon}`}>
            {icon}
          </span>
        )}
      </div>

      {/* 數值 */}
      {loading ? (
        <div className="h-9 w-20 bg-bg-secondary animate-pulse rounded" />
      ) : (
        <p className={`text-3xl font-semibold ${styles.text}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      )}

      {/* 底部：副標題或趨勢 */}
      <div className="mt-2 flex items-center gap-2">
        {trend && (
          <span
            className={`text-sm font-medium flex items-center gap-1 ${
              trend.isPositive ? 'text-success' : 'text-error'
            }`}
          >
            {trend.isPositive ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            {trend.value}%
            {trend.label && <span className="text-text-muted ml-1">{trend.label}</span>}
          </span>
        )}
        {subtitle && !trend && (
          <span className="text-sm text-text-muted">{subtitle}</span>
        )}
      </div>
    </>
  );

  const baseClasses = `
    ${styles.bg} rounded-xl p-5 border border-border
    transition-all duration-200
    ${isClickable ? 'cursor-pointer hover:shadow-md hover:border-primary/30' : ''}
    ${className}
  `;

  if (isClickable) {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} text-left w-full`}
        type="button"
      >
        {content}
      </button>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}

/**
 * StatsGrid - 統計卡片網格容器
 */
export function StatsGrid({
  children,
  columns = 4,
  className = '',
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${colClasses[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * MiniStat - 迷你統計元件（用於表格或列表中）
 */
export function MiniStat({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: number | string;
  variant?: StatVariant;
}) {
  const styles = variantStyles[variant];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-text-muted">{label}</span>
      <span className={`text-sm font-medium ${styles.text}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  );
}

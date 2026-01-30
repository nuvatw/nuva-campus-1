'use client';

import { ReactNode } from 'react';

interface SkeletonProps {
  /** 寬度 */
  width?: string | number;
  /** 高度 */
  height?: string | number;
  /** 圓角 */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** 是否為圓形 */
  circle?: boolean;
  /** 額外 className */
  className?: string;
}

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

/**
 * Skeleton - 骨架屏元件
 *
 * 用於載入狀態的佔位顯示
 */
export function Skeleton({
  width,
  height,
  rounded = 'md',
  circle = false,
  className = '',
}: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`
        bg-bg-secondary animate-pulse
        ${circle ? 'rounded-full' : roundedClasses[rounded]}
        ${className}
      `}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * SkeletonText - 文字骨架
 */
export function SkeletonText({
  lines = 1,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 && lines > 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard - 卡片骨架
 */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-bg-card border border-border rounded-xl p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton width={100} height={16} />
        <Skeleton width={24} height={24} rounded="full" />
      </div>
      <Skeleton width={80} height={32} className="mb-2" />
      <Skeleton width={120} height={14} />
    </div>
  );
}

/**
 * SkeletonStatsGrid - 統計網格骨架
 */
export function SkeletonStatsGrid({
  count = 4,
  columns = 4,
}: {
  count?: number;
  columns?: 2 | 3 | 4;
}) {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${colClasses[columns]} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * SkeletonTable - 表格骨架
 */
export function SkeletonTable({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-bg-secondary px-4 py-3 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height={16} className="flex-1" />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-4 py-3 flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} height={20} className="flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * SkeletonList - 列表骨架
 */
export function SkeletonList({
  count = 5,
  showAvatar = false,
}: {
  count?: number;
  showAvatar?: boolean;
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-bg-card border border-border rounded-lg">
          {showAvatar && <Skeleton width={40} height={40} circle />}
          <div className="flex-1 space-y-2">
            <Skeleton height={18} width="60%" />
            <Skeleton height={14} width="40%" />
          </div>
          <Skeleton width={80} height={28} rounded="lg" />
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonEventCard - 活動卡片骨架
 */
export function SkeletonEventCard() {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton height={24} width="70%" className="mb-2" />
          <Skeleton height={16} width="50%" />
        </div>
        <Skeleton width={80} height={28} rounded="full" />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="space-y-1">
          <Skeleton height={14} width="40%" />
          <Skeleton height={20} width="60%" />
        </div>
        <div className="space-y-1">
          <Skeleton height={14} width="40%" />
          <Skeleton height={20} width="60%" />
        </div>
      </div>
    </div>
  );
}

/**
 * PageSkeleton - 頁面級骨架
 */
export function PageSkeleton({
  children,
  title = true,
}: {
  children?: ReactNode;
  title?: boolean;
}) {
  return (
    <div className="space-y-6">
      {title && (
        <div className="flex items-center justify-between">
          <Skeleton height={32} width={200} />
          <Skeleton height={40} width={120} rounded="lg" />
        </div>
      )}
      {children || <SkeletonStatsGrid />}
    </div>
  );
}

/**
 * DashboardSkeleton - Dashboard 專用骨架
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <SkeletonStatsGrid count={4} />

      {/* Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton height={24} width={150} />
          <Skeleton height={36} width={200} rounded="lg" />
        </div>
        <SkeletonTable rows={5} columns={5} />
      </div>
    </div>
  );
}

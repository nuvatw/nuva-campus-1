'use client';

import { ReactNode } from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  circle?: boolean;
  className?: string;
}

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

/**
 * Skeleton — Shimmer skeleton primitive
 *
 * Uses directional left-to-right shimmer with warm stone tones.
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
        animate-shimmer
        ${circle ? 'rounded-full' : roundedClasses[rounded]}
        ${className}
      `}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * SkeletonText — Multi-line text shimmer
 */
export function SkeletonText({
  lines = 1,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 && lines > 1 ? '75%' : '100%'}
          rounded="lg"
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard — Card layout shimmer
 */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-bg-card border border-border rounded-xl p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton width={100} height={14} rounded="lg" />
        <Skeleton width={24} height={24} circle />
      </div>
      <Skeleton width={80} height={28} className="mb-3" rounded="lg" />
      <Skeleton width={120} height={12} rounded="lg" />
    </div>
  );
}

/**
 * SkeletonStatsGrid — Stats grid shimmer
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
 * SkeletonTable — Table shimmer
 */
export function SkeletonTable({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-bg-secondary px-4 py-3 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height={14} className="flex-1" rounded="lg" />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-4 py-3.5 flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} height={16} className="flex-1" rounded="lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * SkeletonList — List shimmer with optional avatars
 */
export function SkeletonList({
  count = 5,
  showAvatar = false,
}: {
  count?: number;
  showAvatar?: boolean;
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-bg-card border border-border rounded-xl">
          {showAvatar && <Skeleton width={40} height={40} circle />}
          <div className="flex-1 space-y-2">
            <Skeleton height={16} width="60%" rounded="lg" />
            <Skeleton height={12} width="40%" rounded="lg" />
          </div>
          <Skeleton width={80} height={28} rounded="lg" />
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonEventCard — Event card shimmer
 */
export function SkeletonEventCard() {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton height={22} width="70%" className="mb-2" rounded="lg" />
          <Skeleton height={14} width="50%" rounded="lg" />
        </div>
        <Skeleton width={80} height={28} rounded="full" />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="space-y-1.5">
          <Skeleton height={12} width="40%" rounded="lg" />
          <Skeleton height={18} width="60%" rounded="lg" />
        </div>
        <div className="space-y-1.5">
          <Skeleton height={12} width="40%" rounded="lg" />
          <Skeleton height={18} width="60%" rounded="lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonParticipantGrid — Operational checkin/lunch shimmer
 */
export function SkeletonParticipantGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton width={120} height={24} rounded="lg" />
          <Skeleton width={60} height={20} rounded="lg" />
        </div>
        {/* Search area */}
        <div className="mb-6 p-4 bg-bg-card rounded-xl border border-border-light">
          <Skeleton width={140} height={14} className="mx-auto mb-3" rounded="lg" />
          <div className="flex justify-center gap-2 mb-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} width={56} height={64} rounded="lg" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} height={48} rounded="xl" />
            ))}
          </div>
        </div>
        {/* Filter bar */}
        <div className="flex gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width={80} height={36} rounded="full" />
          ))}
        </div>
        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: count }).map((_, i) => (
            <Skeleton key={i} height={80} rounded="xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * PageSkeleton — Full page shimmer
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
          <Skeleton height={28} width={200} rounded="lg" />
          <Skeleton height={40} width={120} rounded="xl" />
        </div>
      )}
      {children || <SkeletonStatsGrid />}
    </div>
  );
}

/**
 * DashboardSkeleton — Dashboard shimmer
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <SkeletonStatsGrid count={4} />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton height={22} width={150} rounded="lg" />
          <Skeleton height={36} width={200} rounded="xl" />
        </div>
        <SkeletonTable rows={5} columns={5} />
      </div>
    </div>
  );
}

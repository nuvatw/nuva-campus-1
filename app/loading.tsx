import { Skeleton } from '@/app/components/ui';

/**
 * Global Loading — Branded shimmer loading screen
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary" role="status" aria-label="頁面載入中">
      {/* Brand text */}
      <div className="mb-8">
        <Skeleton width={100} height={32} rounded="lg" />
      </div>

      {/* Loading shimmer bars */}
      <div className="flex flex-col items-center gap-2.5 w-48">
        <Skeleton height={4} rounded="full" className="w-full" />
        <Skeleton height={4} rounded="full" className="w-3/4" />
        <Skeleton height={4} rounded="full" className="w-1/2" />
      </div>

      {/* Status text */}
      <div className="mt-8">
        <Skeleton width={64} height={14} rounded="lg" />
      </div>
    </div>
  );
}

import { Skeleton, SkeletonStatsGrid, SkeletonTable } from '@/app/components/ui';

/**
 * Guardian Loading — Matches dashboard layout
 */
export default function Loading() {
  return (
    <div className="py-12 px-6" role="status" aria-label="頁面載入中">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton height={28} width={160} rounded="lg" className="mb-2" />
            <Skeleton height={14} width={200} rounded="lg" />
          </div>
          <Skeleton width={40} height={40} rounded="xl" />
        </div>

        {/* Stats grid */}
        <div className="mb-8">
          <SkeletonStatsGrid count={2} columns={2} />
        </div>

        {/* Table */}
        <SkeletonTable rows={4} columns={4} />
      </div>
    </div>
  );
}

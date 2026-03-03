import { Skeleton, SkeletonCard } from '@/app/components/ui';

/**
 * Guardian Event Detail Loading — Matches event overview layout
 */
export default function Loading() {
  return (
    <div className="py-8 px-6" role="status" aria-label="頁面載入中">
      <div className="max-w-4xl mx-auto">
        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <Skeleton width={180} height={28} rounded="lg" />
          <Skeleton width={40} height={40} rounded="xl" />
        </div>

        {/* Stats cards — 2 col grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Event info card */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <Skeleton height={20} width={100} className="mb-4" rounded="lg" />
          <div className="space-y-3">
            <div className="flex gap-8">
              <div>
                <Skeleton height={12} width={48} className="mb-2" rounded="lg" />
                <Skeleton height={20} width={32} rounded="lg" />
              </div>
              <div>
                <Skeleton height={12} width={48} className="mb-2" rounded="lg" />
                <Skeleton height={20} width={32} rounded="lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={56} rounded="xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

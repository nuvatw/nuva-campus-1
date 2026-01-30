import { Skeleton } from '@/app/components/ui/Skeleton';

/**
 * AuthGuard Skeleton
 *
 * 在 AuthGuard 載入驗證狀態時顯示
 */
export function AuthGuardSkeleton() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header Skeleton */}
      <div className="border-b border-border-light bg-bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-5 w-24" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-bg-card rounded-xl p-4 border border-border-light">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>

        {/* Content Cards */}
        <div className="bg-bg-card rounded-xl p-6 border border-border-light">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-bg-secondary rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-5 w-5 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthGuardSkeleton;

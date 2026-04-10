import { Skeleton } from '@/app/components/ui';

/**
 * Recruit Loading — Matches recruit page layout with hero, stats, wall, CTA
 */
export default function RecruitLoading() {
  return (
    <div className="min-h-screen bg-bg-primary" role="status" aria-label="頁面載入中">
      {/* Hero Section */}
      <section className="relative h-[100dvh] min-h-[600px] bg-gradient-to-b from-neutral-400 to-neutral-300">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 via-70% to-white" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
          <Skeleton className="w-32 h-8 rounded-full mb-6" />
          <Skeleton className="w-80 md:w-[500px] h-12 md:h-16 mb-4" rounded="lg" />
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-bg-secondary/50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <Skeleton className="w-64 h-10 mx-auto mb-4" rounded="lg" />
            <Skeleton className="w-80 h-6 mx-auto" rounded="lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-bg-card rounded-xl p-5 border border-border">
                <Skeleton className="w-10 h-10 mx-auto mb-3 rounded-full" />
                <Skeleton className="w-12 h-4 mx-auto mb-2" rounded="lg" />
                <Skeleton className="w-24 h-5 mx-auto" rounded="lg" />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="w-16 h-12 mx-auto mb-2" rounded="lg" />
                <Skeleton className="w-12 h-4 mx-auto" rounded="lg" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supporters Wall */}
      <section className="py-16 bg-gradient-to-b from-bg-primary to-bg-secondary/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <Skeleton className="w-32 h-8 mx-auto mb-3" rounded="lg" />
            <Skeleton className="w-48 h-5 mx-auto" rounded="lg" />
          </div>
          <div className="space-y-4">
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex gap-4 overflow-hidden">
                {[0, 1, 2, 3, 4].map((col) => (
                  <Skeleton key={col} className="w-72 h-32 rounded-2xl flex-shrink-0" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="w-48 h-8 mx-auto mb-3" rounded="lg" />
            <Skeleton className="w-96 h-6 mx-auto mb-2" rounded="lg" />
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Skeleton className="w-48 h-16 rounded-2xl" />
            <Skeleton className="w-48 h-16 rounded-2xl" />
          </div>
        </div>
      </section>
    </div>
  );
}

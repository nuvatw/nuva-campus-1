'use client';

import { useState, Suspense, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { SupportType } from './types';
import { useSupporters, useSupportStats } from './hooks/useSupporters';

// 首屏關鍵組件 - 直接導入
import { FixedHeader, HeroSection, StatsSection, Footer } from './components';

// LoadingScreen 只在 client 端渲染
const LoadingScreen = dynamic(
  () => import('./components/LoadingScreen').then(mod => ({ default: mod.LoadingScreen })),
  { ssr: false }
);

// 動態載入非首屏組件
const SupportersWall = dynamic(
  () => import('./components/SupportersWall').then(mod => ({ default: mod.SupportersWall })),
  {
    loading: () => <SupportersWallSkeleton />,
    ssr: true
  }
);

const Leaderboard = dynamic(
  () => import('./components/Leaderboard').then(mod => ({ default: mod.Leaderboard })),
  {
    loading: () => <LeaderboardSkeleton />,
    ssr: true
  }
);

const SupportFormModal = dynamic(
  () => import('./components/SupportFormModal').then(mod => ({ default: mod.SupportFormModal })),
  { ssr: false }
);

// Skeleton 組件
function SupportersWallSkeleton() {
  return (
    <section className="py-16 bg-gradient-to-b from-bg-primary to-bg-secondary/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="h-8 w-32 bg-bg-secondary rounded mx-auto mb-8 animate-pulse" />
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4 overflow-hidden">
              {[0, 1, 2, 3, 4].map((j) => (
                <div key={j} className="w-72 h-32 bg-bg-secondary rounded-2xl animate-pulse flex-shrink-0" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="bg-bg-card rounded-2xl p-6 shadow-lg border border-border-light">
      <div className="h-6 w-40 bg-bg-secondary rounded mb-6 animate-pulse" />
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary/50 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-bg-secondary" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-bg-secondary rounded mb-2" />
              <div className="h-3 w-16 bg-bg-secondary rounded" />
            </div>
            <div className="text-right">
              <div className="h-6 w-8 bg-bg-secondary rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RecruitPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    supportType: SupportType | null;
  }>({ isOpen: false, supportType: null });

  const [newCardAnimation, setNewCardAnimation] = useState<{
    name: string;
    university: string;
    type: SupportType;
  } | null>(null);

  const { supporters, isLoading: supportersLoading } = useSupporters();
  const { stats: supportStats, isLoading: statsLoading } = useSupportStats();

  // 確保只在 client 端渲染 loading screen
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 資料是否準備好
  const isDataReady = !supportersLoading && !statsLoading;

  const handleLoadingComplete = useCallback(() => {
    setIsLoadingComplete(true);
  }, []);

  const handleOpenForm = (type: SupportType) => {
    setFormModal({ isOpen: true, supportType: type });
  };

  const handleCloseForm = () => {
    setFormModal({ isOpen: false, supportType: null });
  };

  const handleFormSuccess = (data: { name: string; university: string; type: SupportType }) => {
    setNewCardAnimation(data);
    setTimeout(() => {
      setNewCardAnimation(null);
    }, 2500);
  };

  // 顯示 loading screen 的條件：已掛載且未完成載入
  const showLoading = isMounted && !isLoadingComplete;

  return (
    <>
      {/* Loading Screen - 只在 client 端渲染 */}
      {showLoading && (
        <LoadingScreen
          isDataReady={isDataReady}
          onLoadingComplete={handleLoadingComplete}
          minimumLoadTime={1800}
        />
      )}

      {/* Main Content */}
      <div className="min-h-screen bg-bg-primary">
        <FixedHeader />
        <HeroSection />
        <StatsSection />

        {/* Section 1: 應援牆 */}
        <Suspense fallback={<SupportersWallSkeleton />}>
          <SupportersWall
            supporters={supporters}
            isLoading={supportersLoading}
            newCardAnimation={newCardAnimation}
          />
        </Suspense>

        {/* Section 2: 加入我們的旅程 */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              加入我們的旅程
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed mb-4">
              無論你是想在自己的學校迎接我們，還是願意協助活動籌備，
              我們都歡迎你的參與。選擇你想要的方式，為你的學校應援！
            </p>
            <p className="text-accent font-medium mb-10">
              社會人士也很歡迎！
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {/* 我可以幫忙 */}
              <button
                onClick={() => handleOpenForm('help')}
                className="group px-10 py-5 rounded-2xl font-semibold text-lg
                  transition-colors duration-200
                  bg-bg-card border-2 border-error text-error
                  hover:bg-error hover:text-white
                  active:scale-[0.98]"
                style={{ willChange: 'transform' }}
              >
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                  </svg>
                  我可以幫忙
                </span>
              </button>

              <span className="text-text-muted text-sm hidden sm:block">或</span>

              {/* 我想參加活動 */}
              <button
                onClick={() => handleOpenForm('attend')}
                className="group px-10 py-5 rounded-2xl font-semibold text-lg
                  transition-colors duration-200
                  bg-bg-card border-2 border-accent text-accent
                  hover:bg-accent hover:text-white
                  active:scale-[0.98]"
                style={{ willChange: 'transform' }}
              >
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  我想參加活動
                </span>
              </button>
            </div>

            <p className="text-sm text-text-muted mt-6">
              點擊按鈕後可以選擇你的學校並填寫資料
            </p>
          </div>
        </section>

        {/* Section 3: 應援排行榜 */}
        <section className="py-16 px-6 bg-gradient-to-b from-bg-secondary/30 to-bg-primary">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-text-primary mb-3">
                學校應援排行榜
              </h2>
              <p className="text-text-secondary">
                為你的學校應援，讓我們知道哪些學校最期待這次活動！
              </p>
            </div>

            {statsLoading ? (
              <LeaderboardSkeleton />
            ) : (
              <Suspense fallback={<LeaderboardSkeleton />}>
                <Leaderboard stats={supportStats} />
              </Suspense>
            )}
          </div>
        </section>

        <Footer />

        {/* Support Form Modal */}
        {formModal.supportType && (
          <SupportFormModal
            isOpen={formModal.isOpen}
            onClose={handleCloseForm}
            supportType={formModal.supportType}
            onSuccess={handleFormSuccess}
          />
        )}
      </div>
    </>
  );
}

'use client';

import { useState, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { universities, cities, type University } from '@/app/data/universities';
import { LoadingSpinner } from '@/app/components/ui';
import type { SupportType } from './types';
import { useSupporters, useSupportStats } from './hooks/useSupporters';

// 首屏關鍵組件 - 直接導入
import { FixedHeader, HeroSection, StatsSection, Footer } from './components';

// 動態載入非首屏組件
const SupportersWall = dynamic(
  () => import('./components/SupportersWall').then(mod => ({ default: mod.SupportersWall })),
  {
    loading: () => <SupportersWallSkeleton />,
    ssr: true
  }
);

const ActionButtons = dynamic(
  () => import('./components/ActionButtons').then(mod => ({ default: mod.ActionButtons })),
  { ssr: false }
);

const UniversityCard = dynamic(
  () => import('./components/UniversityCard').then(mod => ({ default: mod.UniversityCard })),
  { ssr: false }
);

const SupportForm = dynamic(
  () => import('./components/SupportForm').then(mod => ({ default: mod.SupportForm })),
  { ssr: false }
);

const Leaderboard = dynamic(
  () => import('./components/Leaderboard').then(mod => ({ default: mod.Leaderboard })),
  {
    loading: () => <LeaderboardSkeleton />,
    ssr: true
  }
);

const ActivityInfo = dynamic(
  () => import('./components/ActivityInfo').then(mod => ({ default: mod.ActivityInfo })),
  { ssr: true }
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
  const [supportType, setSupportType] = useState<SupportType | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [newCardAnimation, setNewCardAnimation] = useState<{
    name: string;
    university: string;
    type: SupportType;
  } | null>(null);

  const { supporters, isLoading: supportersLoading } = useSupporters();
  const { stats: supportStats, isLoading: statsLoading } = useSupportStats();

  // 過濾大學列表
  const filteredUniversities = useMemo(() => {
    return universities.filter(u => {
      const matchesSearch = !searchQuery ||
        u.name.includes(searchQuery) ||
        u.shortName.includes(searchQuery) ||
        u.city.includes(searchQuery);
      const matchesCity = !selectedCity || u.city === selectedCity;
      return matchesSearch && matchesCity;
    });
  }, [searchQuery, selectedCity]);

  // 取得統計 Map
  const statsMap = useMemo(() => {
    const map = new Map<string, typeof supportStats[0]>();
    supportStats?.forEach(s => map.set(s.university_id, s));
    return map;
  }, [supportStats]);

  const handleSelectType = (type: SupportType) => {
    setSupportType(type);
    setSelectedUniversity(null);
    setShowForm(false);
  };

  const handleSelectUniversity = (university: University) => {
    setSelectedUniversity(university);
    if (supportType) {
      setShowForm(true);
    }
  };

  const handleFormSuccess = (data: { name: string; university: string; type: SupportType }) => {
    // 觸發飛入動畫
    setNewCardAnimation(data);
    setShowForm(false);
    setSelectedUniversity(null);

    // 動畫結束後清除
    setTimeout(() => {
      setNewCardAnimation(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <FixedHeader />
      <HeroSection />
      <StatsSection />

      {/* Section 2: 應援牆 - 動態載入 */}
      <Suspense fallback={<SupportersWallSkeleton />}>
        <SupportersWall
          supporters={supporters}
          isLoading={supportersLoading}
          newCardAnimation={newCardAnimation}
        />
      </Suspense>

      {/* Section 3: 應援表單 */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-3">
              加入我們的旅程
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
              無論你是想在自己的學校迎接我們，還是願意協助活動籌備，<br className="hidden sm:block" />
              我們都歡迎你的參與。選擇你想要的方式，找到你的學校，為它應援！
            </p>
            <p className="text-accent font-medium mt-3">
              社會人士也很歡迎！
            </p>
          </div>

          {/* Action Buttons - 動態載入 */}
          <div className="mb-12">
            <ActionButtons onSelectType={handleSelectType} selectedType={supportType} />
          </div>

          {/* 未選擇時顯示提示 */}
          {!supportType && (
            <div className="text-center py-16 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 mb-6">
                <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 11l7-7 7 7M5 19l7-7 7 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">請先選擇你想要的方式</h3>
              <p className="text-text-muted max-w-md mx-auto">
                點擊上方「<span className="text-error font-medium">我可以幫忙</span>」或「<span className="text-accent font-medium">我想參加活動</span>」按鈕，
                然後就可以搜尋你的學校囉！
              </p>
            </div>
          )}

          {/* Search & Filter - 只在選擇後顯示 */}
          {supportType && (
            <>
              <div className="mb-8 bg-bg-card rounded-2xl p-6 shadow-lg border border-border-light animate-fade-in-up">
                <div className="mb-4 pb-4 border-b border-border-light">
                  <p className="text-sm font-medium text-text-primary">
                    你選擇了：
                    <span className={`ml-2 px-3 py-1 rounded-full text-white ${supportType === 'help' ? 'bg-error' : 'bg-accent'}`}>
                      {supportType === 'help' ? '我可以幫忙' : '我想參加活動'}
                    </span>
                    <button
                      onClick={() => setSupportType(null)}
                      className="ml-3 text-text-muted hover:text-text-primary text-sm underline"
                    >
                      重新選擇
                    </button>
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      搜尋學校名稱
                    </label>
                    <div className="relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="輸入學校名稱，例如：台大、清華、成功..."
                        className="w-full pl-12 pr-4 py-3 bg-bg-primary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="md:w-48">
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      篩選城市
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-4 py-3 bg-bg-primary border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234A5568'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                    >
                      <option value="">全部城市</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border-light flex items-center justify-between">
                  <p className="text-sm text-text-muted">
                    找到 <span className="font-medium text-text-primary">{filteredUniversities.length}</span> 所學校
                    {selectedCity && <span>（{selectedCity}）</span>}
                  </p>
                  {(searchQuery || selectedCity) && (
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedCity(''); }}
                      className="text-sm text-primary hover:text-primary-dark transition-colors"
                    >
                      清除篩選
                    </button>
                  )}
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: University List */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-bg-card rounded-2xl p-6 shadow-lg border border-border-light">
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                      {filteredUniversities.map(university => (
                        <UniversityCard
                          key={university.id}
                          university={university}
                          stats={statsMap.get(university.id)}
                          isSelected={selectedUniversity?.id === university.id}
                          onClick={() => handleSelectUniversity(university)}
                        />
                      ))}
                    </div>

                    {showForm && selectedUniversity && supportType && (
                      <div className="mt-6">
                        <SupportForm
                          university={selectedUniversity}
                          supportType={supportType}
                          onSuccess={handleFormSuccess}
                          onCancel={() => setShowForm(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Leaderboard & Info */}
                <div className="space-y-6">
                  {statsLoading ? (
                    <LeaderboardSkeleton />
                  ) : (
                    <Suspense fallback={<LeaderboardSkeleton />}>
                      <Leaderboard stats={supportStats} />
                    </Suspense>
                  )}

                  {/* Activity Info - 動態載入 */}
                  <ActivityInfo />
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

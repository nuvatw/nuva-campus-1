'use client';

import SearchBar from './SearchBar';
import { FadeIn, StaggerChildren } from '@/app/components/motion';
import { AnimatedCounter } from '@/app/components/ui';
import type { University } from '@/app/data/universities';

interface HeroSectionProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearchSelect: (uni: University, agendaTab?: string) => void;
}

export default function HeroSection({
  searchQuery,
  onSearchQueryChange,
  onSearchSelect,
}: HeroSectionProps) {
  return (
    <section className="relative py-20 sm:py-28 px-6 overflow-hidden">
      {/* Atmospheric gradient mesh background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-bg-primary to-bg-primary" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% 40%, rgba(59, 130, 246, 0.15) 0%, transparent 70%),
              radial-gradient(ellipse 60% 40% at 80% 60%, rgba(59, 130, 246, 0.1) 0%, transparent 70%),
              radial-gradient(ellipse 50% 60% at 50% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 60%)
            `,
          }}
        />
        {/* Floating decorative orbs */}
        <div className="absolute top-12 left-[15%] w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float-gentle" />
        <div className="absolute bottom-8 right-[10%] w-48 h-48 bg-accent/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <FadeIn direction="none" duration={0.4}>
          {/* Badge + Search */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <SearchBar
              searchQuery={searchQuery}
              onSearchQueryChange={onSearchQueryChange}
              onSearchSelect={onSearchSelect}
            />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm shrink-0">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium text-primary">2026 校園巡迴</span>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1} offset={16}>
          <h1 className="text-3xl sm:text-5xl font-bold text-text-primary mb-6 leading-tight font-display">
            AI 露營車
            <br />
            <span className="text-primary">全國校園巡迴演講</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            4月中~5月中，走遍全台 18 個城市，
            <br className="hidden sm:block" />
            帶著 AI 科技走進每一所校園
          </p>
        </FadeIn>

        {/* Animated stats badges */}
        <StaggerChildren staggerDelay={0.08} initialDelay={0.3} className="flex items-center justify-center gap-4 sm:gap-8">
          <StaggerChildren.Item>
            <div className="text-center px-4 py-3 rounded-xl bg-bg-card/60 backdrop-blur-sm border border-border-light shadow-elevation-1">
              <div className="text-2xl sm:text-3xl font-bold text-accent">
                <AnimatedCounter value={18} />
              </div>
              <div className="text-xs sm:text-sm text-text-muted mt-0.5">城市</div>
            </div>
          </StaggerChildren.Item>
          <StaggerChildren.Item>
            <div className="text-center px-4 py-3 rounded-xl bg-bg-card/60 backdrop-blur-sm border border-border-light shadow-elevation-1">
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                <AnimatedCounter value={90} />
                <span className="text-lg">+</span>
              </div>
              <div className="text-xs sm:text-sm text-text-muted mt-0.5">大學</div>
            </div>
          </StaggerChildren.Item>
          <StaggerChildren.Item>
            <div className="text-center px-4 py-3 rounded-xl bg-bg-card/60 backdrop-blur-sm border border-border-light shadow-elevation-1">
              <div className="text-2xl sm:text-3xl font-bold text-text-primary">
                <AnimatedCounter value={30} />
              </div>
              <div className="text-xs sm:text-sm text-text-muted mt-0.5">天</div>
            </div>
          </StaggerChildren.Item>
        </StaggerChildren>
      </div>
    </section>
  );
}

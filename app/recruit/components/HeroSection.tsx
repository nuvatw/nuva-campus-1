'use client';

import { OptimizedImage } from '@/app/components/ui';

export function HeroSection() {
  return (
    <section className="relative h-[100dvh] min-h-[600px] flex flex-col items-center justify-center overflow-hidden">
      {/* 背景圖片 */}
      <div className="absolute inset-0">
        <OptimizedImage
          src="/campus_tour.jpeg"
          alt="NUVA 全國校園巡迴"
          fill
          className="object-cover object-center"
          priority
          sizePreset="hero"
          qualityPreset="hero"
        />
        {/* 漸層遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 via-70% to-[#FAFAF9]" />
      </div>

      {/* 主要內容 */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="animate-fade-in-up">
          <span className="inline-block px-4 py-1.5 bg-accent/30 text-accent-light rounded-full text-sm font-medium mb-6 border border-accent/30">
            2026 全國巡迴
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            全國露營車校園巡迴演講
          </h1>
        </div>
      </div>

      {/* 底部箭頭 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <svg className="w-8 h-8 text-white/70 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}

export default HeroSection;

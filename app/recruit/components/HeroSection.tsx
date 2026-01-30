'use client';

import { useState, useEffect } from 'react';
import { OptimizedImage } from '@/app/components/ui';

// 預先計算的固定點位置（避免 hydration mismatch）
const HERO_DOTS = [
  { left: 12, top: 8, delay: 0.2, duration: 2.5 },
  { left: 85, top: 15, delay: 1.1, duration: 3.2 },
  { left: 45, top: 22, delay: 0.8, duration: 2.8 },
  { left: 78, top: 45, delay: 2.1, duration: 3.5 },
  { left: 23, top: 65, delay: 0.5, duration: 2.2 },
  { left: 92, top: 72, delay: 1.8, duration: 3.1 },
  { left: 8, top: 38, delay: 2.5, duration: 2.9 },
  { left: 67, top: 85, delay: 0.3, duration: 3.8 },
  { left: 35, top: 52, delay: 1.5, duration: 2.6 },
  { left: 55, top: 78, delay: 2.8, duration: 3.3 },
  { left: 18, top: 92, delay: 0.9, duration: 2.4 },
  { left: 72, top: 28, delay: 1.3, duration: 3.6 },
  { left: 42, top: 12, delay: 2.2, duration: 2.7 },
  { left: 88, top: 58, delay: 0.6, duration: 3.4 },
  { left: 5, top: 75, delay: 1.7, duration: 2.3 },
];

export function HeroSection() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section className="relative h-[100dvh] min-h-[600px] flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <OptimizedImage
          src="/campus_tour.jpeg"
          alt="NUVA 全國校園巡迴 - 學生們在校園中交流學習"
          fill
          className="object-cover object-center"
          priority
          sizePreset="hero"
          qualityPreset="hero"
        />
        {/* 漸層遮罩：上方深、中間淺、底部過渡到背景色 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 via-70% to-[#FAFAF9]" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {HERO_DOTS.map((dot, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${dot.left}%`,
              top: `${dot.top}%`,
              animationDelay: `${dot.delay}s`,
              animationDuration: `${dot.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className={`transition-all duration-1000 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-1.5 bg-accent/30 text-accent-light rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-accent/30">
            2026 全國巡迴
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            全國露營車校園巡迴演講
          </h1>
        </div>
      </div>

      {/* 底部箭頭 */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce transition-all duration-1000 delay-500 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
        <svg className="w-8 h-8 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}

export default HeroSection;

'use client';

import { useEffect, useState } from 'react';

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 overflow-hidden flex items-center justify-center">
      {/* 動態背景圓圈 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 -left-40 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 left-1/2 w-80 h-80 bg-sky-200/40 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* 浮動裝飾元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] text-4xl animate-bounce">🎓</div>
        <div className="absolute top-32 right-[15%] text-3xl animate-bounce">✨</div>
        <div className="absolute bottom-40 left-[20%] text-3xl animate-bounce">🚀</div>
        <div className="absolute bottom-32 right-[10%] text-4xl animate-bounce">💡</div>
      </div>

      {/* 主要內容 */}
      <div className="relative z-10 text-center px-8">
        <div className={`inline-block px-6 py-2 bg-primary/90 text-white rounded-full text-sm font-medium mb-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          2025-2026
        </div>

        <h1 className={`text-5xl md:text-7xl font-bold mb-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="text-gray-800">第一屆 </span>
          <span className="text-primary">nuva</span>
          <span className="text-gray-800"> 校園大使</span>
        </h1>

        <p className={`text-xl md:text-2xl text-gray-600 mb-16 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          開啟你的校園影響力之旅
        </p>
      </div>

      {/* 向下滾動箭頭 */}
      <div onClick={scrollToContent} className="absolute bottom-12 left-1/2 -translate-x-1/2 cursor-pointer">
        <div className="flex flex-col items-center gap-2 text-gray-400 hover:text-primary transition-colors">
          <span className="text-sm font-medium">向下探索</span>
          <div className="animate-bounce">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
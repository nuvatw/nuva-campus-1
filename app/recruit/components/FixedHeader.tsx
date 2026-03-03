'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function FixedHeader() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    // Check initial scroll position
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Always render transparent background on server to match initial client render
  const showScrolledStyles = mounted && scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showScrolledStyles ? 'bg-bg-primary/95 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className={`flex items-center gap-2 transition-colors ${
            showScrolledStyles ? 'text-text-secondary hover:text-text-primary' : 'text-white/70 hover:text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">返回首頁</span>
        </Link>
        <span className={`text-sm font-medium transition-colors ${showScrolledStyles ? 'text-text-primary' : 'text-white'}`}>
          nuva 校園計劃
        </span>
      </div>
    </header>
  );
}

export default FixedHeader;

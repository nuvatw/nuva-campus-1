'use client';

import { useState, useEffect, useCallback } from 'react';

interface LoadingScreenProps {
  isDataReady: boolean;
  onLoadingComplete: () => void;
  minimumLoadTime?: number;
}

export function LoadingScreen({
  isDataReady,
  onLoadingComplete,
  minimumLoadTime = 1500,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'fast' | 'slow' | 'complete' | 'fadeout'>('fast');
  const [isVisible, setIsVisible] = useState(true);

  // Phase 1: Fast 0-80%
  useEffect(() => {
    if (phase !== 'fast') return;

    const startTime = Date.now();
    const duration = 800;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased * 80);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        setPhase('slow');
      }
    };

    requestAnimationFrame(animate);
  }, [phase]);

  // Phase 2: Slow 80-95%
  useEffect(() => {
    if (phase !== 'slow') return;

    let current = 80;
    const interval = setInterval(() => {
      if (current < 95) {
        current += 0.3;
        setProgress(current);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [phase]);

  // Phase 3: Complete when ready
  useEffect(() => {
    if (!isDataReady || phase === 'complete' || phase === 'fadeout') return;

    const timer = setTimeout(() => {
      setPhase('complete');
    }, Math.max(0, minimumLoadTime - 800));

    return () => clearTimeout(timer);
  }, [isDataReady, phase, minimumLoadTime]);

  // Animate to 100%
  useEffect(() => {
    if (phase !== 'complete') return;

    const startProgress = progress;
    const startTime = Date.now();
    const duration = 300;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - t) * (1 - t);
      setProgress(startProgress + (100 - startProgress) * eased);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        setProgress(100);
        setTimeout(() => setPhase('fadeout'), 150);
      }
    };

    requestAnimationFrame(animate);
  }, [phase, progress]);

  // Fadeout
  useEffect(() => {
    if (phase !== 'fadeout') return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onLoadingComplete();
    }, 400);

    return () => clearTimeout(timer);
  }, [phase, onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col items-center justify-center transition-opacity duration-400 ${
        phase === 'fadeout' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Percentage Number */}
      <div className="relative">
        <span
          className="text-[120px] md:text-[180px] font-extralight text-white/90 tabular-nums tracking-tighter leading-none"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          {Math.round(progress)}
        </span>
        <span className="absolute -right-8 md:-right-12 top-4 md:top-6 text-2xl md:text-3xl font-light text-white/40">
          %
        </span>
      </div>

      {/* Minimal Progress Line */}
      <div className="w-32 md:w-48 h-[1px] bg-white/10 mt-8 overflow-hidden">
        <div
          className="h-full bg-white/60 transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default LoadingScreen;

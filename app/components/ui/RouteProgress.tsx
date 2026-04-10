'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * RouteProgress — NProgress-style thin loading bar at page top.
 *
 * Shows a primary-colored progress bar during route transitions.
 * Auto-starts on pathname change, completes after transition.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevPathname = useRef(pathname);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (completeTimerRef.current) {
      clearTimeout(completeTimerRef.current);
      completeTimerRef.current = null;
    }
  }, []);

  const complete = useCallback(() => {
    cleanup();
    setProgress(100);
    completeTimerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
  }, [cleanup]);

  const start = useCallback(() => {
    cleanup();
    setProgress(15);
    setVisible(true);

    timerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        // Slow down as we approach 90%
        const increment = prev < 50 ? 8 : prev < 80 ? 3 : 0.5;
        return Math.min(prev + increment, 90);
      });
    }, 200);
  }, [cleanup]);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      // Route changed - show completion
      if (visible) {
        complete();
      }
      prevPathname.current = pathname;
    }
  }, [pathname, visible, complete]);

  // Listen for click on links to start progress
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;

      // Only trigger for internal navigation
      if (href !== pathname) {
        start();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname, start]);

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] pointer-events-none"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="頁面載入中"
    >
      <div
        className="h-full bg-primary transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
      {/* Glow effect at the leading edge */}
      <div
        className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-primary/40 to-transparent"
        style={{ transform: `translateX(${progress < 100 ? '0' : '100%'})` }}
      />
    </div>
  );
}

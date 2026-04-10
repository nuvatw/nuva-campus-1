'use client';

import { m, AnimatePresence } from 'motion/react';

interface PageTransitionProps {
  /** Unique key for the page (typically route pathname) */
  pageKey: string;
  children: React.ReactNode;
}

/**
 * Wraps page content with enter/exit transitions.
 * Use in layout.tsx files to animate route changes.
 *
 * Usage:
 *   <PageTransition pageKey={pathname}>
 *     {children}
 *   </PageTransition>
 */
export function PageTransition({ pageKey, children }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <m.div
        key={pageKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: 0.25,
          ease: [0.2, 0, 0, 1],
        }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'motion/react';
import { spring } from '@/app/styles/tokens';

interface CelebrationOverlayProps {
  show: boolean;
  message: string;
  onComplete?: () => void;
}

export function CelebrationOverlay({ show, message, onComplete }: CelebrationOverlayProps) {
  const prefersReduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Success check + message */}
          <m.div
            className="flex flex-col items-center gap-3"
            initial={prefersReduced ? { opacity: 0 } : { scale: 0.5, opacity: 0 }}
            animate={prefersReduced ? { opacity: 1 } : { scale: 1, opacity: 1 }}
            exit={prefersReduced ? { opacity: 0 } : { scale: 0.8, opacity: 0 }}
            transition={spring.playful}
          >
            {/* Circle with check */}
            <m.div
              className="w-20 h-20 rounded-full bg-success/90 flex items-center justify-center shadow-lg"
              initial={prefersReduced ? {} : { scale: 0 }}
              animate={prefersReduced ? {} : { scale: 1 }}
              transition={{ ...spring.playful, delay: 0.05 }}
            >
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <m.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
                />
              </svg>
            </m.div>

            {/* Message */}
            <m.p
              className="text-lg font-semibold text-text-primary bg-bg-card/90 px-4 py-2 rounded-xl shadow-elevation-2"
              initial={prefersReduced ? { opacity: 0 } : { y: 10, opacity: 0 }}
              animate={prefersReduced ? { opacity: 1 } : { y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {message}
            </m.p>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

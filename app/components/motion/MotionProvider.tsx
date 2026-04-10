'use client';

import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import { useReducedMotion } from './useReducedMotion';

interface MotionProviderProps {
  children: React.ReactNode;
}

/**
 * Wraps the app with motion configuration:
 * - LazyMotion: Only loads DOM animation features (~15KB vs 50KB full)
 * - MotionConfig: Sets global defaults and reduced-motion behavior
 */
export function MotionProvider({ children }: MotionProviderProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig
        reducedMotion={prefersReducedMotion ? 'always' : 'never'}
        transition={{
          duration: 0.3,
          ease: [0.2, 0, 0, 1],
        }}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

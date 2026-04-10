/**
 * Design Tokens — "Warm Precision" Design System
 *
 * Programmatic access to design tokens for use in JS/TS,
 * particularly for motion library animation configs.
 *
 * These values MUST stay in sync with tailwind.config.ts and globals.css.
 */

/* =============================================
   Colors
   ============================================= */
export const colors = {
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  accent: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  neutral: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
  },
  success: '#16A34A',
  warning: '#CA8A04',
  error: '#DC2626',
  info: '#2563EB',
} as const;

/* =============================================
   Animation Durations (ms)
   ============================================= */
export const duration = {
  instant: 0,
  micro: 100,
  fast: 200,
  normal: 300,
  moderate: 400,
  slow: 600,
} as const;

/* =============================================
   Easing Functions
   ============================================= */
export const easing = {
  default: [0.2, 0, 0, 1] as const,
  in: [0.4, 0, 1, 1] as const,
  out: [0, 0, 0.2, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
} as const;

/* =============================================
   Spring Presets (for motion library)
   ============================================= */
export const spring = {
  /** Tactile — for interactive elements (buttons, cards) */
  tactile: { type: 'spring' as const, stiffness: 400, damping: 25 },
  /** Playful — for celebrations, bouncy reveals */
  playful: { type: 'spring' as const, stiffness: 300, damping: 15 },
  /** Gentle — for smooth layout transitions */
  gentle: { type: 'spring' as const, stiffness: 200, damping: 30 },
  /** Snappy — for quick micro-interactions */
  snappy: { type: 'spring' as const, stiffness: 500, damping: 30 },
  /** Counter — for animated number interpolation */
  counter: { type: 'spring' as const, stiffness: 100, damping: 20 },
} as const;

/* =============================================
   Motion Variants (for motion library)
   ============================================= */
export const variants = {
  /** Fade in from below — standard page/section entrance */
  fadeInUp: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  },

  /** Fade in with scale — for modals, popups */
  fadeInScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },

  /** Slide in from right — for drawers, side panels */
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },

  /** Simple fade — for overlays, backdrops */
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  /** Stagger container — wrap children that should animate sequentially */
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  },

  /** Stagger child — each child in a stagger container */
  staggerChild: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  },
} as const;

/* =============================================
   Page Transition Presets
   ============================================= */
export const pageTransition = {
  /** Standard page enter transition */
  enter: {
    duration: duration.normal / 1000,
    ease: easing.out,
  },
  /** Standard page exit transition */
  exit: {
    duration: duration.fast / 1000,
    ease: easing.in,
  },
} as const;

/* =============================================
   Shadow Tokens (for JS usage)
   ============================================= */
export const shadows = {
  elevation1: '0 1px 3px rgba(28, 25, 23, 0.06)',
  elevation2: '0 4px 8px -2px rgba(28, 25, 23, 0.08)',
  elevation3: '0 8px 16px -4px rgba(28, 25, 23, 0.1)',
  elevation4: '0 16px 32px -8px rgba(28, 25, 23, 0.12)',
  elevation5: '0 24px 48px -12px rgba(28, 25, 23, 0.16)',
  primaryGlow: '0 8px 24px -4px rgba(59, 130, 246, 0.2)',
  successGlow: '0 8px 24px -4px rgba(22, 163, 74, 0.2)',
} as const;

/* =============================================
   Spacing (for JS usage, values in px)
   ============================================= */
export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
} as const;

/* =============================================
   Border Radius (for JS usage, values in px)
   ============================================= */
export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

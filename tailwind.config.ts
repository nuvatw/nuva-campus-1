import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* =============================================
         Color System — "Warm Precision"
         Teal primary + Amber secondary + Warm Stone neutrals
         ============================================= */
      colors: {
        // Primary — Blue (matches nuva logo)
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          DEFAULT: '#3B82F6',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          light: '#93C5FD',   // backward compat alias
          dark: '#1D4ED8',    // backward compat alias
        },
        // Secondary — Amber (energetic accent)
        accent: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          DEFAULT: '#F59E0B',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          light: '#FBBF24',   // backward compat alias
        },
        // Background — Warm neutrals
        bg: {
          primary: '#FAFAF9',
          secondary: '#F5F5F4',
          card: '#FFFFFF',
        },
        // Text — Warm stone tones
        text: {
          primary: '#1C1917',
          secondary: '#57534E',
          muted: '#A8A29E',
        },
        // Semantic status colors (warmer, more saturated)
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
        },
        warning: {
          DEFAULT: '#CA8A04',
          light: '#FEF3C7',
        },
        error: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
        },
        info: {
          DEFAULT: '#2563EB',
          light: '#EFF6FF',
        },
        // Borders — Warm stone
        border: {
          DEFAULT: '#E7E5E4',
          light: '#F5F5F4',
        },
        // Neutrals — Full warm stone scale for direct use
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
        // Backward compat
        locked: {
          DEFAULT: '#78716C',
          light: '#F5F5F4',
        },
      },

      /* =============================================
         Typography — Sora (display) + DM Sans (body) + Noto Sans TC/JP (CJK)
         ============================================= */
      fontFamily: {
        display: ['var(--font-sora)', 'var(--font-noto-sans-tc)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'var(--font-noto-sans-tc)', 'var(--font-noto-sans-jp)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // Display scale (Sora)
        'display-2xl': ['4.5rem', { lineHeight: '1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-xl': ['3.75rem', { lineHeight: '1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.1', fontWeight: '600', letterSpacing: '-0.01em' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '-0.01em' }],
        'display-sm': ['1.875rem', { lineHeight: '1.25', fontWeight: '600' }],
        // Heading scale
        'heading-xl': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-lg': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-md': ['1.125rem', { lineHeight: '1.4', fontWeight: '500' }],
        'heading-sm': ['1rem', { lineHeight: '1.5', fontWeight: '500' }],
        // Body scale
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        // Caption / Label / Overline
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
        'overline': ['0.75rem', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.05em' }],
        // Standard sizes (backward compat)
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['2rem', { lineHeight: '2.5rem' }],
        '4xl': ['2.5rem', { lineHeight: '3rem' }],
      },

      /* =============================================
         Spacing
         ============================================= */
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },

      /* =============================================
         Border Radius
         ============================================= */
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },

      /* =============================================
         Shadow Elevation System — Warm stone-based
         5 elevation levels + colored variants
         ============================================= */
      boxShadow: {
        // Elevation levels
        'elevation-0': 'none',
        'elevation-1': '0 1px 3px rgba(28, 25, 23, 0.06)',
        'elevation-2': '0 4px 8px -2px rgba(28, 25, 23, 0.08)',
        'elevation-3': '0 8px 16px -4px rgba(28, 25, 23, 0.1)',
        'elevation-4': '0 16px 32px -8px rgba(28, 25, 23, 0.12)',
        'elevation-5': '0 24px 48px -12px rgba(28, 25, 23, 0.16)',
        // Colored shadows
        'primary-glow': '0 8px 24px -4px rgba(59, 130, 246, 0.2)',
        'secondary-glow': '0 8px 24px -4px rgba(245, 158, 11, 0.2)',
        'success-glow': '0 8px 24px -4px rgba(22, 163, 74, 0.2)',
        'error-glow': '0 8px 24px -4px rgba(220, 38, 38, 0.2)',
        // Backward compat aliases
        'sm': '0 1px 3px rgba(28, 25, 23, 0.06)',
        'md': '0 4px 8px -2px rgba(28, 25, 23, 0.08)',
        'lg': '0 8px 16px -4px rgba(28, 25, 23, 0.1)',
        'xl': '0 16px 32px -8px rgba(28, 25, 23, 0.12)',
        'hover': '0 8px 24px -4px rgba(59, 130, 246, 0.2)',
      },

      /* =============================================
         Animation System
         ============================================= */
      animation: {
        // Existing (preserved)
        'fade-in-up': 'fadeInUp 0.4s var(--ease-out) forwards',
        'fade-in-scale': 'fadeInScale 0.25s var(--ease-out) forwards',
        'shake': 'shake 0.4s ease-in-out',
        'soft-bounce': 'softBounce 0.2s ease-out',
        'draw-check': 'drawCheck 0.5s ease-out forwards',
        // New systematic animations
        'enter': 'fadeInUp 0.3s var(--ease-out) forwards',
        'enter-scale': 'fadeInScale 0.25s var(--ease-out) forwards',
        'exit': 'fadeOut 0.15s var(--ease-in) forwards',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translate3d(0, 12px, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
        softBounce: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        drawCheck: {
          '100%': { strokeDashoffset: '0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      /* =============================================
         Transition timing
         ============================================= */
      transitionDuration: {
        'micro': '100ms',
        'fast': '200ms',
        'normal': '300ms',
        'moderate': '400ms',
        'slow': '600ms',
      },
      transitionTimingFunction: {
        'ease-default': 'cubic-bezier(0.2, 0, 0, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      /* =============================================
         Typography Plugin — Updated colors
         ============================================= */
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#1C1917',
            h1: { color: '#1C1917', fontWeight: '600' },
            h2: { color: '#1C1917', fontWeight: '600' },
            h3: { color: '#1C1917', fontWeight: '500' },
            strong: { color: '#1C1917', fontWeight: '600' },
            p: { color: '#1C1917' },
            li: { color: '#1C1917' },
            table: { borderCollapse: 'collapse', width: '100%' },
            th: {
              color: '#1C1917',
              fontWeight: '500',
              backgroundColor: '#F5F5F4',
              padding: '0.75rem 1rem',
              textAlign: 'center !important' as 'center',
              borderWidth: '1px',
              borderColor: '#E7E5E4',
            },
            td: {
              padding: '0.75rem 1rem',
              color: '#1C1917',
              textAlign: 'center !important' as 'center',
              borderWidth: '1px',
              borderColor: '#E7E5E4',
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;

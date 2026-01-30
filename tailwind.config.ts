import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 日系主色調 - 灰藍
        primary: {
          DEFAULT: '#4A5568',
          light: '#718096',
          dark: '#2D3748',
        },
        // 強調色 - 和風金
        accent: {
          DEFAULT: '#D69E2E',
          light: '#ECC94B',
        },
        // 背景色 - 和紙質感
        bg: {
          primary: '#FAFAF9',
          secondary: '#F7F5F3',
          card: '#FFFFFF',
        },
        // 文字色
        text: {
          primary: '#1A1A1A',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
        // 狀態色
        success: {
          DEFAULT: '#48BB78',
          light: '#C6F6D5',
        },
        warning: {
          DEFAULT: '#ED8936',
          light: '#FEEBC8',
        },
        error: {
          DEFAULT: '#E53E3E',
          light: '#FED7D7',
        },
        info: {
          DEFAULT: '#4299E1',
          light: '#BEE3F8',
        },
        // 邊框
        border: {
          DEFAULT: '#E5E7EB',
          light: '#F3F4F6',
        },
        // 保留舊的任務狀態色（相容性）
        locked: {
          DEFAULT: '#94a3b8',
          light: '#f1f5f9',
        },
      },
      fontFamily: {
        sans: [
          'Noto Sans JP',
          'Noto Sans TC',
          'Inter',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['2rem', { lineHeight: '2.5rem' }],
        '4xl': ['2.5rem', { lineHeight: '3rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.02)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.04), 0 4px 6px rgba(0, 0, 0, 0.02)',
        'xl': '0 20px 25px rgba(0, 0, 0, 0.04), 0 8px 10px rgba(0, 0, 0, 0.02)',
        'hover': '0 8px 16px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'fade-in-scale': 'fadeInScale 0.25s ease-out forwards',
        'shake': 'shake 0.4s ease-in-out',
        'soft-bounce': 'softBounce 0.2s ease-out',
        'draw-check': 'drawCheck 0.5s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
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
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#1A1A1A',
            h1: {
              color: '#1A1A1A',
              fontWeight: '600',
            },
            h2: {
              color: '#1A1A1A',
              fontWeight: '600',
            },
            h3: {
              color: '#1A1A1A',
              fontWeight: '500',
            },
            strong: {
              color: '#1A1A1A',
              fontWeight: '600',
            },
            p: {
              color: '#1A1A1A',
            },
            li: {
              color: '#1A1A1A',
            },
            table: {
              borderCollapse: 'collapse',
              width: '100%',
            },
            th: {
              color: '#1A1A1A',
              fontWeight: '500',
              backgroundColor: '#F7F5F3',
              padding: '0.75rem 1rem',
              textAlign: 'center !important',
              borderWidth: '1px',
              borderColor: '#E5E7EB',
            },
            td: {
              padding: '0.75rem 1rem',
              color: '#1A1A1A',
              textAlign: 'center !important',
              borderWidth: '1px',
              borderColor: '#E5E7EB',
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;

import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2977ba',
          light: '#e8f4fc',
          dark: '#1d5a8a',
        },
        accent: '#f59e0b',
        success: {
          DEFAULT: '#10b981',
          light: '#d1fae5',
        },
        locked: {
          DEFAULT: '#94a3b8',
          light: '#f1f5f9',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#1e293b', // slate-800
            h1: {
              color: '#0f172a', // slate-900
              fontWeight: '700',
            },
            h2: {
              color: '#0f172a',
              fontWeight: '600',
            },
            h3: {
              color: '#0f172a',
              fontWeight: '600',
            },
            strong: {
              color: '#0f172a',
              fontWeight: '600',
            },
            p: {
              color: '#1e293b',
            },
            li: {
              color: '#1e293b',
            },
            'thead th': {
              color: '#0f172a',
              fontWeight: '600',
              backgroundColor: '#f1f5f9', // slate-100
              padding: '0.75rem 1rem',
              textAlign: 'center',
            },
            'tbody td': {
              padding: '0.75rem 1rem',
              color: '#1e293b',
              textAlign: 'center',
            },
            table: {
              borderCollapse: 'collapse',
              width: '100%',
            },
            'thead th, tbody td': {
              borderWidth: '1px',
              borderColor: '#e2e8f0', // slate-200
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
import type { Config } from "tailwindcss";

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
    },
  },
  plugins: [],
};

export default config;
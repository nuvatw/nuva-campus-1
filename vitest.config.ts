import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'app/hooks/**/*.{ts,tsx}',
        'app/utils/**/*.{ts,tsx}',
        'app/transforms/**/*.{ts,tsx}',
        'app/lib/cache/**/*.{ts,tsx}',
      ],
      exclude: [
        'app/**/*.d.ts',
        'app/**/index.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@/app': path.resolve(__dirname, './app'),
    },
  },
});

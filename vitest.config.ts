import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'], // Generates coverage reports
      include: ['src/**'], // ✅ Only include the `src` directory
      exclude: [
        'src/config/**', // ❌ Ignore ESLint & config files
        'src/__tests__/**', // ❌ Ignore test files (tests don’t need coverage)
      ],
    },
    environment: 'node', // Simulates Node.js
    globals: true, // Allows global `expect`
    alias: {
      '@/': new URL('./src/', import.meta.url).pathname, // ✅ Fix path aliasing
    },
  },
});

import { defineConfig, coverageConfigDefaults } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // No UI, runs on Bun
    include: ['src/__tests__/**/*.test.ts'], // Explicit test directory
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{git,cache,temp}/**',
      '**/*.config.*',
    ],
    deps: {
      interopDefault: true, // Ensure CJS compatibility
      moduleDirectories: ['node_modules'],
    },
    coverage: {
      provider: 'v8', // Best for Bun runtime
      enabled: true,
      reportsDirectory: './coverage',
      clean: true,
      cleanOnRerun: true,
      include: ['src/weather-update/**/*.ts'],
      exclude: [...coverageConfigDefaults.exclude],
      reporter: ['text', 'html', 'json'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
    isolate: true, // Ensure test isolation
    setupFiles: ['./src/__tests__/setup.ts'], // Pre-test setup
    benchmark: {
      include: ['src/__tests__/**/*.bench.ts'],
      exclude: ['node_modules'],
    },
    logHeapUsage: true, // Debugging memory leaks
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});

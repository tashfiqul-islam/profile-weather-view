/**
 * Vitest Configuration
 *
 * Testing configuration optimized for reliability, performance,
 * and developer experience with Bun runtime.
 */

import { defineConfig, coverageConfigDefaults } from 'vitest/config';
import { resolve } from 'path';
import type { ViteUserConfig } from 'vitest/config';

// Performance settings
const WORKER_THREADS = 4;
const TIMEOUT = 10000;
const POOL_OPTIONS = {
  threads: {
    singleThread: false,
    isolate: true,
    maxThreads: WORKER_THREADS,
  },
  forks: {
    isolate: true,
    maxForks: WORKER_THREADS,
  },
};

// Coverage requirements
const COVERAGE_THRESHOLDS = {
  statements: 100,
  branches: 100,
  functions: 100,
  lines: 100,
  perFile: true,
};

// Test file patterns
const TEST_PATHS = {
  include: ['src/__tests__/**/*.test.ts'],
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**',
    '**/.{git,cache,temp}/**',
    '**/*.config.*',
    '**/fixtures/**',
  ],
  benchmarks: ['src/__tests__/**/*.bench.ts'],
  setupFiles: ['./src/__tests__/setup.ts'],
  coverage: ['src/weather-update/**/*.ts'],
};

// Import aliases
const PATH_ALIASES = {
  '@': resolve(process.cwd(), 'src'),
  '@/tests': resolve(process.cwd(), 'src/__tests__'),
  '@/weather-update': resolve(process.cwd(), 'src/weather-update'),
  '@/docs': resolve(process.cwd(), 'src/docs'),
};

export default defineConfig({
  /**
   * Test Runner Configuration
   */
  test: {
    // Environment settings
    globals: true,
    environment: 'node',
    environmentOptions: {
      loose: false,
    },

    // File selection
    include: TEST_PATHS.include,
    exclude: TEST_PATHS.exclude,

    // Test execution behavior
    isolate: true,
    watchExclude: [...TEST_PATHS.exclude, '**/logs/**'],
    forceRerunTriggers: ['**/vitest.config.*', '**/tsconfig.json'],
    fileParallelism: true,
    allowOnly: process.env['CI'] !== 'true',
    passWithNoTests: false,
    dangerouslyIgnoreUnhandledErrors: false,

    // Timing settings
    timeout: TIMEOUT,
    hookTimeout: TIMEOUT / 2,
    teardownTimeout: TIMEOUT / 2,
    maxConcurrency: 10,
    maxWorkers: WORKER_THREADS,
    minWorkers: 1,

    // Reporting settings
    logHeapUsage: true,
    slowTestThreshold: 1000,
    sequence: {
      shuffle: false,
    },
    typecheck: {
      enabled: true,
      checker: 'tsc',
    },

    // Module handling
    deps: {
      interopDefault: true,
      moduleDirectories: ['node_modules'],
      optimizer: {
        web: {
          exclude: ['fs', 'path', 'os'],
        },
      },
    },

    // Process management
    pool: 'threads',
    poolOptions: POOL_OPTIONS,

    // Code coverage
    coverage: {
      provider: 'v8',
      enabled: true,
      clean: true,
      cleanOnRerun: true,
      reportsDirectory: './coverage',
      include: TEST_PATHS.coverage,
      exclude: [
        ...coverageConfigDefaults.exclude,
        '**/*.test.ts',
        '**/*.d.ts',
        '**/*.config.ts',
      ],
      reporter: ['text', 'html', 'lcov'],
      all: true,
      skipFull: false,
      extension: ['.ts'],
      reportOnFailure: true,
      thresholds: COVERAGE_THRESHOLDS,
    },

    // Initialization
    setupFiles: TEST_PATHS.setupFiles,

    // Performance testing
    benchmark: {
      include: TEST_PATHS.benchmarks,
      exclude: TEST_PATHS.exclude,
      outputFile: './benchmark-results.json',
    },

    // Log handling
    onConsoleLog: (log, type) => {
      return !log.includes('Sensitive information');
    },

    // Output formats
    reporters: ['default', 'junit'],
    outputFile: {
      junit: './test-results/junit.xml',
    },
  },

  /**
   * Module Resolution
   */
  resolve: {
    alias: PATH_ALIASES,
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.mjs'],
    conditions: ['development', 'import', 'module', 'default'],
  },

  /**
   * Build configuration
   */
  build: {
    target: 'esnext',
    minify: false,
    sourcemap: true,
  },

  /**
   * Plugin system
   */
  plugins: [],

  /**
   * Dependency optimization
   */
  optimizeDeps: {
    entries: ['src/weather-update/index.ts'],
    exclude: ['vitest'],
  },

  /**
   * Worker configuration
   */
  worker: {
    format: 'es',
    plugins: () => [],
  },
} as ViteUserConfig);

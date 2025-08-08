/**
 * Vitest Configuration
 *
 * Testing configuration optimized for reliability, performance,
 * and developer experience with Bun runtime.
 */

import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // ================================
    // 🎯 Core Test Configuration
    // ================================

    // Environment - Node.js for our weather script
    environment: 'node',

    // Test file patterns
    include: [
      'src/**/*.{test,spec}.{js,ts}',
      '**/__tests__/**/*.{js,ts}',
      '**/*.{test,spec}.{js,ts}',
    ],

    // Exclude patterns
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/*.config.{js,ts}',
      '**/vitest.config.{js,ts}',
      '**/setup.ts',
    ],

    // ================================
    // 📊 Coverage Configuration
    // ================================

    coverage: {
      // Enable coverage collection
      enabled: true,

      // Use v8 provider for better performance
      provider: 'v8',

      // Include measured files (focus on units we can fully exercise)
      include: [
        'src/weather-update/services/updateReadme.ts',
        'src/weather-update/utils/preload.ts',
        'src/weather-update/services/fetchWeather.ts',
        'src/weather-update/index.ts',
      ],

      // Exclude test files and configs
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/*.config.{js,ts}',
        '**/vitest.config.{js,ts}',
        '**/*.d.ts',
        '**/__tests__/**',
        '**/*.{test,spec}.{js,ts}',
      ],

      // Clean coverage directory before each run
      clean: true,
      cleanOnRerun: true,

      // Coverage reports directory
      reportsDirectory: './coverage',

      // Coverage reporters
      reporter: [
        ['text', { maxCols: 200 }],
        'text-summary',
        'html',
        'lcov',
        'json',
        'json-summary',
      ],

      // Report coverage even on test failures
      reportOnFailure: true,

      // Allow external files (for dependencies)
      allowExternal: false,

      // Skip files with 100% coverage
      skipFull: false,

      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        perFile: false,
        autoUpdate: false,
      },
    },

    // ================================
    // ⚡ Performance & Execution
    // ================================

    // Run tests in parallel for better performance
    sequence: {
      concurrent: false,
      shuffle: false,
    },

    // Maximum concurrency
    maxConcurrency: 1,

    // Test timeout (30 seconds)
    testTimeout: 30_000,

    // Hook timeout (10 seconds)
    hookTimeout: 10_000,

    // Teardown timeout (10 seconds)
    teardownTimeout: 10_000,

    // Slow test threshold (5 seconds)
    slowTestThreshold: 5000,

    // ================================
    // 🔧 Test Execution Options
    // ================================

    // Run tests in isolated environment
    isolate: true,

    // Use threads pool for better performance
    pool: 'threads',

    // Thread pool options
    poolOptions: {
      threads: {
        // Use Atomics for better performance
        useAtomics: true,

        // Maximum number of threads
        maxThreads: 8,

        // Minimum number of threads
        minThreads: 2,
      },
    },

    // ================================
    // 🎨 Output & Reporting
    // ================================

    // Test reporters
    reporters: [
      ['default', { summary: true }],
      ['./src/reporters/BannersReporter.ts', {}],
      'html',
      'junit',
    ],

    // Output file for JUnit reports
    outputFile: {
      junit: './test-results/junit.xml',
    },

    // Show console output during tests
    silent: false,

    // ================================
    // 🔍 Debugging & Development
    // ================================

    // Do not force including all sources in coverage baseline
    // includeSource: ['src/**/*.{js,ts}'],

    // Show diff in test failures
    chaiConfig: {
      showDiff: true,
      truncateThreshold: 1000,
    },

    // ================================
    // 🛠️ Setup & Teardown
    // ================================

    // Global setup files
    setupFiles: ['./src/__tests__/setup.ts'],

    // ================================
    // 📁 Path Resolution
    // ================================

    // Root directory for tests
    root: resolve(__dirname),

    // Alias for better imports
    alias: {
      '@': resolve(__dirname, 'src'),
      '@weather': resolve(__dirname, 'src/weather-update'),
      '@services': resolve(__dirname, 'src/weather-update/services'),
      '@utils': resolve(__dirname, 'src/weather-update/utils'),
      '@tests': resolve(__dirname, 'src/__tests__'),
    },
  },

  // ================================
  // 🔧 Vite Configuration
  // ================================

  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@weather': resolve(__dirname, 'src/weather-update'),
      '@services': resolve(__dirname, 'src/weather-update/services'),
      '@utils': resolve(__dirname, 'src/weather-update/utils'),
      '@tests': resolve(__dirname, 'src/__tests__'),
    },
  },
});

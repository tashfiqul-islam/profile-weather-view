/**
 * Vitest Configuration
 *
 * Testing configuration optimized for reliability, performance,
 * and developer experience with Bun runtime.
 */

import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // ================================
    // 🎯 Core Test Configuration
    // ================================

    // Environment - Node.js for our weather script
    environment: "node",

    // Test file patterns (restrict to project sources only)
    include: ["src/**/*.{test,spec}.{js,ts}"],

    // Exclude patterns
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/*.config.{js,ts}",
      "**/vitest.config.{js,ts}",
      "**/setup.ts",
      "**/~/**",
      "**/.bun/**",
      "**/.cache/**",
    ],

    // ================================
    // ⚡ Performance & Execution
    // ================================

    // Use forks for Vitest v2
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    fileParallelism: false,

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

    // ================================
    // 🎨 Output & Reporting
    // ================================

    // Test reporters (keep default only to avoid dispose error)
    reporters: [["default", { summary: true }]],

    // Show console output during tests
    silent: false,

    // ================================
    // 🔍 Debugging & Development
    // ================================

    // Show diff in test failures
    chaiConfig: {
      showDiff: true,
      truncateThreshold: 1000,
    },

    // ================================
    // 🛠️ Setup & Teardown
    // ================================

    // Global setup files (temporarily disabled to isolate error)
    setupFiles: [],

    // ================================
    // 📁 Path Resolution
    // ================================

    // Root directory for tests
    root: resolve(__dirname),

    // Alias for better imports
    alias: {
      "@": resolve(__dirname, "src"),
      "@weather": resolve(__dirname, "src/weather-update"),
      "@services": resolve(__dirname, "src/weather-update/services"),
      "@utils": resolve(__dirname, "src/weather-update/utils"),
      "@tests": resolve(__dirname, "src/__tests__"),
    },
  },

  // ================================
  // 🔧 Vite Configuration
  // ================================

  // Resolve configuration
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@weather": resolve(__dirname, "src/weather-update"),
      "@services": resolve(__dirname, "src/weather-update/services"),
      "@utils": resolve(__dirname, "src/weather-update/utils"),
      "@tests": resolve(__dirname, "src/__tests__"),
    },
  },
});

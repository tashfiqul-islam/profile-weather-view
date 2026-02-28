/**
 * Global test setup for Bun: configures env, wires helpers, and sets hooks.
 * Comments focus on intent and non-obvious behavior.
 */

import { afterAll, afterEach, beforeAll, beforeEach } from "bun:test";
import os from "node:os";
import path from "node:path";
import { $ } from "bun";

// Environment configuration used by tests

process.env["NODE_ENV"] = "test";
process.env["CI"] = "true";
process.env["FORCE_UPDATE"] = "true";
process.env["GITHUB_ACTIONS"] = "false";

// Test utilities available to all suites

/**
 * Test utilities for weather update project
 */
export const testUtils = {
  /** Creates a basic weather payload for tests. */
  createMockWeatherData: () => {
    const MOCK_TEMPERATURE = 25;
    const MOCK_HUMIDITY = 60;
    const MOCK_SUNRISE = "06:00";
    const MOCK_SUNSET = "18:00";
    const MOCK_ICON = "clear-day"; // Meteocons icon name
    const MOCK_DESCRIPTION = "Clear Sky";

    return {
      description: MOCK_DESCRIPTION,
      temperatureC: MOCK_TEMPERATURE,
      sunriseLocal: MOCK_SUNRISE,
      sunsetLocal: MOCK_SUNSET,
      humidityPct: MOCK_HUMIDITY,
      icon: MOCK_ICON,
    };
  },

  /** Produces a minimal Open-Meteo API response for tests. */
  createMockApiResponse: () => {
    const MOCK_TEMP = 25.5;
    const MOCK_HUMIDITY = 60;
    const MOCK_WEATHER_CODE = 0; // WMO: clear sky
    const MOCK_IS_DAY = 1;
    const MOCK_UTC_OFFSET = 21_600; // UTC+6 in seconds
    const SECONDS_IN_HOUR = 3600;
    const MILLISECONDS_TO_SECONDS = 1000;
    const currentTime = Math.floor(Date.now() / MILLISECONDS_TO_SECONDS);

    return {
      current: {
        temperature_2m: MOCK_TEMP,
        relative_humidity_2m: MOCK_HUMIDITY,
        weather_code: MOCK_WEATHER_CODE,
        is_day: MOCK_IS_DAY,
      },
      daily: {
        sunrise: [currentTime - SECONDS_IN_HOUR],
        sunset: [currentTime + SECONDS_IN_HOUR],
      },
      utc_offset_seconds: MOCK_UTC_OFFSET,
    };
  },

  /** Returns a README snippet with a weather section. */
  createMockReadmeContent: () => `
# Profile README

## Weather Information
<!-- Hourly Weather Update -->
![Weather](https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/fill/svg/clear-day.svg)
**Clear Sky** | 25°C | Humidity: 60%
Sunrise: 06:00 | Sunset: 18:00
<em>Last refresh: Monday, January 01, 2024 at 12:00:00 (UTC+6)</em>
<!-- End of Hourly Weather Update -->

## Other Content
This is other content that should not be modified.
`,

  /** Minimal performance helpers for timing in tests. */
  performance: {
    startTimer: (label: string) => {
      performance.mark(`${label}-start`);
    },
    endTimer: (label: string) => {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      const measure = performance.getEntriesByName(label)[0];
      return measure?.duration ?? 0;
    },
  },

  /** Hook to reset any global mocks or state (placeholder). */
  resetMocks: () => {
    // Clear any global mocks or test state
    // This is a placeholder for future mock reset functionality
  },

  /** Convenience helpers for creating and cleaning temp files. */
  fs: {
    createTempFile: async (content: string, filename = "temp.md") => {
      const TEMP_ROOT = path.join(os.tmpdir(), "profile-weather-view-tests");
      await $`mkdir -p ${TEMP_ROOT}`.quiet();
      const tempPath = path.join(TEMP_ROOT, filename);
      await Bun.write(tempPath, content);
      return tempPath;
    },
    cleanupTempFiles: async () => {
      // Remove all temporary files created during tests
      try {
        const TEMP_ROOT = path.join(os.tmpdir(), "profile-weather-view-tests");
        await $`rm -rf ${TEMP_ROOT}`.quiet();
      } catch {
        // Ignore cleanup errors
      }
    },
    /** Creates a temp file with automatic cleanup via Symbol.dispose.
     *  Use with the `using` keyword: `await using f = await createDisposableTempFile(...)` */
    createDisposableTempFile: async (content: string, filename = "temp.md") => {
      const TEMP_ROOT = path.join(os.tmpdir(), "profile-weather-view-tests");
      await $`mkdir -p ${TEMP_ROOT}`.quiet();
      const tempPath = path.join(TEMP_ROOT, filename);
      await Bun.write(tempPath, content);
      return {
        path: tempPath,
        [Symbol.asyncDispose]: async () => {
          try {
            await $`rm -f ${tempPath}`.quiet();
          } catch {
            // Ignore cleanup errors
          }
        },
      };
    },
  },
};

// Global test hooks

/** Runs once before all tests. */
beforeAll(() => {
  // Placeholder for any global setup validation if needed
});

/** Runs once after all tests. */
afterAll(() => {
  // Placeholder for any global teardown if needed
});

/** Runs before each test. */
beforeEach(() => {
  // Placeholder for per-test setup
});

/** Runs after each test. */
afterEach(() => {
  // Placeholder for per-test cleanup
});

// Exported test configuration for shared thresholds and data

export const testConfig = {
  // Test timeouts
  timeout: 15_000, // 15 seconds for API calls

  // Mock data
  mockWeatherData: testUtils.createMockWeatherData(),
  mockApiResponse: testUtils.createMockApiResponse(),
  mockReadmeContent: testUtils.createMockReadmeContent(),

  isTest: true,
  isCI: process.env["CI"] === "true",

  // Performance thresholds
  performanceThresholds: {
    apiCall: 2000, // 2 seconds max for API calls
    fileOperation: 100, // 100ms max for file operations
    totalTest: 5000, // 5 seconds max for total test execution
  },
};

// Bun Test Setup Complete - Ready for testing!

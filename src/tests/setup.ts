/**
 * Global test setup for Bun: configures env, wires helpers, and sets hooks.
 * Comments focus on intent and non-obvious behavior.
 */

import { afterAll, afterEach, beforeAll, beforeEach } from "bun:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

// Environment configuration used by tests

// Set test environment variables
process.env["NODE_ENV"] = "test";
process.env["CI"] = "true";

// Mock API key for testing (validates format but doesn't make real calls)
process.env["OPEN_WEATHER_KEY"] = "mock-api-key-for-testing-1234567890abcdef";

// Disable rate limiting in tests
process.env["FORCE_UPDATE"] = "true";

// Disable GitHub Actions mode for testing
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
    const MOCK_ICON = "01d";
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

  /** Produces a minimal OpenWeather-like response. */
  createMockApiResponse: () => {
    const MOCK_LAT = 23.8759;
    const MOCK_LON = 90.3795;
    const MOCK_TIMEZONE = "Asia/Dhaka";
    const MOCK_TIMEZONE_OFFSET = 21_600;
    const MOCK_TEMP = 25.5;
    const MOCK_FEELS_LIKE = 27.2;
    const MOCK_PRESSURE = 1013;
    const MOCK_HUMIDITY = 60;
    const MOCK_DEW_POINT = 18.5;
    const MOCK_UVI = 6.5;
    const MOCK_CLOUDS = 10;
    const MOCK_VISIBILITY = 10_000;
    const MOCK_WIND_SPEED = 3.5;
    const MOCK_WIND_DEG = 180;
    const MOCK_WEATHER_ID = 800;
    const MOCK_WEATHER_MAIN = "Clear";
    const MOCK_WEATHER_DESC = "clear sky";
    const MOCK_WEATHER_ICON = "01d";
    const SECONDS_IN_HOUR = 3600;

    const MILLISECONDS_TO_SECONDS = 1000;
    const currentTime = Math.floor(Date.now() / MILLISECONDS_TO_SECONDS);

    return {
      lat: MOCK_LAT,
      lon: MOCK_LON,
      timezone: MOCK_TIMEZONE,
      timezone_offset: MOCK_TIMEZONE_OFFSET,
      current: {
        dt: currentTime,
        sunrise: currentTime - SECONDS_IN_HOUR,
        sunset: currentTime + SECONDS_IN_HOUR,
        temp: MOCK_TEMP,
        feels_like: MOCK_FEELS_LIKE,
        pressure: MOCK_PRESSURE,
        humidity: MOCK_HUMIDITY,
        dew_point: MOCK_DEW_POINT,
        uvi: MOCK_UVI,
        clouds: MOCK_CLOUDS,
        visibility: MOCK_VISIBILITY,
        wind_speed: MOCK_WIND_SPEED,
        wind_deg: MOCK_WIND_DEG,
        weather: [
          {
            id: MOCK_WEATHER_ID,
            main: MOCK_WEATHER_MAIN,
            description: MOCK_WEATHER_DESC,
            icon: MOCK_WEATHER_ICON,
          },
        ],
      },
    };
  },

  /** Returns a README snippet with a weather section. */
  createMockReadmeContent: () => `
# Profile README

## Weather Information
<!-- Hourly Weather Update -->
![Weather](https://openweathermap.org/img/w/01d.png)
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
      await fs.mkdir(TEMP_ROOT, { recursive: true });
      const tempPath = path.join(TEMP_ROOT, filename);
      await Bun.write(tempPath, content);
      return tempPath;
    },
    cleanupTempFiles: async () => {
      // Remove all temporary files created during tests
      try {
        const TEMP_ROOT = path.join(os.tmpdir(), "profile-weather-view-tests");
        await fs.rm(TEMP_ROOT, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
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

  // Test environment
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

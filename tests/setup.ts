/**
 * Global Test Setup for Bun Test Runner
 * This file is automatically loaded before all tests via bunfig.toml
 *
 * Features:
 * - Global test environment configuration
 * - Mock setup for Bun-specific APIs
 * - Test utilities and helpers
 * - Performance monitoring
 *
 * @fileoverview Modern TypeScript 5.9.3 test setup with strict typing
 * @version 2.2.2
 * @author Tashfiqul Islam
 */

import { afterAll, afterEach, beforeAll, beforeEach } from "bun:test";

// ================================
// 🌍 Environment Configuration
// ================================

// Set test environment variables
process.env["NODE_ENV"] = "test";
process.env["CI"] = "true";

// Mock API key for testing (validates format but doesn't make real calls)
process.env["OPEN_WEATHER_KEY"] = "mock-api-key-for-testing-1234567890abcdef";

// Disable rate limiting in tests
process.env["FORCE_UPDATE"] = "true";

// Disable GitHub Actions mode for testing
process.env["GITHUB_ACTIONS"] = "false";

// ================================
// 🧪 Test Utilities
// ================================

/**
 * Test utilities for weather update project
 */
export const testUtils = {
  /**
   * Create mock weather data for testing
   */
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

  /**
   * Create mock API response for OpenWeather API
   */
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

  /**
   * Create mock README content for testing
   */
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

  /**
   * Performance monitoring utilities
   */
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

  /**
   * Reset all mocks and test state
   */
  resetMocks: () => {
    // Clear any global mocks or test state
    // This is a placeholder for future mock reset functionality
  },

  /**
   * File system utilities for testing
   */
  fs: {
    createTempFile: async (content: string, filename = "temp.md") => {
      const tempPath = `./tests/fixtures/${filename}`;
      await Bun.write(tempPath, content);
      return tempPath;
    },
    cleanupTempFiles: async () => {
      // Clean up any temporary test files
      try {
        const files = await Bun.file("./tests/fixtures").exists();
        if (files) {
          // In a real implementation, you'd clean up temp files here
          // Test cleanup completed
        }
      } catch {
        // Ignore cleanup errors
      }
    },
  },
};

// ================================
// 🔧 Global Test Hooks
// ================================

/**
 * Global setup - runs once before all tests
 */
beforeAll(() => {
  // Bun Test Runner - Global Setup
  // Test root: process.cwd()
  // Environment: process.env.NODE_ENV
  // API Key configured: Boolean(process.env.OPEN_WEATHER_KEY)
});

/**
 * Global teardown - runs once after all tests
 */
afterAll(() => {
  // Bun Test Runner - Global Teardown
  // Test execution completed
});

/**
 * Per-test setup - runs before each test
 */
beforeEach(() => {
  // Reset any global state if needed
  // Clear any mocks or timers
});

/**
 * Per-test teardown - runs after each test
 */
afterEach(() => {
  // Clean up after each test
  // Reset any modified global state
});

// ================================
// 🎯 Export Test Configuration
// ================================

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

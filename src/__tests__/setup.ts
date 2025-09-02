/**
 * 🧪 Global Test Setup
 *
 * This file configures the testing environment for all tests.
 * It sets up mocks, utilities, and global configurations.
 */

import { afterEach, beforeEach, vi } from "vitest";

// ================================
// 📊 Test Constants
// ================================

const API_KEY_MIN_LENGTH = 32;
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_REDIRECT_THRESHOLD = 300;
const HTTP_STATUS_SERVER_ERROR = 500;
const MILLISECONDS_PER_SECOND = 1000;

// ================================
// 🌍 Environment Setup
// ================================

// Set test environment variables
process.env.NODE_ENV = "test";
// Use a valid 32+ length alphanumeric key per schema
process.env["OPEN_WEATHER_KEY"] = "A".repeat(API_KEY_MIN_LENGTH);
process.env["FORCE_UPDATE"] = "false";
process.env["GITHUB_ACTIONS"] = "false";
process.env["PROFILE_README_PATH"] = "./test-README.md";

// ================================
// 🔧 Global Test Configuration
// ================================

// Increase timeout for API tests
vi.setConfig({
  testTimeout: 30_000,
  hookTimeout: 10_000,
});

// ================================
// 🎭 Mock Setup
// ================================

// Simple in-memory Bun.file/Bun.write mock
type MockFile = { content: string };
const mockFs = new Map<string, MockFile>();

// Provide a default README with the weather section placeholder
const defaultReadmePath =
  process.env["PROFILE_README_PATH"] ?? "./test-README.md";
const defaultReadmeContent =
  "# Test README\n\n<!-- Hourly Weather Update -->\nPending...\n<!-- End of Hourly Weather Update -->\n\n<em>Last refresh: old</em>\n";
mockFs.set(defaultReadmePath, { content: defaultReadmeContent });

export function setMockFile(path: string, content: string): void {
  mockFs.set(path, { content });
}

export function removeMockFile(path: string): void {
  mockFs.delete(path);
}

vi.stubGlobal("Bun", {
  env: process.env,
  file: (path: string) => ({
    exists: async () => mockFs.has(path),
    text: async () => mockFs.get(path)?.content ?? "",
    get size() {
      const content = mockFs.get(path)?.content ?? "";
      return content.length;
    },
  }),
  write: vi.fn(
    async (path: string | number, data: string | Blob | ArrayBufferView) => {
      if (typeof path !== "string") {
        return;
      }
      let text: string;
      if (typeof data === "string") {
        text = data;
      } else if (typeof Blob !== "undefined" && data instanceof Blob) {
        text = await data.text();
      } else {
        text = new TextDecoder().decode(data as ArrayBufferView);
      }
      mockFs.set(path, { content: text });
    }
  ),
} as unknown as typeof Bun);

// Mock process.stdout and process.stderr
const originalStdout = process.stdout.write;
const originalStderr = process.stderr.write;

// ================================
// 🧹 Test Lifecycle Hooks
// ================================
// Banners are handled by a custom Reporter to avoid duplicates

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks();

  // Mock stdout/stderr to capture output
  process.stdout.write = vi.fn();
  process.stderr.write = vi.fn();
});

afterEach(() => {
  // Restore stdout/stderr after each test
  process.stdout.write = originalStdout;
  process.stderr.write = originalStderr;
});

// Final banner handled via process.once('beforeExit') above

// ================================
// 🛠️ Test Utilities
// ================================

/**
 * Utility to capture stdout/stderr output
 */
export const captureOutput = () => {
  const stdout = vi.fn();
  const stderr = vi.fn();

  process.stdout.write = stdout;
  process.stderr.write = stderr;

  return {
    stdout,
    stderr,
    getOutput: () => ({
      stdout: stdout.mock.calls.map((call) => call[0]).join(""),
      stderr: stderr.mock.calls.map((call) => call[0]).join(""),
    }),
  };
};

/**
 * Utility to create mock weather data
 */
export const createMockWeatherData = (
  overrides: Record<string, unknown> = {}
) => ({
  coord: { lon: -122.4194, lat: 37.7749 },
  weather: [
    {
      id: 800,
      main: "Clear",
      description: "clear sky",
      icon: "01d",
    },
  ],
  base: "stations",
  main: {
    temp: 20.5,
    feels_like: 19.8,
    temp_min: 18.2,
    temp_max: 23.1,
    pressure: 1013,
    humidity: 65,
  },
  visibility: 10_000,
  wind: {
    speed: 3.6,
    deg: 280,
  },
  clouds: {
    all: 20,
  },
  dt: Math.floor(Date.now() / MILLISECONDS_PER_SECOND),
  sys: {
    type: 2,
    id: 2_000_314,
    country: "US",
    sunrise: 1_643_727_600,
    sunset: 1_643_764_800,
  },
  timezone: -28_800,
  id: 5_391_959,
  name: "San Francisco",
  cod: 200,
  ...overrides,
});

/**
 * Utility to create mock API response
 */
export const createMockApiResponse = (
  data: unknown,
  status = HTTP_STATUS_OK
) => ({
  ok: status >= HTTP_STATUS_OK && status < HTTP_STATUS_REDIRECT_THRESHOLD,
  status,
  statusText: status === HTTP_STATUS_OK ? "OK" : "Error",
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
  headers: new Map(),
});

/**
 * Utility to wait for async operations
 */
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Utility to create test environment variables
 */
export const createTestEnv = (overrides = {}) => ({
  OPEN_WEATHER_KEY: "test-api-key-12345",
  FORCE_UPDATE: "false",
  GITHUB_ACTIONS: "false",
  PROFILE_README_PATH: "./test-README.md",
  ...overrides,
});

// ================================
// 📝 Test Data Constants
// ================================

export const TEST_DATA = {
  // Weather data
  WEATHER_RESPONSE: createMockWeatherData(),

  // API responses
  API_SUCCESS: createMockApiResponse(createMockWeatherData()),
  API_ERROR: createMockApiResponse(
    { error: "API Error" },
    HTTP_STATUS_SERVER_ERROR
  ),

  // File content
  README_CONTENT: `# Test Profile

## 🌦️ Current Weather

**Location:** San Francisco, US
**Temperature:** 20.5°C
**Condition:** Clear Sky
**Humidity:** 65%
**Wind:** 3.6 m/s

*Last updated: ${new Date().toISOString()}*
`,

  // Coordinates
  COORDINATES: {
    lat: 37.7749,
    lon: -122.4194,
  },

  // API configuration
  API_CONFIG: {
    baseUrl: "https://api.openweathermap.org/data/3.0/onecall",
    timeout: 8000,
    retries: 2,
    retryDelay: 500,
    exclude: "minutely,hourly,daily,alerts",
  },
};

// ================================
// 🎯 Global Test Types
// ================================

export type MockWeatherData = ReturnType<typeof createMockWeatherData>;
export type MockApiResponse = ReturnType<typeof createMockApiResponse>;
export type TestEnv = ReturnType<typeof createTestEnv>;

// ================================
// 🔍 Test Assertions
// ================================

/**
 * Custom assertion for weather data structure
 * Note: Use this inside test functions with expect imported from vitest
 */
export const validateWeatherData = (data: unknown) => {
  if (typeof data === "object" && data !== null) {
    const weatherData = data as Record<string, unknown>;
    return (
      "coord" in weatherData &&
      "weather" in weatherData &&
      "main" in weatherData &&
      "name" in weatherData &&
      "cod" in weatherData &&
      weatherData["cod"] === HTTP_STATUS_OK
    );
  }
  return false;
};

/**
 * Custom assertion for API error responses
 * Note: Use this inside test functions with expect imported from vitest
 */
export const validateApiError = (error: unknown) => {
  return error instanceof Error && error.message.includes("API");
};

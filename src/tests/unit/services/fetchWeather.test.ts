/**
 * Tests for fetchWeather.ts: happy path, validation, retries, and edge cases.
 * Focus on observable behavior and error surfaces.
 */

import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
  fetchWeatherData,
  type HumidityPercentage,
  type TemperatureCelsius,
  type TimeString,
} from "@/weather-update/services/fetchWeather";

// Test constants & types

// Time constants used for deterministic timestamps
const BASE_TIMESTAMP = 1_700_000_000;
const SIX_HOURS_SECONDS = 21_600;
const EIGHTEEN_HOURS_SECONDS = 64_800;

// Common values and status codes used across tests
const TEST_CONSTANTS = {
  API_KEY: "test-api-key-12345",
  LAT: "23.8759",
  LON: "90.3795",
  TIMEOUT: 8000,
  RETRIES: 2,
  RETRY_DELAY: 500,
  MOCK_TIMESTAMP: BASE_TIMESTAMP, // Unix timestamp
  MOCK_SUNRISE: BASE_TIMESTAMP + SIX_HOURS_SECONDS, // +6 hours
  MOCK_SUNSET: BASE_TIMESTAMP + EIGHTEEN_HOURS_SECONDS, // +18 hours
  TEMPERATURE: 25.7,
  HUMIDITY: 65,
  PRESSURE: 1013,
  CLOUDS: 20,
  VISIBILITY: 10_000,
  WIND_SPEED: 3.5,
  WIND_DEG: 180,
  UVI: 5.2,
  DEW_POINT: 18.5,
  FEELS_LIKE: 27.2,
  // Status codes
  SUCCESS_STATUS: 200,
  CLIENT_ERROR_STATUS: 400,
  UNAUTHORIZED_STATUS: 401,
  SERVER_ERROR_STATUS: 500,
  // Time constants
  SIX_HOURS_SECONDS: 21_600,
  EIGHTEEN_HOURS_SECONDS: 64_800,
  // Performance constants
  MOCK_START_TIME: 0,
  MOCK_END_TIME: 100,
  MOCK_END_TIME_LONG: 150.75,
  // Retry constants
  MAX_RETRIES: 3,
  RETRY_ATTEMPT_1: 1,
  RETRY_ATTEMPT_2: 2,
  // Temperature constants
  ROUNDED_TEMPERATURE: 26,
  // Weather condition IDs
  CLEAR_SKY_ID: 800,
  LIGHT_RAIN_ID: 500,
  // Default icon
  DEFAULT_ICON: "01d",
} as const;

// For validating HH:mm formatting
const REGEX_PATTERNS = {
  TIME_PATTERN: /^\d{2}:\d{2}$/,
} as const;

// A minimal, valid API response fixture
const MOCK_WEATHER_DATA = {
  lat: 23.8759,
  lon: 90.3795,
  timezone: "Asia/Dhaka",
  timezone_offset: TEST_CONSTANTS.SIX_HOURS_SECONDS, // +6 hours
  current: {
    dt: TEST_CONSTANTS.MOCK_TIMESTAMP,
    sunrise: TEST_CONSTANTS.MOCK_SUNRISE,
    sunset: TEST_CONSTANTS.MOCK_SUNSET,
    temp: TEST_CONSTANTS.TEMPERATURE,
    feels_like: TEST_CONSTANTS.FEELS_LIKE,
    pressure: TEST_CONSTANTS.PRESSURE,
    humidity: TEST_CONSTANTS.HUMIDITY,
    dew_point: TEST_CONSTANTS.DEW_POINT,
    uvi: TEST_CONSTANTS.UVI,
    clouds: TEST_CONSTANTS.CLOUDS,
    visibility: TEST_CONSTANTS.VISIBILITY,
    wind_speed: TEST_CONSTANTS.WIND_SPEED,
    wind_deg: TEST_CONSTANTS.WIND_DEG,
    weather: [
      {
        id: TEST_CONSTANTS.CLEAR_SKY_ID,
        main: "Clear",
        description: "clear sky",
        icon: TEST_CONSTANTS.DEFAULT_ICON,
      },
    ],
  },
} as const;

// Test setup & utilities

/** Mock fetch implementation. */
let mockFetch: ReturnType<typeof mock>;

/** Mock performance.now(). */
let mockPerformanceNow: ReturnType<typeof mock>;

/** Originals restored after each test. */
let originalFetch: typeof globalThis.fetch;
let originalPerformanceNow: typeof performance.now;
let originalEnv: Record<string, string | undefined>;

/** Setup test environment before each test. */
beforeEach(() => {
  // Mock fetch
  mockFetch = mock(() => Promise.resolve(new Response()));
  originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch as unknown as typeof globalThis.fetch;

  // Mock performance.now()
  mockPerformanceNow = mock(() => 0);
  originalPerformanceNow = performance.now;
  performance.now = mockPerformanceNow as unknown as typeof performance.now;

  // Mock environment variables
  originalEnv = { ...process.env };
  process.env["OPEN_WEATHER_KEY"] = TEST_CONSTANTS.API_KEY;

  // Reset mocks
  mockFetch.mockClear();
  mockPerformanceNow.mockClear();
});

/** Cleanup after each test. */
afterEach(() => {
  // Restore original implementations
  globalThis.fetch = originalFetch;
  performance.now = originalPerformanceNow;

  // Restore environment
  process.env = { ...originalEnv } as Record<string, string | undefined>;
});

// Helper functions

/** Creates a mock Response with JSON data. */
function createMockResponse(
  data: unknown,
  status = TEST_CONSTANTS.SUCCESS_STATUS
): Response {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === TEST_CONSTANTS.SUCCESS_STATUS ? "OK" : "Error",
    headers: { "Content-Type": "application/json" },
  });
}

/** Creates a mock Response with error text/plain. */
function createMockErrorResponse(
  status: number,
  statusText: string,
  body: string
): Response {
  return new Response(body, {
    status,
    statusText,
    headers: { "Content-Type": "text/plain" },
  });
}

/** Stubs performance timing. */
function simulatePerformanceTiming(startTime: number, endTime: number): void {
  mockPerformanceNow
    .mockReturnValueOnce(startTime)
    .mockReturnValueOnce(endTime);
}

// ================================
// 🧪 Test Suites
// ================================

describe("fetchWeatherData", () => {
  test("should fetch weather data successfully", async () => {
    // Setup
    mockFetch.mockResolvedValueOnce(createMockResponse(MOCK_WEATHER_DATA));
    simulatePerformanceTiming(
      TEST_CONSTANTS.MOCK_START_TIME,
      TEST_CONSTANTS.MOCK_END_TIME
    );

    // Execute
    const result = await fetchWeatherData();

    // Verify
    expect(result).toEqual({
      description: "Clear Sky",
      temperatureC: TEST_CONSTANTS.ROUNDED_TEMPERATURE as TemperatureCelsius,
      sunriseLocal: expect.stringMatching(
        REGEX_PATTERNS.TIME_PATTERN
      ) as TimeString,
      sunsetLocal: expect.stringMatching(
        REGEX_PATTERNS.TIME_PATTERN
      ) as TimeString,
      humidityPct: TEST_CONSTANTS.HUMIDITY as HumidityPercentage,
      icon: TEST_CONSTANTS.DEFAULT_ICON,
    });

    // Verify fetch was called with correct parameters
    expect(mockFetch).toHaveBeenCalledTimes(TEST_CONSTANTS.RETRY_ATTEMPT_1);
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("api.openweathermap.org");
    expect(url).toContain(`lat=${TEST_CONSTANTS.LAT}`);
    expect(url).toContain(`lon=${TEST_CONSTANTS.LON}`);
    // Before each test, OPEN_WEATHER_KEY is overridden with TEST_CONSTANTS.API_KEY
    expect(url).toContain(`appid=${TEST_CONSTANTS.API_KEY}`);
    expect(url).toContain("units=metric");
    expect(url).toContain("exclude=minutely%2Chourly%2Cdaily%2Calerts");
    expect(options?.method).toBe("GET");
    expect(options?.headers).toEqual({
      Accept: "application/json",
      "User-Agent": "Weather-Update-App/1.0",
    });
  });

  test("should handle missing API key", async () => {
    // Setup
    const originalApiKey = process.env["OPEN_WEATHER_KEY"];
    process.env["OPEN_WEATHER_KEY"] = undefined as unknown as string;
    // Reset fetch mock to avoid interference
    mockFetch.mockClear();

    try {
      // Execute & Verify
      await expect(fetchWeatherData()).rejects.toThrow(
        "OpenWeather API key is required"
      );
    } finally {
      // Restore environment
      if (originalApiKey !== undefined) {
        process.env["OPEN_WEATHER_KEY"] = originalApiKey;
      }
    }
  });

  test("should handle API error response", async () => {
    // Setup
    mockFetch.mockResolvedValueOnce(
      createMockErrorResponse(
        TEST_CONSTANTS.UNAUTHORIZED_STATUS,
        "Unauthorized",
        "Invalid API key"
      )
    );

    // Execute & Verify
    await expect(fetchWeatherData()).rejects.toThrow(
      "OpenWeather API request failed: 401 Unauthorized - Invalid API key"
    );
  });

  test("should handle network timeout", async () => {
    // Setup
    mockFetch.mockClear();
    // Mock all retry attempts to fail with the same error
    mockFetch.mockImplementation(() =>
      Promise.reject(new Error("Request timeout"))
    );

    // Execute & Verify
    await expect(fetchWeatherData()).rejects.toThrow("Request timeout");
  });

  test("should handle invalid JSON response", async () => {
    // Setup
    mockFetch.mockResolvedValueOnce(
      new Response("invalid json", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    // Execute & Verify
    await expect(fetchWeatherData()).rejects.toThrow("Failed to parse JSON");
  });

  test("should handle malformed weather data", async () => {
    // Setup
    const malformedData = {
      lat: "invalid",
      lon: 90.3795,
      timezone: "Asia/Dhaka",
      timezone_offset: SIX_HOURS_SECONDS,
      current: {
        dt: "invalid",
        sunrise: 1_700_000_000,
        sunset: 1_700_000_000,
        temp: "invalid",
        feels_like: 27.2,
        pressure: 1013,
        humidity: 65,
        dew_point: 18.5,
        uvi: 5.2,
        clouds: 20,
        visibility: 10_000,
        wind_speed: 3.5,
        wind_deg: 180,
        weather: [],
      },
    };
    mockFetch.mockResolvedValueOnce(createMockResponse(malformedData));

    // Execute & Verify
    await expect(fetchWeatherData()).rejects.toThrow(
      "Weather data validation failed"
    );
  });

  test("should handle weather condition without icon", async () => {
    // Setup
    const dataWithoutIcon = {
      ...MOCK_WEATHER_DATA,
      current: {
        ...MOCK_WEATHER_DATA.current,
        weather: [
          {
            id: 800,
            main: "Clear",
            description: "clear sky",
            // icon missing
          },
        ],
      },
    };
    mockFetch.mockResolvedValueOnce(createMockResponse(dataWithoutIcon));
    simulatePerformanceTiming(
      TEST_CONSTANTS.MOCK_START_TIME,
      TEST_CONSTANTS.MOCK_END_TIME
    );

    // Execute
    const result = await fetchWeatherData();

    // Verify
    expect(result.icon).toBe("01d"); // Should use default icon
  });

  test("should handle retry logic on server error", async () => {
    // Setup
    const serverError = createMockErrorResponse(
      TEST_CONSTANTS.SERVER_ERROR_STATUS,
      "Internal Server Error",
      "Server error"
    );
    const successResponse = createMockResponse(MOCK_WEATHER_DATA);

    mockFetch
      .mockResolvedValueOnce(serverError)
      .mockResolvedValueOnce(successResponse);

    simulatePerformanceTiming(
      TEST_CONSTANTS.MOCK_START_TIME,
      TEST_CONSTANTS.MOCK_END_TIME
    );

    // Execute
    const result = await fetchWeatherData();

    // Verify
    expect(result).toBeDefined();
    expect(mockFetch).toHaveBeenCalledTimes(TEST_CONSTANTS.RETRY_ATTEMPT_2);
  });

  test("should not retry on client error", async () => {
    // Setup
    const clientError = createMockErrorResponse(
      TEST_CONSTANTS.CLIENT_ERROR_STATUS,
      "Bad Request",
      "Invalid parameters"
    );
    mockFetch.mockResolvedValueOnce(clientError);

    // Execute & Verify
    await expect(fetchWeatherData()).rejects.toThrow(
      "OpenWeather API request failed: 400 Bad Request - Invalid parameters"
    );
    expect(mockFetch).toHaveBeenCalledTimes(TEST_CONSTANTS.RETRY_ATTEMPT_1);
  });

  test("should handle retry exhaustion", async () => {
    // Setup
    // Create fresh responses for each retry attempt
    mockFetch
      .mockResolvedValueOnce(
        createMockErrorResponse(
          TEST_CONSTANTS.SERVER_ERROR_STATUS,
          "Internal Server Error",
          "Server error"
        )
      )
      .mockResolvedValueOnce(
        createMockErrorResponse(
          TEST_CONSTANTS.SERVER_ERROR_STATUS,
          "Internal Server Error",
          "Server error"
        )
      )
      .mockResolvedValueOnce(
        createMockErrorResponse(
          TEST_CONSTANTS.SERVER_ERROR_STATUS,
          "Internal Server Error",
          "Server error"
        )
      );

    // Execute & Verify
    await expect(fetchWeatherData()).rejects.toThrow(
      "OpenWeather API request failed: 500 Internal Server Error - Server error"
    );
    expect(mockFetch).toHaveBeenCalledTimes(TEST_CONSTANTS.MAX_RETRIES); // Initial + 2 retries
  });

  test("should handle unknown error types", async () => {
    // Setup
    mockFetch.mockClear();
    // Mock all retry attempts to fail with the same error
    mockFetch.mockImplementation(() => Promise.reject("string error"));

    // Execute & Verify
    await expect(fetchWeatherData()).rejects.toThrow(
      "[fetchWeather.ts] ❌ string error"
    );
  });

  test("should handle non-Error from response.json()", async () => {
    // Setup
    mockFetch.mockClear();
    // Create a mock response with a json() method that throws a non-Error value
    const errorObject = { custom: "error object" };
    const mockResponse = {
      ok: true,
      status: TEST_CONSTANTS.SUCCESS_STATUS,
      statusText: "OK",
      json: () => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw errorObject; // Non-Error throw to test defensive error handling
      },
    } as unknown as Response;
    mockFetch.mockResolvedValueOnce(mockResponse);

    // Execute & Verify
    await expect(fetchWeatherData()).rejects.toThrow(
      "[fetchWeather.ts] ❌ Unexpected error during weather data fetch: [object Object]"
    );
  });

  test("should format temperature correctly", async () => {
    // Setup
    const dataWithDecimalTemp = {
      ...MOCK_WEATHER_DATA,
      current: {
        ...MOCK_WEATHER_DATA.current,
        temp: 25.7,
      },
    };
    mockFetch.mockResolvedValueOnce(createMockResponse(dataWithDecimalTemp));
    simulatePerformanceTiming(
      TEST_CONSTANTS.MOCK_START_TIME,
      TEST_CONSTANTS.MOCK_END_TIME
    );

    // Execute
    const result = await fetchWeatherData();

    // Verify
    expect(result.temperatureC).toBe(
      TEST_CONSTANTS.ROUNDED_TEMPERATURE as TemperatureCelsius
    );
  });

  test("should convert time to Dhaka timezone correctly", async () => {
    // Setup
    mockFetch.mockResolvedValueOnce(createMockResponse(MOCK_WEATHER_DATA));
    simulatePerformanceTiming(
      TEST_CONSTANTS.MOCK_START_TIME,
      TEST_CONSTANTS.MOCK_END_TIME
    );

    // Execute
    const result = await fetchWeatherData();

    // Verify
    expect(result.sunriseLocal).toMatch(REGEX_PATTERNS.TIME_PATTERN);
    expect(result.sunsetLocal).toMatch(REGEX_PATTERNS.TIME_PATTERN);
  });

  test("should handle different weather conditions", async () => {
    // Setup
    const dataWithRain = {
      ...MOCK_WEATHER_DATA,
      current: {
        ...MOCK_WEATHER_DATA.current,
        weather: [
          {
            id: 500,
            main: "Rain",
            description: "light rain",
            icon: "10d",
          },
        ],
      },
    };
    mockFetch.mockResolvedValueOnce(createMockResponse(dataWithRain));
    simulatePerformanceTiming(
      TEST_CONSTANTS.MOCK_START_TIME,
      TEST_CONSTANTS.MOCK_END_TIME
    );

    // Execute
    const result = await fetchWeatherData();

    // Verify
    expect(result.description).toBe("Light Rain");
    expect(result.icon).toBe("10d");
  });
});

describe("Type Guards and Utilities", () => {
  test("should handle toTitleCase function", async () => {
    // This tests the toTitleCase function indirectly through fetchWeatherData
    const dataWithComplexDescription = {
      ...MOCK_WEATHER_DATA,
      current: {
        ...MOCK_WEATHER_DATA.current,
        weather: [
          {
            id: 800,
            main: "Clear",
            description: "clear sky with scattered clouds",
            icon: "01d",
          },
        ],
      },
    };
    mockFetch.mockResolvedValueOnce(
      createMockResponse(dataWithComplexDescription)
    );
    simulatePerformanceTiming(
      TEST_CONSTANTS.MOCK_START_TIME,
      TEST_CONSTANTS.MOCK_END_TIME
    );

    // Execute
    const result = await fetchWeatherData();

    // Verify
    expect(result.description).toBe("Clear Sky With Scattered Clouds");
  });

  test("should handle empty string in toTitleCase", async () => {
    // This tests the toTitleCase function with empty string
    const dataWithEmptyDescription = {
      ...MOCK_WEATHER_DATA,
      current: {
        ...MOCK_WEATHER_DATA.current,
        weather: [
          {
            id: 800,
            main: "Clear",
            description: "",
            icon: "01d",
          },
        ],
      },
    };
    mockFetch.mockResolvedValueOnce(
      createMockResponse(dataWithEmptyDescription)
    );
    simulatePerformanceTiming(
      TEST_CONSTANTS.MOCK_START_TIME,
      TEST_CONSTANTS.MOCK_END_TIME
    );

    // Execute
    const result = await fetchWeatherData();

    // Verify
    expect(result.description).toBe("");
  });
});

describe("Performance and Timing", () => {
  test("should log performance timing", async () => {
    // Setup
    mockFetch.mockResolvedValueOnce(createMockResponse(MOCK_WEATHER_DATA));
    simulatePerformanceTiming(
      TEST_CONSTANTS.MOCK_START_TIME,
      TEST_CONSTANTS.MOCK_END_TIME_LONG
    );

    // Mock console output
    const originalWrite = process.stdout.write;
    const writeCalls: string[] = [];
    process.stdout.write = (chunk: string) => {
      writeCalls.push(chunk);
      return true;
    };

    try {
      // Execute
      await fetchWeatherData();

      // Verify
      expect(writeCalls).toContain("✅ API request completed in 150.75ms\n");
    } finally {
      process.stdout.write = originalWrite;
    }
  });
});

describe("Edge Cases and Error Scenarios", () => {
  test("should handle null response", async () => {
    // Setup
    mockFetch.mockResolvedValueOnce(null as unknown as Response);

    // Execute & Verify
    await expect(fetchWeatherData()).rejects.toThrow();
  });

  test("should handle response with missing current data", async () => {
    // Setup
    const dataWithoutCurrent = {
      lat: 23.8759,
      lon: 90.3795,
      timezone: "Asia/Dhaka",
      timezone_offset: SIX_HOURS_SECONDS,
      // current missing
    };
    mockFetch.mockResolvedValueOnce(createMockResponse(dataWithoutCurrent));

    // Execute & Verify
    await expect(fetchWeatherData()).rejects.toThrow(
      "Weather data validation failed"
    );
  });
});

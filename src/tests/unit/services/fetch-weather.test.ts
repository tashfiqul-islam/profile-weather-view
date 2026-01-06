/**
 * Tests for fetchWeather.ts: Weather API integration tests.
 * Uses mocked global fetch to simulate Open-Meteo JSON responses.
 */

import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test";
import type {
  HumidityPercentage,
  TemperatureCelsius,
} from "@/weather-update/services/fetch-weather";
import {
  fetchWeatherData,
  getFirstElement,
} from "@/weather-update/services/fetch-weather";
import type { MeteoconIconName } from "@/weather-update/services/wmo-mapper";

describe("fetchWeatherData", () => {
  // Mock data representing a valid Open-Meteo JSON response
  const MOCK_VALID_RESPONSE = {
    current: {
      temperature_2m: 25,
      relative_humidity_2m: 60,
      weather_code: 0,
      is_day: 1,
    },
    daily: {
      sunrise: [1_704_153_600], // Example Unix timestamp
      sunset: [1_704_196_800],
    },
    utc_offset_seconds: 21_600,
  };

  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = mock(() =>
      Promise.resolve(new Response("{}"))
    ) as unknown as typeof fetch;
  });

  // Restore fetch after tests
  afterAll(() => {
    global.fetch = originalFetch;
  });

  test("should fetch and transform weather data successfully", async () => {
    global.fetch = mock(() =>
      Promise.resolve(Response.json(MOCK_VALID_RESPONSE))
    ) as unknown as typeof fetch;

    // Execute
    const result = await fetchWeatherData();

    // Verify
    expect(result).toBeDefined();
    expect(result.temperatureC).toBe(25 as TemperatureCelsius);
    expect(result.humidityPct).toBe(60 as HumidityPercentage);
    expect(result.description).toBe("Clear Sky");
    expect(result.icon).toBe("clear-day" as MeteoconIconName);

    // Check branded types runtime check
    expect(typeof result.temperatureC).toBe("number");
    expect(typeof result.humidityPct).toBe("number");
    expect(typeof result.sunriseLocal).toBe("string");
  });

  test("should handle API failure (non-200 status)", async () => {
    global.fetch = mock(() =>
      Promise.resolve(
        new Response("Not Found", { status: 404, statusText: "Not Found" })
      )
    ) as unknown as typeof fetch;

    await expect(fetchWeatherData()).rejects.toThrow(
      "Open-Meteo API failed with status 404: Not Found"
    );
  });

  test("should handle malformed JSON response", async () => {
    global.fetch = mock(() =>
      Promise.resolve(new Response("{ invalid json }"))
    ) as unknown as typeof fetch;

    await expect(fetchWeatherData()).rejects.toThrow();
  });

  test("should handle missing required fields in JSON", async () => {
    const invalidResponse = { ...MOCK_VALID_RESPONSE, current: undefined };
    global.fetch = mock(() =>
      Promise.resolve(Response.json(invalidResponse))
    ) as unknown as typeof fetch;

    await expect(fetchWeatherData()).rejects.toThrow(
      "Invalid API response structure"
    );
  });

  test("should handle network errors", async () => {
    global.fetch = mock(() =>
      Promise.reject(new Error("Network Error"))
    ) as unknown as typeof fetch;

    await expect(fetchWeatherData()).rejects.toThrow("Network Error");
  });

  test("should throw validation error when data values are invalid", async () => {
    const invalidData = {
      ...MOCK_VALID_RESPONSE,
      current: { ...MOCK_VALID_RESPONSE.current, relative_humidity_2m: 150 },
    };

    global.fetch = mock(() =>
      Promise.resolve(Response.json(invalidData))
    ) as unknown as typeof fetch;

    await expect(fetchWeatherData()).rejects.toThrow(
      "Weather data validation failed"
    );
  });

  test("should handle non-Error objects thrown during fetch", async () => {
    global.fetch = mock(() =>
      Promise.reject("Critical failure")
    ) as unknown as typeof fetch;

    await expect(fetchWeatherData()).rejects.toThrow(
      "[fetchWeather.ts] ❌ Unexpected error during weather data fetch: Critical failure"
    );
  });

  test("should handle empty daily arrays in response", async () => {
    const emptyArraysResponse = {
      current: {
        temperature_2m: 25,
        relative_humidity_2m: 60,
        weather_code: 0,
        is_day: 1,
      },
      daily: {
        sunrise: [],
        sunset: [],
      },
      utc_offset_seconds: 21_600,
    };

    global.fetch = mock(() =>
      Promise.resolve(Response.json(emptyArraysResponse))
    ) as unknown as typeof fetch;

    await expect(fetchWeatherData()).rejects.toThrow(
      "Invalid API response structure"
    );
  });

  test("should handle multiple validation errors with paths", async () => {
    const multipleErrorsResponse = {
      current: {
        temperature_2m: 25,
        relative_humidity_2m: -10,
        weather_code: 0.5,
        is_day: 1,
      },
      daily: {
        sunrise: [1_704_153_600],
        sunset: [1_704_196_800],
      },
      utc_offset_seconds: 21_600,
    };

    global.fetch = mock(() =>
      Promise.resolve(Response.json(multipleErrorsResponse))
    ) as unknown as typeof fetch;

    await expect(fetchWeatherData()).rejects.toThrow(
      "Weather data validation failed"
    );
  });
});

describe("getFirstElement", () => {
  test("should return first element from non-empty array", () => {
    expect(getFirstElement([42, 100], "test")).toBe(42);
    expect(getFirstElement(["hello", "world"], "test")).toBe("hello");
  });

  test("should throw error for empty array", () => {
    expect(() => getFirstElement([], "sunrise")).toThrow(
      "Missing sunrise data in API response"
    );
  });

  test("should include field name in error message", () => {
    expect(() => getFirstElement([], "sunset")).toThrow(
      "Missing sunset data in API response"
    );
  });
});

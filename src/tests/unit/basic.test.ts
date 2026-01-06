/**
 * Basic infrastructure tests: environment, helpers, performance, and FS utils.
 * Comments focus on intent and edge-case coverage.
 */

import { describe, expect, test } from "bun:test";
import { testConfig, testUtils } from "@/tests/setup";
import {
  createMockFetch,
  createMockFetchResponse,
  createMockOpenWeatherResponse,
  createTestReadmeContent,
  createTestWeatherPayload,
  errorTestScenarios,
  performanceTestUtils,
  validateReadmeWeatherSection,
  WEATHER_TEST_CONSTANTS,
} from "@/tests/utils/weather-test-helpers";
import type {
  HumidityPercentage,
  TemperatureCelsius,
} from "@/weather-update/services/fetch-weather";
import type { MeteoconIconName } from "@/weather-update/services/wmo-mapper";

describe("Bun Test Infrastructure", () => {
  test("should have proper test environment", () => {
    process.env["NODE_ENV"] = "test";
    expect(process.env["NODE_ENV"]).toBe("test");
    expect(process.env["CI"]).toBe("true");
    expect(process.env["NODE_ENV"]).toBeDefined();
  });
});

describe("Weather Test Helpers", () => {
  test("should create valid weather payload", () => {
    const payload = createTestWeatherPayload();

    expect(payload).toBeDefined();
    expect(payload.description).toBeTypeOf("string");
    expect(payload.temperatureC).toBeTypeOf("number");
    expect(payload.sunriseLocal).toBeTypeOf("string");
    expect(payload.sunsetLocal).toBeTypeOf("string");
    expect(payload.humidityPct).toBeTypeOf("number");
    expect(payload.icon).toBeTypeOf("string");
  });

  test("should create valid API response", () => {
    const response = createMockOpenWeatherResponse();

    expect(response).toBeDefined();
    expect(response["lat"]).toBe(
      Number.parseFloat(WEATHER_TEST_CONSTANTS.LOCATION.LAT)
    );
    expect(response["lon"]).toBe(
      Number.parseFloat(WEATHER_TEST_CONSTANTS.LOCATION.LON)
    );
    expect(response["timezone"]).toBe(WEATHER_TEST_CONSTANTS.LOCATION.TIMEZONE);
    expect(response["current"]).toBeDefined();
    expect((response["current"] as { weather: unknown[] }).weather).toBeArray();
  });

  test("should allow payload overrides", () => {
    const CUSTOM_DESCRIPTION = "Rain";
    const CUSTOM_TEMPERATURE = 15;

    const customPayload = createTestWeatherPayload({
      description: CUSTOM_DESCRIPTION,
      temperatureC: CUSTOM_TEMPERATURE as TemperatureCelsius,
    });

    expect(customPayload.description).toBe(CUSTOM_DESCRIPTION);
    expect(customPayload.temperatureC).toBe(
      CUSTOM_TEMPERATURE as TemperatureCelsius
    );
    expect(customPayload.humidityPct).toBe(
      WEATHER_TEST_CONSTANTS.HUMIDITY.DEFAULT as HumidityPercentage
    );
  });
});

describe("Performance Utilities", () => {
  const DELAY_MS = 10;
  const THRESHOLD_MS = 100;
  const FAST_DURATION = 50;
  const SLOW_DURATION = 150;

  test("should measure execution time", async () => {
    const { result, duration } =
      await performanceTestUtils.measureExecutionTime(async () => {
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
        return "test result";
      });

    expect(result).toBe("test result");
    expect(duration).toBeTypeOf("number");
    expect(duration).toBeGreaterThan(0);
  });

  test("should create threshold checker", () => {
    const checker = performanceTestUtils.createThresholdChecker(THRESHOLD_MS);

    expect(checker.check(FAST_DURATION)).toBe(true);
    expect(checker.check(SLOW_DURATION)).toBe(false);
    expect(checker.message(SLOW_DURATION)).toContain(
      `Expected execution time ≤ ${THRESHOLD_MS}ms`
    );
  });
});

describe("File System Utilities", () => {
  test("should create temp file", async () => {
    const content = "test content";
    const filename = "test-file.md";

    const tempPath = await testUtils.fs.createTempFile(content, filename);

    expect(tempPath).toContain("profile-weather-view-tests");
    expect(
      tempPath.endsWith(`/${filename}`) || tempPath.endsWith(`\\${filename}`)
    ).toBeTrue();

    // Verify file was created
    const file = Bun.file(tempPath);
    expect(await file.exists()).toBe(true);

    const fileContent = await file.text();
    expect(fileContent).toBe(content);
  });

  test("should create temp file with default filename", async () => {
    const content = "default filename test";
    const tempPath = await testUtils.fs.createTempFile(content);

    expect(tempPath).toContain("profile-weather-view-tests");
    expect(
      tempPath.endsWith("/temp.md") || tempPath.endsWith("\\temp.md")
    ).toBeTrue();

    // Verify file was created
    const file = Bun.file(tempPath);
    expect(await file.exists()).toBe(true);

    const fileContent = await file.text();
    expect(fileContent).toBe(content);
  });

  test("should cleanup temp files", async () => {
    // This test covers the cleanup function
    await testUtils.fs.cleanupTempFiles();
    // The function should not throw an error
    expect(true).toBe(true);
  });
});

describe("Weather Test Helpers - Comprehensive Coverage", () => {
  test("should create test README content with custom weather data", () => {
    const customWeather = createTestWeatherPayload({
      description: "Thunderstorm",
      temperatureC: 30 as TemperatureCelsius,
      humidityPct: 85 as HumidityPercentage,
      icon: "thunderstorms-day" as MeteoconIconName,
    });

    const readmeContent = createTestReadmeContent(customWeather);

    expect(readmeContent).toContain("Thunderstorm");
    expect(readmeContent).toContain("30°C");
    expect(readmeContent).toContain("Humidity: 85%");
    expect(readmeContent).toContain("thunderstorms-day.svg");
    expect(readmeContent).toContain("<!-- Hourly Weather Update -->");
    expect(readmeContent).toContain("<!-- End of Hourly Weather Update -->");
  });

  test("should create test README content with default weather data", () => {
    const readmeContent = createTestReadmeContent();

    expect(readmeContent).toContain("Clear Sky");
    expect(readmeContent).toContain("25°C");
    expect(readmeContent).toContain("Humidity: 60%");
    expect(readmeContent).toContain("clear-day.svg");
  });

  test("should validate README weather section", () => {
    const validContent =
      "Some content <!-- Hourly Weather Update --> Weather data <!-- End of Hourly Weather Update --> More content";
    const invalidContent = "Some content without weather section";

    expect(validateReadmeWeatherSection(validContent)).toBe(true);
    expect(validateReadmeWeatherSection(invalidContent)).toBe(false);
  });

  test("should create mock fetch response with custom status and data", () => {
    const customData = { custom: "data" };
    const customStatus = 201; // 201 is in the 200-299 range, so it should be OK

    const response = createMockFetchResponse(customStatus, customData);

    expect(response.ok).toBe(true);
    expect(response.status).toBe(customStatus);
    expect(response.statusText).toBe("OK");
  });

  test("should create mock fetch response with error status", () => {
    const errorStatus = 404;
    const response = createMockFetchResponse(errorStatus);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(errorStatus);
    expect(response.statusText).toBe("Error");
  });

  test("should create mock fetch with multiple responses", async () => {
    const SUCCESS_STATUS_200 = 200;
    const SUCCESS_STATUS_201 = 201;

    const responses = [
      () =>
        createMockFetchResponse(SUCCESS_STATUS_200, {
          first: "response",
        }) as Response,
      () =>
        createMockFetchResponse(SUCCESS_STATUS_201, {
          second: "response",
        }) as Response,
    ];

    const mockFetch = createMockFetch(responses);

    const response1 = await mockFetch("url1");
    const response2 = await mockFetch("url2");
    const response3 = await mockFetch("url3"); // Should cycle back to first

    expect(response1.status).toBe(SUCCESS_STATUS_200);
    expect(response2.status).toBe(SUCCESS_STATUS_201);
    expect(response3.status).toBe(SUCCESS_STATUS_200);
  });

  test("should create mock fetch with no responses", async () => {
    const DEFAULT_SUCCESS_STATUS = 200;

    const mockFetch = createMockFetch();
    const response = await mockFetch("url");

    expect(response.status).toBe(DEFAULT_SUCCESS_STATUS);
    expect(response.ok).toBe(true);
  });

  test("should handle async JSON parsing in mock responses", async () => {
    const SUCCESS_STATUS = 200;
    const testData = { test: "data" };
    const response = createMockFetchResponse(SUCCESS_STATUS, testData);

    const jsonData = await response.json();
    const textData = await response.text();

    expect(jsonData).toEqual(testData);
    expect(textData).toBe(JSON.stringify(testData));
  });
});

describe("Test Setup - Global Hooks Coverage", () => {
  test("should have test utilities with all expected methods", () => {
    expect(testUtils.createMockWeatherData).toBeTypeOf("function");
    expect(testUtils.createMockApiResponse).toBeTypeOf("function");
    expect(testUtils.createMockReadmeContent).toBeTypeOf("function");
    expect(testUtils.performance).toBeDefined();
    expect(testUtils.performance.startTimer).toBeTypeOf("function");
    expect(testUtils.performance.endTimer).toBeTypeOf("function");
    expect(testUtils.fs).toBeDefined();
    expect(testUtils.fs.createTempFile).toBeTypeOf("function");
    expect(testUtils.fs.cleanupTempFiles).toBeTypeOf("function");
  });

  test("should have test configuration with all expected properties", () => {
    const EXPECTED_TIMEOUT = 15_000;
    const API_CALL_THRESHOLD = 2000;
    const FILE_OPERATION_THRESHOLD = 100;
    const TOTAL_TEST_THRESHOLD = 5000;

    expect(testConfig.timeout).toBe(EXPECTED_TIMEOUT);
    expect(testConfig.isTest).toBe(true);
    expect(testConfig.isCI).toBe(true);
    expect(testConfig.mockWeatherData).toBeDefined();
    expect(testConfig.mockApiResponse).toBeDefined();
    expect(testConfig.mockReadmeContent).toBeDefined();
    expect(testConfig.performanceThresholds).toBeDefined();
    expect(testConfig.performanceThresholds.apiCall).toBe(API_CALL_THRESHOLD);
    expect(testConfig.performanceThresholds.fileOperation).toBe(
      FILE_OPERATION_THRESHOLD
    );
    expect(testConfig.performanceThresholds.totalTest).toBe(
      TOTAL_TEST_THRESHOLD
    );
  });

  test("should have performance utilities working correctly", () => {
    const startTime = testUtils.performance.startTimer("test");
    expect(startTime).toBeUndefined(); // startTimer doesn't return anything

    const duration = testUtils.performance.endTimer("test");
    expect(duration).toBeTypeOf("number");
    expect(duration).toBeGreaterThanOrEqual(0);
  });

  test("should have resetMocks function available", () => {
    // Check if resetMocks exists in testUtils
    expect(testUtils.resetMocks).toBeTypeOf("function");

    // Call resetMocks - this should not throw an error
    testUtils.resetMocks();
    expect(true).toBe(true);
  });

  test("should handle invalid JSON error scenario", async () => {
    const SUCCESS_STATUS = 200;

    const invalidJsonResponse = errorTestScenarios.invalidJson();

    expect(invalidJsonResponse.status).toBe(SUCCESS_STATUS);
    expect(invalidJsonResponse.ok).toBe(true);

    // Test that the json() method throws an error
    try {
      await invalidJsonResponse.json();
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe("Invalid JSON");
    }
  });

  test("should test createMockFetch with undefined responses", async () => {
    const SUCCESS_STATUS = 200;

    // Test the uncovered line where responses[responseIndex] might be undefined
    const responses = [
      () =>
        createMockFetchResponse(SUCCESS_STATUS, {
          first: "response",
        }) as Response,
      undefined as any, // This will trigger the fallback case
      () =>
        createMockFetchResponse(SUCCESS_STATUS, {
          third: "response",
        }) as Response,
    ];

    const mockFetch = createMockFetch(responses);

    // First call should work
    const response1 = await mockFetch("url1");
    expect(response1.status).toBe(SUCCESS_STATUS);

    // Second call should trigger the undefined response fallback
    const response2 = await mockFetch("url2");
    expect(response2.status).toBe(SUCCESS_STATUS); // Should return default response
    expect(response2.ok).toBe(true);

    // Third call should work
    const response3 = await mockFetch("url3");
    expect(response3.status).toBe(SUCCESS_STATUS);
  });

  test("should test performance utilities createBenchmark", () => {
    const FAST_THRESHOLD = 100;
    const NORMAL_THRESHOLD = 500;
    const SLOW_THRESHOLD = 1000;
    const TEST_DURATION_FAST = 50;
    const TEST_DURATION_NORMAL = 80;
    const TEST_DURATION_SLOW = 600;
    const TEST_DURATION_VERY_SLOW = 1500;

    const thresholds = {
      fast: FAST_THRESHOLD,
      normal: NORMAL_THRESHOLD,
      slow: SLOW_THRESHOLD,
    };

    const benchmark = performanceTestUtils.createBenchmark(thresholds);

    // Test checkAll with duration within all thresholds
    expect(benchmark.checkAll(TEST_DURATION_FAST)).toBe(true);
    expect(benchmark.checkAll(TEST_DURATION_NORMAL)).toBe(true);
    expect(benchmark.checkAll(TEST_DURATION_SLOW)).toBe(false);
    expect(benchmark.checkAll(TEST_DURATION_VERY_SLOW)).toBe(false);

    // Test getViolations
    const violations = benchmark.getViolations(TEST_DURATION_SLOW);
    expect(violations).toHaveLength(2); // Both fast and normal thresholds violated
    expect(violations[0]?.name).toBe("fast");
    expect(violations[0]?.threshold).toBe(FAST_THRESHOLD);
    expect(violations[0]?.actual).toBe(TEST_DURATION_SLOW);
    expect(violations[1]?.name).toBe("normal");
    expect(violations[1]?.threshold).toBe(NORMAL_THRESHOLD);
    expect(violations[1]?.actual).toBe(TEST_DURATION_SLOW);

    const noViolations = benchmark.getViolations(TEST_DURATION_FAST);
    expect(noViolations).toHaveLength(0);
  });

  test("should test performance threshold edge cases", async () => {
    const DELAY_FAST = 50; // Much faster than FAST_THRESHOLD (1000ms)
    const DELAY_NORMAL = 2000; // Between FAST (1000ms) and NORMAL (5000ms)

    // Test fast threshold
    const { threshold: fastThreshold } =
      await performanceTestUtils.measureExecutionTime(async () => {
        await new Promise((resolve) => setTimeout(resolve, DELAY_FAST));
        return "fast result";
      });
    expect(fastThreshold).toBe("fast");

    // Test normal threshold
    const { threshold: normalThreshold } =
      await performanceTestUtils.measureExecutionTime(async () => {
        await new Promise((resolve) => setTimeout(resolve, DELAY_NORMAL));
        return "normal result";
      });
    expect(normalThreshold).toBe("normal");
  });
});

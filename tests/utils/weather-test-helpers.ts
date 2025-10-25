/**
 * Weather Test Helpers
 * Specialized utilities for testing weather update functionality
 *
 * @fileoverview Modern TypeScript 5.9.3 test utilities with strict typing
 * @version 2.2.2
 * @author Tashfiqul Islam
 */

import type {
  HumidityPercentage,
  TemperatureCelsius,
  TimeString,
  WeatherUpdatePayload,
} from "../../src/weather-update/services/fetchWeather";

// ================================
// 🎯 TypeScript 5.9.3 Modern Types
// ================================

/**
 * HTTP status code constants
 */
const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  RATE_LIMIT: 429,
  SERVER_ERROR: 500,
} as const;

/**
 * Template literal type for weather conditions
 */
type WeatherCondition =
  | "Clear Sky"
  | "Clouds"
  | "Rain"
  | "Snow"
  | "Thunderstorm"
  | "Drizzle"
  | "Fog"
  | "Mist";

/**
 * Mapped type for test configuration
 */
type TestConfig<T extends Record<string, unknown>> = {
  readonly [K in keyof T]: T[K] extends infer U
    ? U extends (...args: unknown[]) => unknown
      ? U
      : Readonly<U>
    : never;
};

/**
 * Conditional type for performance thresholds
 */
type PerformanceThreshold = "disabled" | "fast" | "normal" | "slow";

// ================================
// 🌦️ Weather Data Test Utilities
// ================================

/**
 * Weather test data constants
 */
export const WEATHER_TEST_CONSTANTS: {
  readonly LOCATION: {
    readonly LAT: string;
    readonly LON: string;
    readonly TIMEZONE: string;
    readonly COORDINATES: {
      readonly lat: number;
      readonly lon: number;
    };
  };
  readonly API_RESPONSE: {
    readonly STATUS_OK: number;
    readonly STATUS_UNAUTHORIZED: number;
    readonly STATUS_RATE_LIMIT: number;
    readonly STATUS_SERVER_ERROR: number;
    readonly SUCCESS_CODES: readonly number[];
    readonly ERROR_CODES: readonly number[];
  };
  readonly TIME: {
    readonly HOUR_IN_SECONDS: number;
    readonly UTC_OFFSET_DHAKA: number;
    readonly MILLISECONDS_TO_SECONDS: number;
  };
  readonly HTTP_STATUS: {
    readonly OK_MIN: number;
    readonly OK_MAX: number;
    readonly CLIENT_ERROR_MIN: number;
    readonly CLIENT_ERROR_MAX: number;
    readonly SERVER_ERROR_MIN: number;
    readonly SERVER_ERROR_MAX: number;
  };
  readonly WEATHER_CONDITIONS: {
    readonly CLEAR_SKY: WeatherCondition;
    readonly CLOUDS: WeatherCondition;
    readonly RAIN: WeatherCondition;
    readonly SNOW: WeatherCondition;
    readonly THUNDERSTORM: WeatherCondition;
    readonly MIST: WeatherCondition;
    readonly DRIZZLE: WeatherCondition;
    readonly FOG: WeatherCondition;
  };
  readonly ICONS: {
    readonly CLEAR_DAY: string;
    readonly CLEAR_NIGHT: string;
    readonly CLOUDY_DAY: string;
    readonly CLOUDY_NIGHT: string;
    readonly RAIN_DAY: string;
    readonly RAIN_NIGHT: string;
    readonly THUNDERSTORM: string;
  };
  readonly TEMPERATURE: {
    readonly DEFAULT: number;
    readonly MIN: number;
    readonly MAX: number;
    readonly FREEZING: number;
    readonly BOILING: number;
  };
  readonly HUMIDITY: {
    readonly DEFAULT: number;
    readonly MIN: number;
    readonly MAX: number;
  };
  readonly TEST_CONFIG: {
    readonly TIMEOUT: number;
    readonly API_CALL_THRESHOLD: number;
    readonly FILE_OPERATION_THRESHOLD: number;
    readonly TOTAL_TEST_THRESHOLD: number;
  };
  readonly PERFORMANCE: {
    readonly FAST: number;
    readonly NORMAL: number;
    readonly SLOW: number;
  };
} = {
  // Location constants with branded types
  LOCATION: {
    LAT: "23.8759" as const,
    LON: "90.3795" as const,
    TIMEZONE: "Asia/Dhaka" as const,
    COORDINATES: {
      lat: 23.8759,
      lon: 90.3795,
    } as const,
  },

  // API response constants with literal types
  API_RESPONSE: {
    STATUS_OK: HTTP_STATUS_CODES.OK,
    STATUS_UNAUTHORIZED: HTTP_STATUS_CODES.UNAUTHORIZED,
    STATUS_RATE_LIMIT: HTTP_STATUS_CODES.RATE_LIMIT,
    STATUS_SERVER_ERROR: HTTP_STATUS_CODES.SERVER_ERROR,
    SUCCESS_CODES: [
      HTTP_STATUS_CODES.OK,
      HTTP_STATUS_CODES.CREATED,
      HTTP_STATUS_CODES.ACCEPTED,
    ] as const,
    ERROR_CODES: [
      HTTP_STATUS_CODES.BAD_REQUEST,
      HTTP_STATUS_CODES.UNAUTHORIZED,
      HTTP_STATUS_CODES.RATE_LIMIT,
      HTTP_STATUS_CODES.SERVER_ERROR,
    ] as const,
  },

  // Time constants with numeric separators
  TIME: {
    HOUR_IN_SECONDS: 3600 as const,
    UTC_OFFSET_DHAKA: 21_600 as const, // UTC+6
    MILLISECONDS_TO_SECONDS: 1000 as const,
  },

  // HTTP status constants with range types
  HTTP_STATUS: {
    OK_MIN: 200 as const,
    OK_MAX: 299 as const,
    CLIENT_ERROR_MIN: 400 as const,
    CLIENT_ERROR_MAX: 499 as const,
    SERVER_ERROR_MIN: 500 as const,
    SERVER_ERROR_MAX: 599 as const,
  },

  // Weather condition constants with template literal types
  WEATHER_CONDITIONS: {
    CLEAR_SKY: "Clear Sky" as const,
    CLOUDS: "Clouds" as const,
    RAIN: "Rain" as const,
    SNOW: "Snow" as const,
    THUNDERSTORM: "Thunderstorm" as const,
    MIST: "Mist" as const,
    DRIZZLE: "Drizzle" as const,
    FOG: "Fog" as const,
  } as const,

  // Icon constants with branded types
  ICONS: {
    CLEAR_DAY: "01d" as const,
    CLEAR_NIGHT: "01n" as const,
    CLOUDY_DAY: "02d" as const,
    CLOUDY_NIGHT: "02n" as const,
    RAIN_DAY: "10d" as const,
    RAIN_NIGHT: "10n" as const,
    THUNDERSTORM: "11d" as const,
  } as const,

  // Temperature constants with branded types
  TEMPERATURE: {
    DEFAULT: 25 as const,
    MIN: -50 as const,
    MAX: 60 as const,
    FREEZING: 0 as const,
    BOILING: 100 as const,
  } as const,

  // Humidity constants with branded types
  HUMIDITY: {
    DEFAULT: 60 as const,
    MIN: 0 as const,
    MAX: 100 as const,
  } as const,

  // Test configuration constants with performance thresholds
  TEST_CONFIG: {
    TIMEOUT: 15_000 as const,
    API_CALL_THRESHOLD: 2000 as const,
    FILE_OPERATION_THRESHOLD: 100 as const,
    TOTAL_TEST_THRESHOLD: 5000 as const,
  } as const,

  // Performance threshold types
  PERFORMANCE: {
    FAST: 1000 as const,
    NORMAL: 5000 as const,
    SLOW: 10_000 as const,
  } as const,
} as const satisfies TestConfig<typeof WEATHER_TEST_CONSTANTS>;

/**
 * Creates a valid WeatherUpdatePayload for testing
 * Uses modern TypeScript 5.9.3 features with strict typing
 */
export function createTestWeatherPayload(
  overrides: Partial<WeatherUpdatePayload> = {}
): WeatherUpdatePayload {
  const DEFAULT_PAYLOAD = {
    description: WEATHER_TEST_CONSTANTS.WEATHER_CONDITIONS.CLEAR_SKY,
    temperatureC: WEATHER_TEST_CONSTANTS.TEMPERATURE
      .DEFAULT as TemperatureCelsius,
    sunriseLocal: "06:00" as TimeString,
    sunsetLocal: "18:00" as TimeString,
    humidityPct: WEATHER_TEST_CONSTANTS.HUMIDITY.DEFAULT as HumidityPercentage,
    icon: WEATHER_TEST_CONSTANTS.ICONS.CLEAR_DAY,
  } as const satisfies WeatherUpdatePayload;

  return { ...DEFAULT_PAYLOAD, ...overrides };
}

/**
 * Creates a mock OpenWeather API response
 * Uses modern TypeScript 5.9.3 features with strict typing
 */
export function createMockOpenWeatherResponse(
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  const currentTime = Math.floor(
    Date.now() / WEATHER_TEST_CONSTANTS.TIME.MILLISECONDS_TO_SECONDS
  );

  const DEFAULT_RESPONSE = {
    lat: Number.parseFloat(WEATHER_TEST_CONSTANTS.LOCATION.LAT),
    lon: Number.parseFloat(WEATHER_TEST_CONSTANTS.LOCATION.LON),
    timezone: WEATHER_TEST_CONSTANTS.LOCATION.TIMEZONE,
    timezone_offset: WEATHER_TEST_CONSTANTS.TIME.UTC_OFFSET_DHAKA,
    current: {
      dt: currentTime,
      sunrise: currentTime - WEATHER_TEST_CONSTANTS.TIME.HOUR_IN_SECONDS,
      sunset: currentTime + WEATHER_TEST_CONSTANTS.TIME.HOUR_IN_SECONDS,
      temp: WEATHER_TEST_CONSTANTS.TEMPERATURE.DEFAULT,
      feels_like: WEATHER_TEST_CONSTANTS.TEMPERATURE.DEFAULT + 2,
      pressure: 1013 as const,
      humidity: WEATHER_TEST_CONSTANTS.HUMIDITY.DEFAULT,
      dew_point: 18.5 as const,
      uvi: 6.5 as const,
      clouds: 10 as const,
      visibility: 10_000 as const,
      wind_speed: 3.5 as const,
      wind_deg: 180 as const,
      weather: [
        {
          id: 800 as const,
          main: "Clear" as const,
          description: "clear sky" as const,
          icon: WEATHER_TEST_CONSTANTS.ICONS.CLEAR_DAY,
        },
      ] as const,
    },
  } as const;

  return { ...DEFAULT_RESPONSE, ...overrides };
}

// ================================
// 📝 README Test Utilities
// ================================

/**
 * README test constants
 */
export const README_TEST_CONSTANTS = {
  WEATHER_SECTION_START: "<!-- Hourly Weather Update -->",
  WEATHER_SECTION_END: "<!-- End of Hourly Weather Update -->",
  REFRESH_TIME_PATTERN: /<em>Last refresh:.*?<\/em>/,
  TEMPERATURE_PATTERN: /\d+°C/g,
  HUMIDITY_PATTERN: /\d+%/g,
  SUNRISE_PATTERN: /(Sunrise:?\s*)\d{1,2}:\d{2}(:\d{2})?/gi,
  SUNSET_PATTERN: /(Sunset:?\s*)\d{1,2}:\d{2}(:\d{2})?/gi,
  ICON_PATTERN: /openweathermap\.org\/img\/w\/\w+\.png/g,
  ALT_TEXT_PATTERN: /alt="[^"]*icon"/g,
} as const;

/**
 * Creates a test README content with weather section
 */
export function createTestReadmeContent(
  weatherData?: WeatherUpdatePayload
): string {
  const weather = weatherData || createTestWeatherPayload();

  return `# Profile README

## Weather Information
${README_TEST_CONSTANTS.WEATHER_SECTION_START}
![Weather](https://openweathermap.org/img/w/${weather.icon}.png)
**${weather.description}** | ${weather.temperatureC}°C | Humidity: ${weather.humidityPct}%
Sunrise: ${weather.sunriseLocal} | Sunset: ${weather.sunsetLocal}
<em>Last refresh: Monday, January 01, 2024 at 12:00:00 (UTC+6)</em>
${README_TEST_CONSTANTS.WEATHER_SECTION_END}

## Other Content
This is other content that should not be modified.

## Projects
- Project 1
- Project 2
`;
}

/**
 * Validates that README content contains weather section
 */
export function validateReadmeWeatherSection(content: string): boolean {
  return (
    content.includes(README_TEST_CONSTANTS.WEATHER_SECTION_START) &&
    content.includes(README_TEST_CONSTANTS.WEATHER_SECTION_END)
  );
}

// ================================
// 🔧 API Test Utilities
// ================================

/**
 * Creates a mock fetch response for testing
 */
export function createMockFetchResponse(
  status: number = WEATHER_TEST_CONSTANTS.API_RESPONSE.STATUS_OK,
  data: unknown = createMockOpenWeatherResponse()
) {
  const isOk =
    status >= WEATHER_TEST_CONSTANTS.HTTP_STATUS.OK_MIN &&
    status <= WEATHER_TEST_CONSTANTS.HTTP_STATUS.OK_MAX;

  return {
    ok: isOk,
    status,
    statusText: isOk ? "OK" : "Error",
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

/**
 * Creates a mock fetch function for testing
 */
export function createMockFetch(responses: Array<() => Response> = []) {
  let callCount = 0;

  return (
    _url: string | URL | Request,
    _init?: RequestInit
  ): Promise<Response> => {
    const responseIndex = callCount % responses.length;
    callCount++;

    if (responses.length === 0) {
      return Promise.resolve(createMockFetchResponse() as Response);
    }

    const response = responses[responseIndex];
    if (!response) {
      return Promise.resolve(createMockFetchResponse() as Response);
    }
    return Promise.resolve(response());
  };
}

// ================================
// ⏱️ Performance Test Utilities
// ================================

/**
 * Performance test utilities with modern TypeScript 5.9.3 features
 */
export const performanceTestUtils = {
  /**
   * Measures execution time of a function with branded return type
   */
  measureExecutionTime: async <T>(
    fn: () => Promise<T> | T
  ): Promise<{
    readonly result: T;
    readonly duration: number;
    readonly threshold: PerformanceThreshold;
  }> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    // Determine performance threshold category
    let threshold: PerformanceThreshold;
    if (duration <= WEATHER_TEST_CONSTANTS.PERFORMANCE.FAST) {
      threshold = "fast";
    } else if (duration <= WEATHER_TEST_CONSTANTS.PERFORMANCE.NORMAL) {
      threshold = "normal";
    } else {
      threshold = "slow";
    }

    return { result, duration, threshold } as const;
  },

  /**
   * Creates a performance threshold checker with branded types
   */
  createThresholdChecker: (threshold: number) =>
    ({
      check: (duration: number): boolean => duration <= threshold,
      message: (duration: number): string =>
        `Expected execution time ≤ ${threshold}ms, got ${duration.toFixed(2)}ms`,
      isWithinThreshold: (duration: number): duration is number =>
        duration <= threshold,
    }) as const,

  /**
   * Creates a performance benchmark with multiple thresholds
   */
  createBenchmark: <T extends Record<string, number>>(thresholds: T) =>
    ({
      checkAll: (duration: number) =>
        Object.entries(thresholds).every(
          ([, threshold]) => duration <= threshold
        ),
      getViolations: (duration: number) =>
        Object.entries(thresholds)
          .filter(([, threshold]) => duration > threshold)
          .map(([name, threshold]) => ({ name, threshold, actual: duration })),
    }) as const,
} as const;

// ================================
// 🧪 Test Data Generators
// ================================

/**
 * Generates test data for different weather conditions
 */
export const weatherTestData = {
  clearSky: () =>
    createTestWeatherPayload({
      description: WEATHER_TEST_CONSTANTS.WEATHER_CONDITIONS.CLEAR_SKY,
      icon: WEATHER_TEST_CONSTANTS.ICONS.CLEAR_DAY,
    }),

  cloudy: () =>
    createTestWeatherPayload({
      description: WEATHER_TEST_CONSTANTS.WEATHER_CONDITIONS.CLOUDS,
      icon: WEATHER_TEST_CONSTANTS.ICONS.CLOUDY_DAY,
    }),

  rainy: () =>
    createTestWeatherPayload({
      description: WEATHER_TEST_CONSTANTS.WEATHER_CONDITIONS.RAIN,
      icon: WEATHER_TEST_CONSTANTS.ICONS.RAIN_DAY,
    }),

  extreme: () =>
    createTestWeatherPayload({
      description: WEATHER_TEST_CONSTANTS.WEATHER_CONDITIONS.THUNDERSTORM,
      temperatureC: 35 as TemperatureCelsius,
      humidityPct: 95 as HumidityPercentage,
      icon: "11d",
    }),
};

/**
 * Generates error scenarios for testing
 */
export const errorTestScenarios = {
  invalidApiKey: () =>
    createMockFetchResponse(
      WEATHER_TEST_CONSTANTS.API_RESPONSE.STATUS_UNAUTHORIZED
    ),
  rateLimited: () =>
    createMockFetchResponse(
      WEATHER_TEST_CONSTANTS.API_RESPONSE.STATUS_RATE_LIMIT
    ),
  serverError: () =>
    createMockFetchResponse(
      WEATHER_TEST_CONSTANTS.API_RESPONSE.STATUS_SERVER_ERROR
    ),
  networkError: () => {
    throw new Error("Network error");
  },
  invalidJson: () => ({
    ok: true,
    status: 200,
    json: () => {
      throw new Error("Invalid JSON");
    },
  }),
};

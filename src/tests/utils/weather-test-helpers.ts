/**
 * Weather test helpers: payload builders, mock responses, and perf utilities.
 * Comments emphasize intent and reuse across tests.
 */

import type {
  HumidityPercentage,
  TemperatureCelsius,
  TimeString,
  WeatherUpdatePayload,
} from "../../../src/weather-update/services/fetchWeather";

// Types and constants used for shaping test data

/** HTTP status code constants. */
const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  RATE_LIMIT: 429,
  SERVER_ERROR: 500,
} as const;

/** Template literal type for weather conditions. */
type WeatherCondition =
  | "Clear Sky"
  | "Clouds"
  | "Rain"
  | "Snow"
  | "Thunderstorm"
  | "Drizzle"
  | "Fog"
  | "Mist";

/** Mapped type for test configuration. */
type TestConfig<T extends Record<string, unknown>> = {
  readonly [K in keyof T]: T[K] extends infer U
    ? U extends (...args: unknown[]) => unknown
      ? U
      : Readonly<U>
    : never;
};

/** Conditional type for performance thresholds. */
type PerformanceThreshold = "disabled" | "fast" | "normal" | "slow";

// ================================
// 🌦️ Weather Data Test Utilities
// ================================

/** Centralized test constants for weather scenarios and thresholds. */
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
  // Location constants
  LOCATION: {
    LAT: "23.8759" as const,
    LON: "90.3795" as const,
    TIMEZONE: "Asia/Dhaka" as const,
    COORDINATES: {
      lat: 23.8759,
      lon: 90.3795,
    } as const,
  },

  // API response constants
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

  // Time constants
  TIME: {
    HOUR_IN_SECONDS: 3600 as const,
    UTC_OFFSET_DHAKA: 21_600 as const, // UTC+6
    MILLISECONDS_TO_SECONDS: 1000 as const,
  },

  // HTTP status ranges used for ok/error
  HTTP_STATUS: {
    OK_MIN: 200 as const,
    OK_MAX: 299 as const,
    CLIENT_ERROR_MIN: 400 as const,
    CLIENT_ERROR_MAX: 499 as const,
    SERVER_ERROR_MIN: 500 as const,
    SERVER_ERROR_MAX: 599 as const,
  },

  // Weather condition names
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

  // Icon codes
  ICONS: {
    CLEAR_DAY: "01d" as const,
    CLEAR_NIGHT: "01n" as const,
    CLOUDY_DAY: "02d" as const,
    CLOUDY_NIGHT: "02n" as const,
    RAIN_DAY: "10d" as const,
    RAIN_NIGHT: "10n" as const,
    THUNDERSTORM: "11d" as const,
  } as const,

  // Temperature constants
  TEMPERATURE: {
    DEFAULT: 25 as const,
    MIN: -50 as const,
    MAX: 60 as const,
    FREEZING: 0 as const,
    BOILING: 100 as const,
  } as const,

  // Humidity constants
  HUMIDITY: {
    DEFAULT: 60 as const,
    MIN: 0 as const,
    MAX: 100 as const,
  } as const,

  // Test configuration thresholds
  TEST_CONFIG: {
    TIMEOUT: 15_000 as const,
    API_CALL_THRESHOLD: 2000 as const,
    FILE_OPERATION_THRESHOLD: 100 as const,
    TOTAL_TEST_THRESHOLD: 5000 as const,
  } as const,

  // Performance thresholds
  PERFORMANCE: {
    FAST: 1000 as const,
    NORMAL: 5000 as const,
    SLOW: 10_000 as const,
  } as const,
} as const satisfies TestConfig<typeof WEATHER_TEST_CONSTANTS>;

/** Builds a valid WeatherUpdatePayload for tests (overrides allowed). */
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

/** Produces a minimal OpenWeather-like API response (overrides allowed). */
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

// README test utilities

/** README constants used across tests. */
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

/** Creates a README with a weather section for testing. */
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

/** Returns true if content contains the weather section markers. */
export function validateReadmeWeatherSection(content: string): boolean {
  return (
    content.includes(README_TEST_CONSTANTS.WEATHER_SECTION_START) &&
    content.includes(README_TEST_CONSTANTS.WEATHER_SECTION_END)
  );
}

// API test utilities

/** Creates a mock fetch response. */
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

/** Cycles through provided responses; falls back to default when missing. */
export function createMockFetch(responses: Array<() => Response> = []) {
  let callCount = 0;

  return (
    _url: string | URL | Request,
    _init?: RequestInit
  ): Promise<Response> => {
    const responseIndex = callCount % responses.length;
    callCount += 1;

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

// Performance test utilities

/** Performance helpers for measuring and asserting durations. */
export const performanceTestUtils = {
  /** Measures execution time and classifies the duration. */
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

  /** Returns helpers to check and message against a single threshold. */
  createThresholdChecker: (threshold: number) =>
    ({
      check: (duration: number): boolean => duration <= threshold,
      message: (duration: number): string =>
        `Expected execution time ≤ ${threshold}ms, got ${duration.toFixed(2)}ms`,
      isWithinThreshold: (duration: number): duration is number =>
        duration <= threshold,
    }) as const,

  /** Compares a duration against a set of thresholds. */
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

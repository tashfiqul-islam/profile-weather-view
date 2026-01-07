/**
 * Weather data fetching service for Open-Meteo API.
 * Fetches current conditions and shapes a minimal payload for README updates.
 *
 * @module fetch-weather
 * @since 1.0.0
 * @see https://open-meteo.com/en/docs
 */

import { Temporal } from "@js-temporal/polyfill";
import { z } from "zod";
import type { MeteoconIconName } from "./wmo-mapper";
import { wmoToMeteocons } from "./wmo-mapper";

export type { MeteoconIconName } from "./wmo-mapper";

// ============================================================================
// Configuration
// ============================================================================

/** Geographic location for weather queries */
interface LocationConfig {
  readonly lat: number;
  readonly lon: number;
  readonly timezone: string;
}

/** Open-Meteo API configuration */
interface ApiConfig {
  readonly baseUrl: string;
  readonly queryParams: Readonly<Record<string, string>>;
}

const LOCATION = {
  lat: 23.8759,
  lon: 90.3795,
  timezone: "Asia/Dhaka",
} as const satisfies LocationConfig;

const OPEN_METEO_CONFIG = {
  baseUrl: "https://api.open-meteo.com/v1/forecast",
  queryParams: {
    latitude: LOCATION.lat.toString(),
    longitude: LOCATION.lon.toString(),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "weather_code",
      "is_day",
    ].join(","),
    daily: ["sunrise", "sunset"].join(","),
    timezone: LOCATION.timezone,
    timeformat: "unixtime",
  },
} as const satisfies ApiConfig;

// ============================================================================
// Type Definitions
// ============================================================================

/** Branded type for temperature values in Celsius */
export type TemperatureCelsius = number & { readonly __brand: unique symbol };

/** Branded type for humidity percentages (0-100) */
export type HumidityPercentage = number & { readonly __brand: unique symbol };

/** Branded type for formatted time strings (HH:MM) */
export type TimeString = string & { readonly __brand: unique symbol };

/**
 * Minimal payload for README weather updates.
 * Decoupled from raw API shape for stability.
 */
export interface WeatherUpdatePayload {
  readonly description: string;
  readonly temperatureC: TemperatureCelsius;
  readonly sunriseLocal: TimeString;
  readonly sunsetLocal: TimeString;
  readonly humidityPct: HumidityPercentage;
  readonly icon: MeteoconIconName;
}

// ============================================================================
// Schemas
// ============================================================================

/** Schema for validated internal weather data */
const ProcessedWeatherSchema = z.object({
  temperature: z.number().describe("Current temperature in Celsius"),
  humidity: z.number().min(0).max(100).describe("Relative humidity percentage"),
  weatherCode: z.number().int().describe("WMO weather interpretation code"),
  isDay: z.boolean().describe("Whether it's currently daytime"),
  sunrise: z.date().describe("Today's sunrise time"),
  sunset: z.date().describe("Today's sunset time"),
});

type ProcessedWeather = z.infer<typeof ProcessedWeatherSchema>;

/** Schema for Open-Meteo API response validation */
const OpenMeteoResponseSchema = z.object({
  current: z.object({
    temperature_2m: z.number(),
    relative_humidity_2m: z.number(),
    weather_code: z.number(),
    is_day: z.number(),
  }),
  daily: z.object({
    sunrise: z.array(z.number()).min(1),
    sunset: z.array(z.number()).min(1),
  }),
  utc_offset_seconds: z.number(),
});

// ============================================================================
// Utilities
// ============================================================================

/**
 * Formats a Date to HH:mm in Asia/Dhaka timezone.
 * Uses Temporal for precise timezone handling.
 */
function formatTimeInDhaka(date: Date): TimeString {
  const instant = Temporal.Instant.fromEpochMilliseconds(date.getTime());
  const dhakaTime = instant.toZonedDateTimeISO(LOCATION.timezone);

  return dhakaTime.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }) as TimeString;
}

/** Rounds temperature for compact display */
function formatTemperature(temp: number): TemperatureCelsius {
  return Math.round(temp) as TemperatureCelsius;
}

/**
 * Safely extracts the first element from an array.
 * Throws if the array is empty.
 *
 * @throws Error if array is empty
 */
export function getFirstElement<T>(arr: readonly T[], fieldName: string): T {
  const first = arr[0];
  if (first === undefined) {
    throw new Error(`Missing ${fieldName} data in API response`);
  }
  return first;
}

/** Validates processed weather data against schema */
function validateProcessedData(data: unknown): ProcessedWeather {
  const result = ProcessedWeatherSchema.safeParse(data);

  if (!result.success) {
    const errorMessages = result.error.issues
      .map((issue) => {
        const path = issue.path.length > 0 ? ` at ${issue.path.join(".")}` : "";
        return `${issue.message}${path}`;
      })
      .join("; ");

    throw new Error(`Weather data validation failed: ${errorMessages}`);
  }

  return result.data;
}

/**
 * Measures execution time of an async operation.
 * Returns result and duration in milliseconds.
 */
async function measureTime<T>(
  operation: () => Promise<T>
): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  const result = await operation();
  return { result, durationMs: performance.now() - start };
}

// ============================================================================
// Main Export
// ============================================================================

/**
 * Fetches current weather from Open-Meteo and returns a minimal payload.
 *
 * Features:
 * - Native fetch with JSON parsing
 * - Zod schema validation for API responses
 * - WMO weather codes mapped to Meteocons icons
 * - Temporal-based timezone handling
 *
 * @returns Weather data payload for README updates
 * @throws Error if API request fails or validation fails
 *
 * @example
 * ```ts
 * const weather = await fetchWeatherData();
 * console.log(weather.description); // "Clear Sky"
 * ```
 */
export async function fetchWeatherData(): Promise<WeatherUpdatePayload> {
  const url = new URL(OPEN_METEO_CONFIG.baseUrl);
  for (const [key, value] of Object.entries(OPEN_METEO_CONFIG.queryParams)) {
    url.searchParams.append(key, value);
  }

  const { result: response, durationMs } = await measureTime(() =>
    fetch(url.toString())
  );

  if (!response.ok) {
    throw new Error(
      `[fetch-weather] Open-Meteo API failed: ${response.status} ${response.statusText}`
    );
  }

  const rawData: unknown = await response.json();
  console.log(
    `✅ Open-Meteo API request completed in ${durationMs.toFixed(2)}ms`
  );

  const apiResult = OpenMeteoResponseSchema.safeParse(rawData);
  if (!apiResult.success) {
    throw new Error(
      "[fetch-weather] Invalid API response: missing required fields"
    );
  }

  const { current, daily } = apiResult.data;
  const sunriseTimestamp = getFirstElement(daily.sunrise, "sunrise") * 1000;
  const sunsetTimestamp = getFirstElement(daily.sunset, "sunset") * 1000;

  const processedData = validateProcessedData({
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    weatherCode: Math.round(current.weather_code),
    isDay: current.is_day === 1,
    sunrise: new Date(sunriseTimestamp),
    sunset: new Date(sunsetTimestamp),
  });

  const meteoconIcon = wmoToMeteocons(
    processedData.weatherCode,
    processedData.isDay
  );

  const payload: WeatherUpdatePayload = {
    description: meteoconIcon.description,
    temperatureC: formatTemperature(processedData.temperature),
    sunriseLocal: formatTimeInDhaka(processedData.sunrise),
    sunsetLocal: formatTimeInDhaka(processedData.sunset),
    humidityPct: Math.round(processedData.humidity) as HumidityPercentage,
    icon: meteoconIcon.name,
  };

  console.log(
    `🌤️ Weather: ${payload.description}, ${payload.temperatureC}°C, ` +
      `Humidity: ${payload.humidityPct}%, Icon: ${payload.icon}`
  );

  return payload;
}

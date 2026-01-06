import "dotenv/config";
import { Temporal } from "@js-temporal/polyfill";
// biome-ignore lint/performance/noNamespaceImport: Zod requires namespace import for proper tree shaking
import * as z from "zod";
import type { MeteoconIconName } from "./wmo-mapper";
import { wmoToMeteocons } from "./wmo-mapper";

export type { MeteoconIconName } from "./wmo-mapper";

/**
 * Fetches current weather and shapes a minimal payload for README updates.
 * Uses native fetch with JSON response for precision and simplicity.
 *
 * @see https://open-meteo.com/en/docs
 */

const LOCATION = {
  lat: 23.8759,
  lon: 90.3795,
  timezone: "Asia/Dhaka",
} as const;

/**
 * Open-Meteo API configuration.
 * We request current conditions + daily sunrise/sunset.
 */
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
    timeformat: "unixtime", // Critical: Returns timestamps as seconds (Int64 safe in JSON)
  },
} as const;

// Branded types for type-safe values
export type TemperatureCelsius = number & { readonly __brand: unique symbol };
export type HumidityPercentage = number & { readonly __brand: unique symbol };
export type TimeString = string & { readonly __brand: unique symbol };

/**
 * Minimal payload used to update the README without coupling to raw API shape.
 * Uses Meteocons icon names for weather visualization.
 */
export interface WeatherUpdatePayload {
  readonly description: string;
  readonly temperatureC: TemperatureCelsius;
  readonly sunriseLocal: TimeString;
  readonly sunsetLocal: TimeString;
  readonly humidityPct: HumidityPercentage;
  readonly icon: MeteoconIconName;
}

/**
 * Zod schema for validating the processed weather data.
 * This validates our internal data structure, not the raw API response.
 */
const ProcessedWeatherSchema = z.object({
  temperature: z.number().describe("Current temperature in Celsius"),
  humidity: z.number().min(0).max(100).describe("Relative humidity percentage"),
  weatherCode: z.number().int().describe("WMO weather interpretation code"),
  isDay: z.boolean().describe("Whether it's currently daytime"),
  sunrise: z.date().describe("Today's sunrise time"),
  sunset: z.date().describe("Today's sunset time"),
});

type ProcessedWeather = z.infer<typeof ProcessedWeatherSchema>;

/**
 * Internal schema for the Open-Meteo JSON response.
 * This ensures strict runtime validation of the external API data.
 */
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

/**
 * Rounds temperature for compact display.
 * Units are added at render time.
 */
function formatTemperature(temp: number): TemperatureCelsius {
  return Math.round(temp) as TemperatureCelsius;
}

/**
 * Extracts the first element from an array, throwing if empty.
 * Used after schema validation to satisfy TypeScript's strict null checks.
 */
export function getFirstElement<T>(arr: readonly T[], fieldName: string): T {
  const first = arr[0];
  if (first === undefined) {
    throw new Error(`Missing ${fieldName} data in API response`);
  }
  return first;
}

/**
 * Validates processed weather data against our schema.
 */
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
 * Fetches current weather and returns a minimal payload for README updates.
 *
 * Features:
 * - Uses native fetch with JSON parsing
 * - Validates API response structure with Zod
 * - WMO weather codes mapped to Meteocons icons
 */
export async function fetchWeatherData(): Promise<WeatherUpdatePayload> {
  try {
    const startTime = performance.now();

    // Construct URL with query parameters
    const url = new URL(OPEN_METEO_CONFIG.baseUrl);
    for (const [key, value] of Object.entries(OPEN_METEO_CONFIG.queryParams)) {
      url.searchParams.append(key, value);
    }

    // Fetch weather data
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        `Open-Meteo API failed with status ${response.status}: ${response.statusText}`
      );
    }

    const rawData = await response.json();

    const duration = performance.now() - startTime;
    process.stdout.write(
      `✅ Open-Meteo API request completed in ${duration.toFixed(2)}ms\n`
    );

    // Validate structure of the external API response
    const apiResult = OpenMeteoResponseSchema.safeParse(rawData);
    if (!apiResult.success) {
      throw new Error(
        "Invalid API response structure: Missing required weather fields"
      );
    }

    const { current, daily } = apiResult.data;

    const sunriseTimestamp = getFirstElement(daily.sunrise, "sunrise") * 1000;
    const sunsetTimestamp = getFirstElement(daily.sunset, "sunset") * 1000;

    // Validate and type the processed data
    const processedData = validateProcessedData({
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      weatherCode: Math.round(current.weather_code),
      isDay: current.is_day === 1,
      sunrise: new Date(sunriseTimestamp),
      sunset: new Date(sunsetTimestamp),
    });

    // Map WMO weather code to Meteocons icon
    const meteoconIcon = wmoToMeteocons(
      processedData.weatherCode,
      processedData.isDay
    );

    // Build the final payload
    const payload: WeatherUpdatePayload = {
      description: meteoconIcon.description,
      temperatureC: formatTemperature(processedData.temperature),
      sunriseLocal: formatTimeInDhaka(processedData.sunrise),
      sunsetLocal: formatTimeInDhaka(processedData.sunset),
      humidityPct: Math.round(processedData.humidity) as HumidityPercentage,
      icon: meteoconIcon.name,
    };

    // Log success with weather summary
    process.stdout.write(
      `🌤️ Weather: ${payload.description}, ${payload.temperatureC}°C, ` +
        `Humidity: ${payload.humidityPct}%, Icon: ${payload.icon}\n`
    );

    return payload;
  } catch (error) {
    // Normalize all errors to Error instances with context
    if (error instanceof Error) {
      throw new Error(`[fetchWeather.ts] ❌ ${error.message}`);
    }

    // Defensive fallback for non-Error types
    throw new Error(
      `[fetchWeather.ts] ❌ Unexpected error during weather data fetch: ${String(
        error
      )}`
    );
  }
}

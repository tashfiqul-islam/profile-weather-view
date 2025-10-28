import "dotenv/config";
import { Temporal } from "@js-temporal/polyfill";
// biome-ignore lint/performance/noNamespaceImport: Zod requires namespace import for proper tree shaking
import * as z from "zod";

/**
 * Fetches current weather and shapes a minimal payload for README updates.
 * Comments focus on intent, constraints, and non-obvious choices.
 */

// Used to decide when not to retry (skip 4xx) vs retry (5xx/network)
const HTTP_STATUS_CODES = {
  CLIENT_ERROR_START: 400,
  SERVER_ERROR_START: 500,
} as const;

const TIME_CONSTANTS = {
  MILLISECONDS_PER_SECOND: 1000,
} as const;

const LOCATION = {
  lat: "23.8759",
  lon: "90.3795",
} as const;

// Request only what we need to keep payloads small and responses fast
const API_CONFIG = {
  baseUrl: "https://api.openweathermap.org/data/3.0/onecall",
  units: "metric",
  timeout: 8000, // Reduced timeout for faster failure detection
  retries: 2, // Reduced retries for faster overall execution
  retryDelay: 500, // Reduced delay for faster retries
  exclude: "minutely,hourly,daily,alerts", // Only fetch current weather
} as const;

// Validates each weather condition entry returned by the API
const WeatherConditionSchema = z.object({
  id: z.int32().describe("Weather condition ID from OpenWeather API"),
  main: z.string().optional().describe("Main weather condition"),
  description: z.string().describe("Detailed weather description"),
  icon: z.string().optional().describe("Weather icon code"),
});

const CurrentWeatherSchema = z.object({
  dt: z.number().describe("Current time, Unix, UTC"),
  sunrise: z.number().describe("Sunrise time, Unix, UTC"),
  sunset: z.number().describe("Sunset time, Unix, UTC"),
  temp: z.float64().describe("Temperature"),
  feels_like: z.float64().describe("Human perception of weather"),
  pressure: z.int32().describe("Atmospheric pressure on the sea level"),
  humidity: z.int32().describe("Humidity, %"),
  dew_point: z
    .float64()
    .describe(
      "Atmospheric temperature below which water droplets begin to condense"
    ),
  uvi: z.float64().describe("Current UV index"),
  clouds: z.int32().describe("Cloudiness, %"),
  visibility: z.int32().describe("Average visibility, metres"),
  wind_speed: z.float64().describe("Wind speed"),
  wind_deg: z.int32().describe("Wind direction, degrees"),
  weather: z
    .tuple([WeatherConditionSchema])
    .rest(WeatherConditionSchema)
    .describe("Weather conditions"),
});

const WeatherSchema = z.object({
  lat: z.float64(),
  lon: z.float64(),
  timezone: z.string(),
  timezone_offset: z.int32(),
  current: CurrentWeatherSchema,
});

type WeatherData = z.infer<typeof WeatherSchema>;

export type TemperatureCelsius = number & { readonly __brand: unique symbol };

export type HumidityPercentage = number & { readonly __brand: unique symbol };

export type TimeString = string & { readonly __brand: unique symbol };

/**
 * Minimal payload used to update the README without coupling to raw API shape.
 */
export type WeatherUpdatePayload = {
  readonly description: string;
  readonly temperatureC: TemperatureCelsius;
  readonly sunriseLocal: TimeString;
  readonly sunsetLocal: TimeString;
  readonly humidityPct: HumidityPercentage;
  readonly icon: string;
};

// Lightweight shape for errors that carry HTTP response info
type HttpError = Error & {
  readonly response: {
    readonly status: number;
    readonly statusText: string;
  };
};

/** Title-cases a sentence for user-facing display. */
function toTitleCase(str: string): string {
  if (!str) {
    return str;
  }

  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Narrows to a non-empty string; avoids empty env and headers. */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * Retries an async operation with exponential backoff.
 * Skips retries for client errors (4xx) to fail fast on bad requests.
 */
function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = API_CONFIG.retries,
  baseDelay: number = API_CONFIG.retryDelay
): Promise<T> {
  const attemptRetry = async (attempt: number): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      const lastError =
        error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Do not retry on client errors (4xx)
      if (
        isHttpError(error) &&
        error.response.status >= HTTP_STATUS_CODES.CLIENT_ERROR_START &&
        error.response.status < HTTP_STATUS_CODES.SERVER_ERROR_START
      ) {
        throw lastError;
      }

      const delay = baseDelay * 2 ** attempt;
      process.stdout.write(
        `⚠️ Retry attempt ${attempt + 1}/${maxRetries} in ${delay}ms...\n`
      );

      await new Promise<void>((resolve) => {
        setTimeout(resolve, delay);
      });

      return attemptRetry(attempt + 1);
    }
  };

  return attemptRetry(0);
}

/** Determines whether an error carries HTTP status context. */
function isHttpError(error: unknown): error is HttpError {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const maybe = error as { response?: unknown };
  const response = maybe.response as
    | { status?: unknown; statusText?: unknown }
    | undefined;
  return (
    typeof response?.status === "number" &&
    typeof response?.statusText === "string"
  );
}

/** Formats epoch seconds to HH:mm in Asia/Dhaka for consistent display. */
function convertToDhakaTime(timestamp: number): TimeString {
  const instant = Temporal.Instant.fromEpochMilliseconds(
    timestamp * TIME_CONSTANTS.MILLISECONDS_PER_SECOND
  );
  const dhakaTime = instant.toZonedDateTimeISO("Asia/Dhaka");

  return dhakaTime.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }) as TimeString;
}

/** Rounds temperature for compact display; units are added at render time. */
function formatTemperature(temp: number): TemperatureCelsius {
  return Math.round(temp) as TemperatureCelsius;
}

/** Validates API response and aggregates issues into a readable error. */
function validateWeatherData(data: unknown): WeatherData {
  const result = WeatherSchema.safeParse(data);

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
 * Requires OPEN_WEATHER_KEY; retries on transient failures; no retries on 4xx.
 */
export async function fetchWeatherData(): Promise<WeatherUpdatePayload> {
  try {
    const apiKey = process.env["OPEN_WEATHER_KEY"]?.trim();
    if (!isNonEmptyString(apiKey)) {
      throw new Error("OpenWeather API key is required");
    }

    // Build a minimal request targeting only current conditions
    const url = new URL(API_CONFIG.baseUrl);
    url.searchParams.set("lat", LOCATION.lat);
    url.searchParams.set("lon", LOCATION.lon);
    url.searchParams.set("appid", apiKey);
    url.searchParams.set("units", API_CONFIG.units);
    url.searchParams.set("exclude", API_CONFIG.exclude); // only current weather

    // Perform the request with retry/backoff
    const response = await withRetry(async () => {
      const startTime = performance.now();

      const fetchResponse = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "Weather-Update-App/1.0",
        },
        signal: AbortSignal.timeout(API_CONFIG.timeout),
      });

      const duration = performance.now() - startTime;
      process.stdout.write(
        `✅ API request completed in ${duration.toFixed(2)}ms\n`
      );

      if (!fetchResponse.ok) {
        const errorText = await fetchResponse.text();
        const error = new Error(
          `OpenWeather API request failed: ${fetchResponse.status} ${fetchResponse.statusText} - ${errorText}`
        ) as Error & { response: { status: number; statusText: string } };
        // Attach status context so retry logic can decide properly
        error.response = {
          status: fetchResponse.status,
          statusText: fetchResponse.statusText,
        };
        throw error;
      }

      return fetchResponse;
    });

    const rawData = await response.json();

    // Validate and extract the fields we actually render
    const weatherData = validateWeatherData(rawData);
    const current = weatherData.current;

    // Extract display-friendly values with safe fallbacks
    const [firstCondition] = current.weather;
    const description = toTitleCase(firstCondition.description);
    const icon = firstCondition.icon ?? "01d";
    const temperatureC = formatTemperature(current.temp);
    const sunriseLocal = convertToDhakaTime(current.sunrise);
    const sunsetLocal = convertToDhakaTime(current.sunset);
    const humidityPct = current.humidity as HumidityPercentage;

    return {
      description,
      temperatureC,
      sunriseLocal,
      sunsetLocal,
      humidityPct,
      icon,
    } as const;
  } catch (error) {
    // All errors from withRetry are normalized to Error
    if (error instanceof Error) {
      throw new Error(`[fetchWeather.ts] ❌ ${error.message}`);
    }

    // Defensive fallback for non-Error types
    throw new Error(
      `[fetchWeather.ts] ❌ Unexpected error during weather data fetch: ${String(error)}`
    );
  }
}

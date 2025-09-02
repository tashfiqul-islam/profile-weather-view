import { Temporal } from "@js-temporal/polyfill";
import { z } from "zod";

// ================================
// 📊 Configuration Constants
// ================================

const HTTP_CLIENT_ERROR_START = 400;
const HTTP_SERVER_ERROR_START = 500;
const MILLISECONDS_PER_SECOND = 1000;

/**
 * Geographic coordinates for location tracking.
 * Using const assertions for better type inference
 */
const LOCATION = {
  lat: "23.8759",
  lon: "90.3795",
} as const;

/**
 * OpenWeather API configuration - optimized for current weather only
 */
const API_CONFIG = {
  baseUrl: "https://api.openweathermap.org/data/3.0/onecall",
  units: "metric",
  timeout: 8000, // Reduced timeout for faster failure detection
  retries: 2, // Reduced retries for faster overall execution
  retryDelay: 500, // Reduced delay for faster retries
  exclude: "minutely,hourly,daily,alerts", // Only fetch current weather
} as const;

/**
 * Weather condition schema - reusable across different weather arrays
 * Using Zod v4's optimized object definition with descriptions
 */
const WeatherConditionSchema = z.object({
  id: z.int32().describe("Weather condition ID from OpenWeather API"),
  main: z.string().optional().describe("Main weather condition"),
  description: z.string().describe("Detailed weather description"),
  icon: z.string().optional().describe("Weather icon code"),
});

/**
 * Current weather data schema validation using Zod v4
 */
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

/**
 * Simplified weather data schema - only current weather for faster parsing
 */
const WeatherSchema = z.object({
  lat: z.float64(),
  lon: z.float64(),
  timezone: z.string(),
  timezone_offset: z.int32(),
  current: CurrentWeatherSchema,
});

/**
 * Type definitions derived from Zod schemas
 */
type WeatherData = z.infer<typeof WeatherSchema>;

/**
 * A structured payload representing the data needed to update the README
 * Keeping this small ensures minimal coupling to the full API response.
 */
export type WeatherUpdatePayload = {
  description: string;
  temperatureC: number;
  sunriseLocal: string;
  sunsetLocal: string;
  humidityPct: number;
  icon: string;
};

/**
 * Converts a string to title case following JavaScript standards
 * Capitalizes the first letter of each word while preserving the rest
 * @param str The string to convert to title case
 * @returns The string in title case format
 */
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

/**
 * Implements exponential backoff retry logic using recursion
 * @param fn Function to retry
 * @param maxRetries Maximum number of retries
 * @param baseDelay Base delay between retries
 * @returns Promise with the result of the function
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

      // Don't retry on client errors (4xx)
      if (
        isHttpError(error) &&
        error.response.status >= HTTP_CLIENT_ERROR_START &&
        error.response.status < HTTP_SERVER_ERROR_START
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

/**
 * Narrow unknown to an HTTP-like error object produced in this module
 */
function isHttpError(
  error: unknown
): error is Error & { response: { status: number; statusText?: string } } {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const maybe = error as { response?: unknown };
  const response = maybe.response as { status?: unknown } | undefined;
  return typeof response?.status === "number";
}

/**
 * Converts Unix timestamp to Dhaka time using Temporal API
 * Following latest Temporal polyfill best practices
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted time string in Dhaka timezone
 */
function convertToDhakaTime(timestamp: number): string {
  const instant = Temporal.Instant.fromEpochMilliseconds(
    timestamp * MILLISECONDS_PER_SECOND
  );
  const dhakaTime = instant.toZonedDateTimeISO("Asia/Dhaka");

  return dhakaTime.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Formats temperature as a rounded numeric string without units
 * Units are appended at render time to avoid duplication
 * @param temp Temperature in Celsius
 * @returns Rounded temperature string without units
 */
function formatTemperature(temp: number): number {
  return Math.round(temp);
}

/**
 * Validates weather data using Zod with enhanced error reporting
 * @param data Raw data from API
 * @returns Validated weather data
 * @throws Error with detailed validation messages
 */
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
 * Fetches current weather data from OpenWeather API 3.0
 * Optimized for current weather only to reduce response time and data size
 *
 * @returns Formatted weather data string
 * @throws {Error} When API request fails or data is invalid
 */
export async function fetchWeatherData(): Promise<WeatherUpdatePayload> {
  try {
    const apiKey = Bun.env["OPEN_WEATHER_KEY"]?.trim();
    if (!apiKey) {
      throw new Error("OpenWeather API key is required");
    }

    // Construct URL with modern URLSearchParams - optimized for current weather only
    const url = new URL(API_CONFIG.baseUrl);
    url.searchParams.set("lat", LOCATION.lat);
    url.searchParams.set("lon", LOCATION.lon);
    url.searchParams.set("appid", apiKey);
    url.searchParams.set("units", API_CONFIG.units);
    url.searchParams.set("exclude", API_CONFIG.exclude); // Only fetch current weather

    // Fetch data with retry logic using Bun's optimized fetch
    const response = await withRetry(async () => {
      const startTime = performance.now(); // Use performance.now() for higher precision

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
        );
        // Add response property for retry logic
        (
          error as Error & { response?: { status: number; statusText: string } }
        ).response = {
          status: fetchResponse.status,
          statusText: fetchResponse.statusText,
        };
        throw error;
      }

      return fetchResponse;
    });

    const rawData = await response.json();

    // Validate response data
    const weatherData = validateWeatherData(rawData);
    const current = weatherData.current;

    // Extract weather information with safe fallbacks and proper capitalization
    const [firstCondition] = current.weather;
    const description = toTitleCase(firstCondition.description);
    const icon = firstCondition.icon ?? "01d";
    const temperatureC = formatTemperature(current.temp);
    const sunriseLocal = convertToDhakaTime(current.sunrise);
    const sunsetLocal = convertToDhakaTime(current.sunset);
    const humidityPct = current.humidity;

    return {
      description,
      temperatureC,
      sunriseLocal,
      sunsetLocal,
      humidityPct,
      icon,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`[fetchWeather.ts] ❌ ${error.message}`);
    }

    throw new Error(
      "[fetchWeather.ts] ❌ Unexpected error during weather data fetch"
    );
  }
}

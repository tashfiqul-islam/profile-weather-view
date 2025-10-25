/**
 * @fileoverview Modern TypeScript 5.9.3 README update service with strict typing
 * @version 2.2.2
 * @author Tashfiqul Islam
 */

import { join } from "node:path";
import { Temporal } from "@js-temporal/polyfill";
// biome-ignore lint/performance/noNamespaceImport: Zod requires namespace import for proper tree shaking
import * as z from "zod";
import type {
  HumidityPercentage,
  TemperatureCelsius,
  TimeString,
  WeatherUpdatePayload,
} from "./fetchWeather";

/**
 * Configuration constants with modern TypeScript 5.9.3 features
 * Uses const assertions and branded types for enhanced type safety
 */
const CONFIG = {
  timezone: "Asia/Dhaka" as const,
  defaultIcon: "01d" as const,
  defaultDescription: "Unknown" as const,
} as const;

/**
 * Top-level regex constants for better performance
 * Uses const assertions for immutable regex patterns
 */
const REGEX = {
  weatherSection:
    /<!-- Hourly Weather Update -->[\s\S]*?<!-- End of Hourly Weather Update -->/,
  refreshTime: /<em>Last refresh:.*?<\/em>/,
} as const;

/**
 * Zod v4 schema for environment variable parsing
 * Uses modern TypeScript 5.9.3 features with strict typing
 */
const EnvironmentSchema = z.object({
  FORCE_UPDATE: z.string().optional(),
  GITHUB_ACTIONS: z.string().optional(),
});

/**
 * Validation constants for weather data schema
 */
const VALIDATION_LIMITS = {
  MIN_STRING_LENGTH: 1,
  MIN_HUMIDITY: 0,
  MAX_HUMIDITY: 100,
} as const;

/**
 * Weather data validation schema with enhanced type safety
 * Uses modern TypeScript 5.9.3 features for strict validation
 */
const WeatherDataSchema = z.object({
  description: z
    .string()
    .min(VALIDATION_LIMITS.MIN_STRING_LENGTH)
    .describe("Weather description"),
  temperatureC: z.number().describe("Temperature in Celsius"),
  sunriseLocal: z
    .string()
    .min(VALIDATION_LIMITS.MIN_STRING_LENGTH)
    .describe("Sunrise time in local format"),
  sunsetLocal: z
    .string()
    .min(VALIDATION_LIMITS.MIN_STRING_LENGTH)
    .describe("Sunset time in local format"),
  humidityPct: z
    .number()
    .min(VALIDATION_LIMITS.MIN_HUMIDITY)
    .max(VALIDATION_LIMITS.MAX_HUMIDITY)
    .describe("Humidity percentage"),
  icon: z
    .string()
    .min(VALIDATION_LIMITS.MIN_STRING_LENGTH)
    .describe("Weather icon code"),
});

/**
 * Helper function to extract content from a regex match with null safety
 * Uses modern TypeScript 5.9.3 features with strict typing
 * @param content The content to search in
 * @param regex The regex pattern to search with
 * @returns The matched content or empty string
 */
export function getSectionContent(content: string, regex: RegExp): string {
  return regex.exec(content)?.[0] ?? "";
}

/**
 * Creates the formatted refresh time string using Temporal API
 * Following latest Temporal polyfill best practices
 * Uses modern TypeScript 5.9.3 features with strict typing
 * @returns Formatted refresh time string
 */
export function createRefreshTime(): string {
  const now = Temporal.Now.zonedDateTimeISO(CONFIG.timezone);

  const formattedTime = now.toLocaleString("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "long",
    second: "2-digit",
    weekday: "long",
    year: "numeric",
  });

  return `${formattedTime} (UTC+6)`;
}

/**
 * Handles the actual file update operation using Bun's optimized I/O
 * Uses modern TypeScript 5.9.3 features with strict typing
 * @param readmePath Path to the README file
 * @param updatedContent New content to write
 * @returns Promise<number> Number of bytes written
 */
export async function performFileUpdate(
  readmePath: string,
  updatedContent: string
): Promise<number> {
  return await Bun.write(readmePath, updatedContent);
}

/**
 * Validates weather data segments and extracts them
 * Uses modern TypeScript 5.9.3 features with branded types
 * @param weatherData The formatted weather data string
 * @returns Extracted weather segments or null if invalid
 */
function validateAndExtractWeatherData(
  weatherData: WeatherUpdatePayload
): WeatherUpdatePayload | null {
  const validationResult = WeatherDataSchema.safeParse(weatherData);
  if (!validationResult.success) {
    return null;
  }
  return {
    ...validationResult.data,
    temperatureC: validationResult.data.temperatureC as TemperatureCelsius,
    sunriseLocal: validationResult.data.sunriseLocal as TimeString,
    sunsetLocal: validationResult.data.sunsetLocal as TimeString,
    humidityPct: validationResult.data.humidityPct as HumidityPercentage,
  };
}

/**
 * Creates weather data in the appropriate format based on existing content
 * Uses modern TypeScript 5.9.3 features with strict typing and branded types
 * @param payload Weather data payload with branded types
 * @param currentSection Current weather section content
 * @returns Formatted weather data string
 */
export function createWeatherData(
  payload: WeatherUpdatePayload,
  currentSection: string
): string {
  const {
    description,
    temperatureC,
    sunriseLocal,
    sunsetLocal,
    humidityPct,
    icon,
  } = payload;

  // Format-agnostic approach: preserve existing structure and replace data points
  let updatedSection = currentSection;

  // Replace temperature values (e.g., "32°C", "28°C")
  updatedSection = updatedSection.replace(/\d+°C/g, `${temperatureC}°C`);

  // Replace humidity percentages (e.g., "65%", "83%")
  updatedSection = updatedSection.replace(/\d+%/g, `${humidityPct}%`);

  // Replace sunrise times (various formats: "05:34", "06:12:30")
  updatedSection = updatedSection.replace(
    /(Sunrise:?\s*)\d{1,2}:\d{2}(:\d{2})?/gi,
    `$1${sunriseLocal}`
  );

  // Replace sunset times (various formats: "18:31", "18:15:45")
  updatedSection = updatedSection.replace(
    /(Sunset:?\s*)\d{1,2}:\d{2}(:\d{2})?/gi,
    `$1${sunsetLocal}`
  );

  // Replace weather icons (preserve existing format but update icon code)
  updatedSection = updatedSection.replace(
    /openweathermap\.org\/img\/w\/\w+\.png/g,
    `openweathermap.org/img/w/${icon}.png`
  );

  // Replace weather description in image alt text
  updatedSection = updatedSection.replace(
    /alt="[^"]*icon"/g,
    `alt="${description} icon"`
  );

  // Replace weather description text (more complex - try to preserve position)
  // Look for common weather terms and replace them
  // Uses modern TypeScript 5.9.3 features with const assertions
  const weatherTerms = [
    "Clear Sky",
    "Clear",
    "Clouds",
    "Cloudy",
    "Overcast",
    "Rain",
    "Light Rain",
    "Moderate Rain",
    "Heavy Rain",
    "Snow",
    "Light Snow",
    "Heavy Snow",
    "Thunderstorm",
    "Mist",
    "Fog",
    "Haze",
    "Drizzle",
    "Sunny",
  ] as const;

  // Find and replace weather descriptions while preserving case and context
  for (const term of weatherTerms) {
    const regex = new RegExp(`\\b${term}\\b`, "gi");
    if (regex.test(updatedSection)) {
      updatedSection = updatedSection.replace(regex, description);
      break; // Only replace the first match to avoid over-replacement
    }
  }

  return updatedSection;
}

/**
 * Updates the README content with new weather data and refresh time
 * Uses modern TypeScript 5.9.3 features with strict typing
 * @param readmeContent Current README content
 * @param updatedWeatherData New weather data to insert
 * @param lastRefreshTime Formatted refresh time
 * @returns Updated content with refresh time
 */
export function updateReadmeContent(
  readmeContent: string,
  updatedWeatherData: string,
  lastRefreshTime: string
): string {
  const updatedContent = readmeContent.replace(
    REGEX.weatherSection,
    updatedWeatherData
  );

  if (REGEX.refreshTime.test(updatedContent)) {
    return updatedContent.replace(
      REGEX.refreshTime,
      `<em>Last refresh: ${lastRefreshTime}</em>`
    );
  }

  return updatedContent;
}

/**
 * Checks if update should proceed based on content changes and FORCE_UPDATE setting
 * Uses modern TypeScript 5.9.3 features with strict typing
 * @param oldContent Original content
 * @param updatedContent Updated content
 * @returns True if update should proceed, false otherwise
 */
export function shouldProceedWithUpdate(
  oldContent: string,
  updatedContent: string
): boolean {
  if (updatedContent !== oldContent) {
    return true;
  }

  // Use Zod v4 for better environment variable parsing
  const envResult = EnvironmentSchema.safeParse({
    FORCE_UPDATE: process.env["FORCE_UPDATE"],
    GITHUB_ACTIONS: process.env["GITHUB_ACTIONS"],
  });

  return Boolean(envResult.success && envResult.data.FORCE_UPDATE === "true");
}

/**
 * Updates the README file with new weather data.
 * Uses Bun's optimized file I/O and modern error handling.
 * Uses modern TypeScript 5.9.3 features with strict typing and branded types
 *
 * @param weatherData The formatted weather data string with branded types
 * @param customReadmePath Optional path to a README file in a different location
 * @returns Promise<boolean> True if update was successful, false otherwise
 */
export async function updateReadme(
  weatherData: WeatherUpdatePayload,
  customReadmePath?: string
): Promise<boolean> {
  const readmePath = customReadmePath ?? join(process.cwd(), "README.md");
  const readmeFile = Bun.file(readmePath);

  // Check if file exists using Bun's optimized file operations
  if (!(await readmeFile.exists())) {
    return false;
  }

  // Validate and extract weather data
  const validatedPayload = validateAndExtractWeatherData(weatherData);
  if (!validatedPayload) {
    return false;
  }

  const lastRefreshTime = createRefreshTime();

  // Read the file content using Bun's optimized text reading
  const readmeContent = await readmeFile.text();

  // Check if the weather section exists
  if (!REGEX.weatherSection.test(readmeContent)) {
    return false;
  }

  // Extract the current weather section to analyze its format
  const currentSection = getSectionContent(readmeContent, REGEX.weatherSection);

  // Create an updated weather section that matches the existing format
  const updatedWeatherData = createWeatherData(
    {
      description: validatedPayload.description || CONFIG.defaultDescription,
      temperatureC: validatedPayload.temperatureC,
      sunriseLocal: validatedPayload.sunriseLocal,
      sunsetLocal: validatedPayload.sunsetLocal,
      humidityPct: validatedPayload.humidityPct,
      icon: validatedPayload.icon || CONFIG.defaultIcon,
    },
    currentSection
  );

  // Update the content
  const oldContent = readmeContent;
  const updatedContent = updateReadmeContent(
    readmeContent,
    updatedWeatherData,
    lastRefreshTime
  );

  // Check if there are actually any changes to make
  if (!shouldProceedWithUpdate(oldContent, updatedContent)) {
    return false;
  }

  // Perform the file update
  await performFileUpdate(readmePath, updatedContent);

  return true;
}

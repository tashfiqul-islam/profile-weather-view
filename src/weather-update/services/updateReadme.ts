/**
 * Updates README weather section by validating payload,
 * preserving existing format, and writing only when content changes.
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

// Display and formatting defaults
const CONFIG = {
  timezone: "Asia/Dhaka" as const,
  defaultIcon: "01d" as const,
  defaultDescription: "Unknown" as const,
} as const;

// Markers and fields we replace inside README
const REGEX = {
  weatherSection:
    /<!-- Hourly Weather Update -->[\s\S]*?<!-- End of Hourly Weather Update -->/,
  refreshTime: /<em>Last refresh:.*?<\/em>/,
} as const;

// Narrow env flags we care about for control flow
const EnvironmentSchema = z.object({
  FORCE_UPDATE: z.string().optional(),
  GITHUB_ACTIONS: z.string().optional(),
});

// Input boundaries for simple payload validation
const VALIDATION_LIMITS = {
  MIN_STRING_LENGTH: 1,
  MIN_HUMIDITY: 0,
  MAX_HUMIDITY: 100,
} as const;

// Validates the minimal payload consumed by README rendering
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

/** Extracts the first match or returns empty string. */
export function getSectionContent(content: string, regex: RegExp): string {
  return regex.exec(content)?.[0] ?? "";
}

/** Returns a human-readable refresh timestamp for the configured timezone. */
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

/** Writes updated README content to disk. */
export async function performFileUpdate(
  readmePath: string,
  updatedContent: string
): Promise<number> {
  return await Bun.write(readmePath, updatedContent);
}

/** Validates payload; returns normalized payload or null if invalid. */
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
 * Produces an updated weather section while preserving existing structure.
 * Replaces only known tokens to avoid layout drift.
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

  // Preserve structure; replace only values
  let updatedSection = currentSection;

  // Temperature (e.g., "32°C")
  updatedSection = updatedSection.replace(/\d+°C/g, `${temperatureC}°C`);

  // Humidity percentage
  updatedSection = updatedSection.replace(/\d+%/g, `${humidityPct}%`);

  // Sunrise time (supports HH:mm and HH:mm:ss)
  updatedSection = updatedSection.replace(
    /(Sunrise:?\s*)\d{1,2}:\d{2}(:\d{2})?/gi,
    `$1${sunriseLocal}`
  );

  // Sunset time (supports HH:mm and HH:mm:ss)
  updatedSection = updatedSection.replace(
    /(Sunset:?\s*)\d{1,2}:\d{2}(:\d{2})?/gi,
    `$1${sunsetLocal}`
  );

  // Icon code inside image URL
  updatedSection = updatedSection.replace(
    /openweathermap\.org\/img\/w\/\w+\.png/g,
    `openweathermap.org/img/w/${icon}.png`
  );

  // Description inside alt text
  updatedSection = updatedSection.replace(
    /alt="[^"]*icon"/g,
    `alt="${description} icon"`
  );

  // Replace a known weather term in free text, if present
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

  for (const term of weatherTerms) {
    const regex = new RegExp(`\\b${term}\\b`, "gi");
    if (regex.test(updatedSection)) {
      updatedSection = updatedSection.replace(regex, description);
      break; // Only replace the first match to avoid over-replacement
    }
  }

  return updatedSection;
}

/** Inserts the updated section and refresh timestamp into README content. */
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
 * Returns true when content changed, or FORCE_UPDATE=true is set.
 * Avoids unnecessary writes in CI and local runs.
 */
export function shouldProceedWithUpdate(
  oldContent: string,
  updatedContent: string
): boolean {
  if (updatedContent !== oldContent) {
    return true;
  }

  // Parse env flags safely (undefined tolerated)
  const envResult = EnvironmentSchema.safeParse({
    FORCE_UPDATE: process.env["FORCE_UPDATE"],
    GITHUB_ACTIONS: process.env["GITHUB_ACTIONS"],
  });

  return Boolean(envResult.success && envResult.data.FORCE_UPDATE === "true");
}

/**
 * Reads README, applies replacements, and writes back if needed.
 * Returns false when the file is missing, data is invalid, or nothing changed.
 */
export async function updateReadme(
  weatherData: WeatherUpdatePayload,
  customReadmePath?: string
): Promise<boolean> {
  const readmePath = customReadmePath ?? join(process.cwd(), "README.md");
  const readmeFile = Bun.file(readmePath);

  // Ensure the file exists before proceeding
  if (!(await readmeFile.exists())) {
    return false;
  }

  // Validate input payload
  const validatedPayload = validateAndExtractWeatherData(weatherData);
  if (!validatedPayload) {
    return false;
  }

  const lastRefreshTime = createRefreshTime();

  // Read the file content
  const readmeContent = await readmeFile.text();

  // Ensure the weather section markers exist
  if (!REGEX.weatherSection.test(readmeContent)) {
    return false;
  }

  // Extract the current weather section to analyze its format
  const currentSection = getSectionContent(readmeContent, REGEX.weatherSection);

  // Create an updated weather section that matches the existing format
  const updatedWeatherData = createWeatherData(
    {
      description: validatedPayload.description,
      temperatureC: validatedPayload.temperatureC,
      sunriseLocal: validatedPayload.sunriseLocal,
      sunsetLocal: validatedPayload.sunsetLocal,
      humidityPct: validatedPayload.humidityPct,
      icon: validatedPayload.icon,
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

  // Skip write if content is unchanged and FORCE_UPDATE is not set
  if (!shouldProceedWithUpdate(oldContent, updatedContent)) {
    return false;
  }

  // Perform the file update
  await performFileUpdate(readmePath, updatedContent);

  return true;
}

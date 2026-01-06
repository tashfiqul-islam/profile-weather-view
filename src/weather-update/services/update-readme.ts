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
} from "./fetch-weather";
import { getMeteoconUrl, type MeteoconIconName } from "./wmo-mapper";

// Display and formatting defaults
const CONFIG = {
  timezone: "Asia/Dhaka" as const,
  defaultIcon: "clear-day" as const, // Meteocons default icon
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
    .describe("Meteocons icon name"),
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
    icon: validationResult.data.icon as MeteoconIconName,
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

  const meteoconUrl = getMeteoconUrl(icon);

  // Construct the new data row
  // Format: | <Icon> <Desc> | <Temp> | <Sunrise> | <Sunset> | <Humidity> |
  // Note: We use HTML img tag to control size (height="17" matches standard text line height)
  // and vertical alignment to center it with the text.
  const iconImage = `<img src="${meteoconUrl}" alt="${description} icon" height="17" style="vertical-align: middle;">`;
  const weatherCell = `${iconImage} ${description}`;
  const newRow = `| ${weatherCell} | ${temperatureC}°C | ${sunriseLocal} | ${sunsetLocal} | ${humidityPct}% |`;

  // Regex to find the data row in the table
  // Looks for a line starting with | that doesn't contain "Weather" (header) or "---" (separator)
  const lines = currentSection.split("\n");
  const updatedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (
      trimmed.startsWith("|") &&
      !trimmed.includes("| Weather") &&
      !trimmed.includes("|---")
    ) {
      return newRow;
    }
    return line;
  });

  return updatedLines.join("\n");
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

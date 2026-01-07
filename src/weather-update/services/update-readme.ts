/**
 * README update service for weather data.
 * Detects and updates weather sections in both Markdown and HTML table formats.
 *
 * @module update-readme
 * @since 1.0.0
 */

import { Temporal } from "@js-temporal/polyfill";
import { z } from "zod";
import type { WeatherUpdatePayload } from "./fetch-weather";
import { getMeteoconUrl } from "./wmo-mapper";

// ============================================================================
// Configuration
// ============================================================================

/** Timezone for displaying refresh timestamps */
const DISPLAY_TIMEZONE = "Asia/Dhaka" as const;

/** Default README file path */
const DEFAULT_README_PATH = "README.md" as const;

// ============================================================================
// Schemas
// ============================================================================

/** Schema for environment variables used in README updates */
const EnvironmentSchema = z.object({
  FORCE_UPDATE: z.string().optional(),
  GITHUB_ACTIONS: z.string().optional(),
});

/** Schema for validating weather data before rendering */
const WeatherDataSchema = z.object({
  description: z.string().min(1).describe("Weather condition description"),
  temperatureC: z.number().describe("Temperature in Celsius"),
  sunriseLocal: z.string().min(1).describe("Local sunrise time"),
  sunsetLocal: z.string().min(1).describe("Local sunset time"),
  humidityPct: z.number().min(0).max(100).describe("Humidity percentage"),
  icon: z.string().min(1).describe("Meteocons icon name"),
});

// ============================================================================
// Regex Patterns
// ============================================================================

/** Matches the entire weather section including markers */
const WEATHER_SECTION_REGEX =
  /<!-- Hourly Weather Update -->[\s\S]*?<!-- End of Hourly Weather Update -->/;

/** Matches the refresh time element */
const REFRESH_TIME_REGEX = /<em>Last refresh:.*?<\/em>/;

// ============================================================================
// Public API
// ============================================================================

/**
 * Updates the README file with new weather data.
 * Automatically detects Markdown or HTML table format.
 *
 * @param weatherData - Validated weather payload
 * @param customReadmePath - Optional custom README path
 * @returns true if update was made, false if skipped
 */
export async function updateReadme(
  weatherData: WeatherUpdatePayload,
  customReadmePath?: string
): Promise<boolean> {
  const readmePath = customReadmePath ?? DEFAULT_README_PATH;
  const file = Bun.file(readmePath);

  const exists = await file.exists();
  if (!exists) {
    process.stderr.write(`❌ README not found at: ${readmePath}\n`);
    return false;
  }

  const oldContent = await file.text();
  const currentSection = getSectionContent(oldContent, WEATHER_SECTION_REGEX);

  if (!currentSection) {
    process.stderr.write("❌ Weather section markers not found in README\n");
    return false;
  }

  if (!validateWeatherPayload(weatherData)) {
    process.stderr.write("❌ Weather data validation failed\n");
    return false;
  }

  const updatedSection = createWeatherData(weatherData, currentSection);
  const refreshTime = createRefreshTime();
  const updatedContent = updateReadmeContent(
    oldContent,
    updatedSection,
    refreshTime
  );

  if (!shouldProceedWithUpdate(oldContent, updatedContent)) {
    return false;
  }

  await performFileUpdate(readmePath, updatedContent);
  return true;
}

/**
 * Validates weather payload against schema.
 * Returns true if valid, false otherwise.
 */
function validateWeatherPayload(data: WeatherUpdatePayload): boolean {
  const result = WeatherDataSchema.safeParse(data);
  return result.success;
}

/**
 * Produces an updated weather section while preserving existing structure.
 * Supports both Markdown pipe-tables and HTML table formats (auto-detected).
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

  // Auto-detect format: HTML table uses <td> tags
  const isHtmlTable = currentSection.includes("<td");

  if (isHtmlTable) {
    return updateHtmlTableCells(currentSection, {
      description,
      temperatureC,
      sunriseLocal,
      sunsetLocal,
      humidityPct,
      iconUrl: meteoconUrl,
    });
  }

  // Markdown pipe-table format
  const iconImage = `<img src="${meteoconUrl}" alt="${description} icon" height="17" style="vertical-align: middle;">`;
  const weatherCell = `${iconImage} ${description}`;
  const newRow = `| ${weatherCell} | ${temperatureC}°C | ${sunriseLocal} | ${sunsetLocal} | ${humidityPct}% |`;

  const lines = currentSection.split("\n");
  const updatedLines = lines.map((line) => {
    const trimmed = line.trim();
    const isDataRow =
      trimmed.startsWith("|") &&
      !trimmed.includes("| Weather") &&
      !trimmed.includes("|---");

    return isDataRow ? newRow : line;
  });

  return updatedLines.join("\n");
}

/** Cell data for HTML table updates */
interface HtmlCellData {
  readonly description: string;
  readonly temperatureC: number;
  readonly sunriseLocal: string;
  readonly sunsetLocal: string;
  readonly humidityPct: number;
  readonly iconUrl: string;
}

/**
 * Updates HTML table cells with new weather data.
 * Preserves existing HTML structure and attributes.
 */
function updateHtmlTableCells(section: string, data: HtmlCellData): string {
  const tdPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  const matches = [...section.matchAll(tdPattern)];

  if (matches.length < 5) {
    return section;
  }

  const iconImg = `<img width="15" src="${data.iconUrl}" alt="${data.description} icon">`;
  const cellReplacements = [
    `${data.description} ${iconImg}`,
    `${data.temperatureC}°C`,
    data.sunriseLocal,
    data.sunsetLocal,
    `${data.humidityPct}%`,
  ] as const;

  let cellIndex = 0;
  return section.replace(
    /<td([^>]*)>([\s\S]*?)<\/td>/gi,
    (match, attrs: string) => {
      if (cellIndex < cellReplacements.length) {
        const replacement = cellReplacements[cellIndex];
        cellIndex++;
        return `<td${attrs}>${replacement}</td>`;
      }
      return match;
    }
  );
}

/**
 * Creates a formatted refresh timestamp in Asia/Dhaka timezone.
 *
 * @returns Formatted date string like "Thursday, January 08, 2026 at 02:12:16 (UTC+6)"
 */
export function createRefreshTime(): string {
  const now = Temporal.Now.zonedDateTimeISO(DISPLAY_TIMEZONE);

  const formatted = now.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return `${formatted} (UTC+6)`;
}

/**
 * Extracts content matching a regex pattern.
 *
 * @param content - Source content to search
 * @param regex - Pattern to match
 * @returns Matched content or empty string
 */
export function getSectionContent(content: string, regex: RegExp): string {
  const match = content.match(regex);
  return match?.[0] ?? "";
}

/**
 * Inserts the updated section and refresh timestamp into README content.
 */
export function updateReadmeContent(
  readmeContent: string,
  updatedWeatherSection: string,
  refreshTime: string
): string {
  let result = readmeContent.replace(
    WEATHER_SECTION_REGEX,
    updatedWeatherSection
  );
  result = result.replace(
    REFRESH_TIME_REGEX,
    `<em>Last refresh: ${refreshTime}</em>`
  );
  return result;
}

/**
 * Determines whether to proceed with the file update.
 * Returns true if content changed or FORCE_UPDATE is set.
 */
export function shouldProceedWithUpdate(
  oldContent: string,
  updatedContent: string
): boolean {
  const envResult = EnvironmentSchema.safeParse({
    FORCE_UPDATE: Bun.env["FORCE_UPDATE"],
    GITHUB_ACTIONS: Bun.env["GITHUB_ACTIONS"],
  });

  const forceUpdate =
    envResult.success && envResult.data.FORCE_UPDATE === "true";
  const hasChanges = oldContent !== updatedContent;

  return hasChanges || forceUpdate;
}

/**
 * Writes updated content to the README file.
 *
 * @returns Number of bytes written
 */
export async function performFileUpdate(
  readmePath: string,
  content: string
): Promise<number> {
  const bytesWritten = await Bun.write(readmePath, content);
  return bytesWritten;
}

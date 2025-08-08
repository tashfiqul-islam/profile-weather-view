import { join } from 'node:path';
import { Temporal } from '@js-temporal/polyfill';
import { z } from 'zod';
import type { WeatherUpdatePayload } from './fetchWeather';

/**
 * Configuration constants using const assertions
 */
const CONFIG = {
  timezone: 'Asia/Dhaka',
  defaultIcon: '01d',
  defaultDescription: 'Unknown',
} as const;

/**
 * Top-level regex constants for better performance
 */
const REGEX = {
  weatherSection:
    /<!-- Hourly Weather Update -->[\s\S]*?<!-- End of Hourly Weather Update -->/,
  refreshTime: /<em>Last refresh:.*?<\/em>/,
} as const;

/**
 * Zod v4 schema for environment variable parsing
 */
const EnvironmentSchema = z.object({
  FORCE_UPDATE: z.string().optional(),
  GITHUB_ACTIONS: z.string().optional(),
});

/**
 * Weather data validation schema
 */
const WeatherDataSchema = z.object({
  description: z.string(),
  temperatureC: z.number(),
  sunriseLocal: z.string(),
  sunsetLocal: z.string(),
  humidityPct: z.number(),
  icon: z.string(),
});

/**
 * Helper function to extract content from a regex match with null safety
 * @param content The content to search in
 * @param regex The regex pattern to search with
 * @returns The matched content or empty string
 */
export function getSectionContent(content: string, regex: RegExp): string {
  return regex.exec(content)?.[0] ?? '';
}

/**
 * Creates the formatted refresh time string using Temporal API
 * Following latest Temporal polyfill best practices
 * @returns Formatted refresh time string
 */
export function createRefreshTime(): string {
  const now = Temporal.Now.zonedDateTimeISO(CONFIG.timezone);

  const formattedTime = now.toLocaleString('en-US', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: 'long',
    second: '2-digit',
    weekday: 'long',
    year: 'numeric',
  });

  return `${formattedTime} (UTC+6)`;
}

/**
 * Handles the actual file update operation using Bun's optimized I/O
 * @param readmePath Path to the README file
 * @param updatedContent New content to write
 * @returns Promise<boolean> True if successful
 */
async function performFileUpdate(
  readmePath: string,
  updatedContent: string
): Promise<boolean> {
  try {
    await Bun.write(readmePath, updatedContent);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates weather data segments and extracts them
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
  return validationResult.data;
}

/**
 * Creates weather data in the appropriate format based on existing content
 * @param description Weather description
 * @param temperature Temperature value
 * @param sunrise Sunrise time
 * @param sunset Sunset time
 * @param humidity Humidity percentage
 * @param icon Weather icon code
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
  if (currentSection.includes('<td')) {
    return `<!-- Hourly Weather Update -->
        <td align="center">${description} <img width="15" src="https://openweathermap.org/img/w/${icon}.png" alt="${description} icon"></td>
        <td align="center">${temperatureC}°C</td>
        <td align="center">${sunriseLocal}</td>
        <td align="center">${sunsetLocal}</td>
        <td align="center">${humidityPct}%</td>
        <!-- End of Hourly Weather Update -->`;
  }

  if (currentSection.includes('<div')) {
    return `<!-- Hourly Weather Update -->
<div style="text-align: center;">
  <img src="https://openweathermap.org/img/wn/${icon}@2x.png" style="width: 100px;" alt="${description} icon">
  <h3>${temperatureC}°C | ${description}</h3>
  <p>Sunrise: ${sunriseLocal} | Sunset: ${sunsetLocal} | Humidity: ${humidityPct}%</p>
</div>
<!-- End of Hourly Weather Update -->`;
  }

  return `<!-- Hourly Weather Update -->
${description} <img width="15" src="https://openweathermap.org/img/w/${icon}.png" alt="${description} icon">
${temperatureC}°C
Sunrise: ${sunriseLocal}
Sunset: ${sunsetLocal}
Humidity: ${humidityPct}%
<!-- End of Hourly Weather Update -->`;
}

/**
 * Updates the README content with new weather data and refresh time
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
    FORCE_UPDATE: process.env['FORCE_UPDATE'],
    GITHUB_ACTIONS: process.env['GITHUB_ACTIONS'],
  });

  return !!(envResult.success && envResult.data.FORCE_UPDATE === 'true');
}

/**
 * Updates the README file with new weather data.
 * Uses Bun's optimized file I/O and modern error handling.
 *
 * @param weatherData The formatted weather data string
 * @param customReadmePath Optional path to a README file in a different location
 * @returns Promise<boolean> True if update was successful, false otherwise
 */
export async function updateReadme(
  weatherData: WeatherUpdatePayload,
  customReadmePath?: string
): Promise<boolean> {
  try {
    const readmePath = customReadmePath ?? join(process.cwd(), 'README.md');
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
    const currentSection = getSectionContent(
      readmeContent,
      REGEX.weatherSection
    );

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
    const updateSuccess = await performFileUpdate(readmePath, updatedContent);
    if (!updateSuccess) {
      return false;
    }

    // For GitHub Actions, report that changes were detected
    const envResult = EnvironmentSchema.safeParse({
      FORCE_UPDATE: process.env['FORCE_UPDATE'],
      GITHUB_ACTIONS: process.env['GITHUB_ACTIONS'],
    });

    if (envResult.success && envResult.data.GITHUB_ACTIONS === 'true') {
      // GitHub Actions status reporting
      // This could be extended to use GitHub's API for status updates
    }

    return true;
  } catch {
    return false;
  }
}

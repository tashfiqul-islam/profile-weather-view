/**
 * @fileoverview Modern TypeScript 5.9.3 environment preload utilities with strict typing
 * @version 2.2.2
 * @author Tashfiqul Islam
 */

// biome-ignore lint/performance/noNamespaceImport: Zod requires namespace import for proper tree shaking
import * as z from "zod";

// ================================
// 📊 Configuration Constants
// ================================

/**
 * API key validation constants with modern TypeScript 5.9.3 features
 */
const API_KEY_MIN_LENGTH = 32 as const;
const API_KEY_MAX_LENGTH = 100 as const;
const PREVIEW_LENGTH = 8 as const;

/**
 * Regex pattern for non-empty string capture
 * Uses const assertion for immutable pattern
 */
const NON_EMPTY_CAPTURE = /^(.)+$/;

/**
 * Rate limiting configuration with modern TypeScript 5.9.3 features
 * Uses const assertions and numeric separators for better readability
 */
const RATE_LIMIT_CONFIG = {
  maxCallsPerDay: 15 as const,
  trackingFile: ".api-calls.json" as const,
  resetTime: "00:00" as const, // Reset at midnight UTC
} as const;

/**
 * API call tracking schema with enhanced validation
 * Uses modern TypeScript 5.9.3 features for strict validation
 */
const ApiCallTrackingSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .describe("Date in YYYY-MM-DD format"),
  calls: z.number().int().min(0).describe("Number of API calls made"),
  lastCall: z
    .string()
    .optional()
    .describe("Time of last API call in HH:MM format"),
});

/**
 * Type definition for API call tracking data
 * Uses modern TypeScript 5.9.3 type inference
 */
type ApiCallTracking = z.infer<typeof ApiCallTrackingSchema>;

/**
 * Gets today's date in YYYY-MM-DD format
 * Optimized to avoid redundant string operations
 * Uses modern TypeScript 5.9.3 features with strict typing
 * @returns Date string in YYYY-MM-DD format
 */
function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Gets the current time in HH:MM format
 * Optimized to avoid redundant string operations
 * Uses modern TypeScript 5.9.3 features with strict typing
 * @returns Time string in HH:MM format
 */
function getCurrentTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Checks if we should reset the counter (new day)
 * Uses modern TypeScript 5.9.3 features with strict typing
 * @param lastDate The last recorded date
 * @returns True if counter should be reset
 */
function shouldResetCounter(lastDate: string): boolean {
  return lastDate !== getTodayDate();
}

/**
 * Loads API call tracking data
 * Uses modern TypeScript 5.9.3 features with strict typing
 * @returns Promise resolving to API call tracking data
 */
async function loadApiCallTracking(): Promise<ApiCallTracking> {
  try {
    const trackingFile = Bun.file(RATE_LIMIT_CONFIG.trackingFile);
    if (await trackingFile.exists()) {
      const data = JSON.parse(await trackingFile.text());
      const validated = ApiCallTrackingSchema.parse(data);

      // Reset counter if it's a new day
      if (shouldResetCounter(validated.date)) {
        return {
          date: getTodayDate(),
          calls: 0,
        };
      }

      return validated;
    }
  } catch {
    // If file doesn't exist or is invalid, start fresh
    process.stdout.write(
      "⚠️ API tracking file invalid or missing, starting fresh\n"
    );
  }

  return {
    date: getTodayDate(),
    calls: 0,
  };
}

/**
 * Saves API call tracking data asynchronously
 * Uses modern TypeScript 5.9.3 features with strict typing
 * @param tracking The tracking data to save
 * @returns Promise that resolves when save is complete
 */
async function saveApiCallTracking(tracking: ApiCallTracking): Promise<void> {
  try {
    const data = JSON.stringify(tracking, null, 2);
    await Bun.write(RATE_LIMIT_CONFIG.trackingFile, data);
  } catch (error) {
    process.stderr.write(`❌ Failed to save API call tracking: ${error}\n`);
  }
}

/**
 * Checks if API call is allowed and updates tracking
 * Uses modern TypeScript 5.9.3 features with strict typing
 * @returns Promise resolving to true if call is allowed, false if limit exceeded
 */
export async function checkAndUpdateApiLimit(): Promise<boolean> {
  const tracking = await loadApiCallTracking();

  if (tracking.calls >= RATE_LIMIT_CONFIG.maxCallsPerDay) {
    const errorMessage = [
      `❌ API call limit exceeded! Maximum ${RATE_LIMIT_CONFIG.maxCallsPerDay} calls per day reached.`,
      `📅 Date: ${tracking.date}`,
      `📊 Calls made: ${tracking.calls}`,
      `⏰ Last call: ${tracking.lastCall || "N/A"}`,
      `🔄 Counter resets at ${RATE_LIMIT_CONFIG.resetTime} UTC`,
    ].join("\n");

    process.stderr.write(`${errorMessage}\n`);
    return false;
  }

  // Update tracking
  const updatedTracking: ApiCallTracking = {
    date: tracking.date,
    calls: tracking.calls + 1,
    lastCall: getCurrentTime(),
  };

  await saveApiCallTracking(updatedTracking);

  const remaining = RATE_LIMIT_CONFIG.maxCallsPerDay - updatedTracking.calls;
  process.stdout.write(
    `📊 API call ${updatedTracking.calls}/${RATE_LIMIT_CONFIG.maxCallsPerDay} (${remaining} remaining today)\n`
  );

  return true;
}

/**
 * Zod v4 schema for environment variable validation
 * Enhanced with more flexible API key validation
 * Uses modern TypeScript 5.9.3 features for strict validation
 */
const EnvironmentSchema = z.object({
  OPEN_WEATHER_KEY: z
    .string()
    .min(
      API_KEY_MIN_LENGTH,
      `API key must be at least ${API_KEY_MIN_LENGTH} characters`
    )
    .max(
      API_KEY_MAX_LENGTH,
      `API key must be less than ${API_KEY_MAX_LENGTH} characters`
    )
    .regex(
      /^[a-zA-Z0-9]+$/,
      "API key must contain only alphanumeric characters"
    )
    .describe("OpenWeather API key for weather data access"),
});

/**
 * Type definition for validated environment variables
 * Uses modern TypeScript 5.9.3 type inference
 */
type EnvironmentVariables = z.infer<typeof EnvironmentSchema>;

/**
 * Setup instructions template for better maintainability
 * Uses modern TypeScript 5.9.3 features with const assertions
 */
const SETUP_INSTRUCTIONS = `
📋 Setup Instructions:
1. Create a .env file in your project root
2. Add your OpenWeather API key: OPEN_WEATHER_KEY=your_api_key_here
3. Get your API key from: https://home.openweathermap.org/api_keys
4. Restart your development server

💡 Example .env file:
OPEN_WEATHER_KEY=1234567890abcdef1234567890abcdef` as const;

/**
 * Validates environment variables without checking rate limits
 * Uses modern TypeScript 5.9.3 features with strict typing
 * @throws Error if validation fails
 * @returns Validated environment variables
 */
export function validateEnvironmentVariables(): EnvironmentVariables {
  // Validate environment variables
  const envResult = EnvironmentSchema.safeParse({
    OPEN_WEATHER_KEY: Bun.env["OPEN_WEATHER_KEY"]?.trim(),
  });

  if (!envResult.success) {
    const errorMessages = envResult.error.issues
      .map((issue) => {
        const joinedPath = issue.path.join(".");
        const suffix = joinedPath.replace(NON_EMPTY_CAPTURE, " at $1");
        return `${issue.message}${suffix}`;
      })
      .join("; ");

    throw new Error(
      `Environment validation failed: ${errorMessages}${SETUP_INSTRUCTIONS}`
    );
  }

  // Log environment variable status for debugging
  const apiKey = envResult.data.OPEN_WEATHER_KEY;
  const debugInfo = [
    "🔍 Environment variable check:",
    `  OPEN_WEATHER_KEY exists: ${Boolean(apiKey)}`,
    `  OPEN_WEATHER_KEY length: ${apiKey.length}`,
    `  OPEN_WEATHER_KEY preview: ${apiKey.substring(0, PREVIEW_LENGTH)}...`,
  ].join("\n");

  process.stdout.write(`${debugInfo}\n`);

  return envResult.data;
}

/**
 * Validates and ensures required environment variables are present
 * Uses modern TypeScript 5.9.3 features with strict typing
 * @throws Error if validation fails
 * @returns Promise resolving to validated environment variables
 */
export async function ensureEnvironmentVariables(): Promise<EnvironmentVariables> {
  // Check API call limit first
  if (!(await checkAndUpdateApiLimit())) {
    throw new Error(
      "API call limit exceeded - cannot proceed with weather update"
    );
  }

  return validateEnvironmentVariables();
}

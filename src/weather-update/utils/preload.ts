/**
 * Preload utilities for environment validation and simple API rate limiting.
 * Ensures configuration is valid before weather updates run.
 */

import "dotenv/config";
// biome-ignore lint/performance/noNamespaceImport: Zod requires namespace import for schema typing
import * as z from "zod";

/**
 * Rate limit configuration.
 * Prevents accidental API overuse in CI environments.
 */
const RATE_LIMIT_CONFIG = {
  maxCallsPerDay: 1000 as const,
  trackingFile: ".api-calls.json" as const,
  resetTime: "00:00" as const, // Reset at midnight UTC
} as const;

// Tracking file schema for persisted counters
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

type ApiCallTracking = z.infer<typeof ApiCallTrackingSchema>;

/** Returns today's date in YYYY-MM-DD format. */
function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Returns the current time in HH:MM. */
function getCurrentTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/** True when the stored date differs from today. */
function shouldResetCounter(lastDate: string): boolean {
  return lastDate !== getTodayDate();
}

/** Loads tracking data from disk; resets counters on a new day. */
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
    // If file is missing or invalid, start fresh
    process.stdout.write(
      "⚠️ API tracking file invalid or missing, starting fresh\n"
    );
  }

  return {
    date: getTodayDate(),
    calls: 0,
  };
}

/** Persists tracking counters; logs to STDERR on failure. */
async function saveApiCallTracking(tracking: ApiCallTracking): Promise<void> {
  try {
    const data = JSON.stringify(tracking, null, 2);
    await Bun.write(RATE_LIMIT_CONFIG.trackingFile, data);
  } catch (error) {
    process.stderr.write(`❌ Failed to save API call tracking: ${error}\n`);
  }
}

/**
 * Increments the daily counter and prevents calls after the limit is reached.
 * Useful for CI and local runs to avoid accidental API overuse.
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

/** Environment schema for optional configuration. */
const EnvironmentSchema = z.object({
  FORCE_UPDATE: z
    .string()
    .optional()
    .describe("Force README update even if no changes"),
  GITHUB_ACTIONS: z.string().optional().describe("Running in GitHub Actions"),
});

export type EnvironmentVariables = z.infer<typeof EnvironmentSchema>;

/** Validates optional environment variables. */
export function validateEnvironmentVariables(): EnvironmentVariables {
  const env = EnvironmentSchema.parse({
    FORCE_UPDATE: Bun.env["FORCE_UPDATE"],
    GITHUB_ACTIONS: Bun.env["GITHUB_ACTIONS"],
  });

  // Log environment status for debugging
  const debugInfo = [
    "🔍 Environment check:",
    `  FORCE_UPDATE: ${env.FORCE_UPDATE ?? "not set"}`,
    `  GITHUB_ACTIONS: ${env.GITHUB_ACTIONS ?? "not set"}`,
  ].join("\n");

  process.stdout.write(`${debugInfo}\n`);

  return env;
}

/** Ensures API limit allows execution and validates environment. */
export async function ensureEnvironmentVariables(): Promise<EnvironmentVariables> {
  // Check API call limit first
  if (!(await checkAndUpdateApiLimit())) {
    throw new Error(
      "API call limit exceeded - cannot proceed with weather update"
    );
  }

  return validateEnvironmentVariables();
}

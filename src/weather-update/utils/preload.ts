/**
 * Preload utilities for environment validation and API rate limiting.
 * Ensures configuration is valid before weather updates run.
 *
 * @module preload
 * @since 1.0.0
 */

import "dotenv/config";
import { z } from "zod";

// ============================================================================
// Configuration
// ============================================================================

/** Rate limiting configuration */
interface RateLimitConfig {
  readonly maxCallsPerDay: number;
  readonly trackingFile: string;
  readonly resetTime: string;
}

const RATE_LIMIT_CONFIG = {
  maxCallsPerDay: 1000,
  trackingFile: ".api-calls.json",
  resetTime: "00:00",
} as const satisfies RateLimitConfig;

// ============================================================================
// Schemas
// ============================================================================

/** Schema for persisted API call tracking */
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

/** Schema for environment variables */
const EnvironmentSchema = z.object({
  FORCE_UPDATE: z
    .string()
    .optional()
    .describe("Force README update even if no changes"),
  GITHUB_ACTIONS: z.string().optional().describe("Running in GitHub Actions"),
});

export type EnvironmentVariables = z.infer<typeof EnvironmentSchema>;

// ============================================================================
// Date/Time Utilities
// ============================================================================

/** Returns today's date in YYYY-MM-DD format */
function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Returns the current time in HH:MM format */
function getCurrentTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/** Returns true when stored date differs from today */
function shouldResetCounter(lastDate: string): boolean {
  return lastDate !== getTodayDate();
}

// ============================================================================
// Tracking File Operations
// ============================================================================

/** Creates fresh tracking data for a new day */
function createFreshTracking(): ApiCallTracking {
  return { date: getTodayDate(), calls: 0 };
}

/** Loads tracking data from disk; resets counters on a new day */
async function loadApiCallTracking(): Promise<ApiCallTracking> {
  try {
    const trackingFile = Bun.file(RATE_LIMIT_CONFIG.trackingFile);
    const exists = await trackingFile.exists();

    if (exists) {
      const text = await trackingFile.text();
      const data: unknown = JSON.parse(text);
      const validated = ApiCallTrackingSchema.parse(data);

      if (shouldResetCounter(validated.date)) {
        return createFreshTracking();
      }

      return validated;
    }
  } catch {
    process.stdout.write(
      "⚠️ API tracking file invalid or missing, starting fresh\n"
    );
  }

  return createFreshTracking();
}

/** Persists tracking counters to disk */
async function saveApiCallTracking(tracking: ApiCallTracking): Promise<void> {
  try {
    const data = JSON.stringify(tracking, null, 2);
    await Bun.write(RATE_LIMIT_CONFIG.trackingFile, data);
  } catch (error) {
    process.stderr.write(
      `❌ Failed to save API call tracking: ${String(error)}\n`
    );
  }
}

// ============================================================================
// Rate Limiting
// ============================================================================

/**
 * Checks API rate limit and increments the daily counter.
 * Prevents exceeding the configured maximum calls per day.
 *
 * @returns true if the call is allowed, false if limit exceeded
 */
export async function checkAndUpdateApiLimit(): Promise<boolean> {
  const tracking = await loadApiCallTracking();

  if (tracking.calls >= RATE_LIMIT_CONFIG.maxCallsPerDay) {
    const errorLines = [
      `❌ API call limit exceeded! Maximum ${RATE_LIMIT_CONFIG.maxCallsPerDay} calls per day reached.`,
      `📅 Date: ${tracking.date}`,
      `📊 Calls made: ${tracking.calls}`,
      `⏰ Last call: ${tracking.lastCall ?? "N/A"}`,
      `🔄 Counter resets at ${RATE_LIMIT_CONFIG.resetTime} UTC`,
    ];
    process.stderr.write(`${errorLines.join("\n")}\n`);
    return false;
  }

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

// ============================================================================
// Environment Validation
// ============================================================================

/**
 * Validates and returns environment variables.
 * Logs current configuration for debugging.
 */
export function validateEnvironmentVariables(): EnvironmentVariables {
  const env = EnvironmentSchema.parse({
    FORCE_UPDATE: Bun.env["FORCE_UPDATE"],
    GITHUB_ACTIONS: Bun.env["GITHUB_ACTIONS"],
  });

  const debugLines = [
    "🔍 Environment check:",
    `  FORCE_UPDATE: ${env.FORCE_UPDATE ?? "not set"}`,
    `  GITHUB_ACTIONS: ${env.GITHUB_ACTIONS ?? "not set"}`,
  ];
  process.stdout.write(`${debugLines.join("\n")}\n`);

  return env;
}

/**
 * Ensures API limit allows execution and validates environment.
 * Call this before performing weather updates.
 *
 * @throws Error if API call limit is exceeded
 */
export async function ensureEnvironmentVariables(): Promise<EnvironmentVariables> {
  const allowed = await checkAndUpdateApiLimit();
  if (!allowed) {
    throw new Error(
      "API call limit exceeded - cannot proceed with weather update"
    );
  }

  return validateEnvironmentVariables();
}

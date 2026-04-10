/**
 * Entry point for weather update orchestration.
 * Validates environment, fetches weather, updates README, reports status.
 *
 * @module index
 * @since 1.0.0
 */

import { resolve } from "node:path";
import { Temporal } from "@js-temporal/polyfill";
import { fetchWeatherData } from "./services/fetch-weather";
import { updateReadme } from "./services/update-readme";
import { log } from "./utils/logger";
import { ensureEnvironmentVariables } from "./utils/preload";

// ============================================================================
// Type Definitions
// ============================================================================

/** Structured error information for logging and debugging */
interface ErrorInfo {
  readonly context: string;
  readonly details: string;
  readonly message: string;
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Creates a structured error object with context.
 * Normalizes unknown error types to a consistent shape.
 */
function createErrorInfo(error: unknown): ErrorInfo {
  const context = `[${Temporal.Now.instant().toString()}] Weather Update Script`;

  if (error instanceof Error) {
    return {
      message: error.message,
      details: error.stack ?? "No stack trace available",
      context,
    };
  }

  return {
    message: String(error),
    details: "Unknown error type",
    context,
  };
}

// ============================================================================
// Status Reporting
// ============================================================================

/**
 * Handles fatal errors from the main orchestrator.
 * Logs structured error details and exits with code 1.
 */
export function handleFatalError(error: unknown): never {
  const errorInfo = createErrorInfo(error);
  log(`Fatal: ${errorInfo.message}`, "error");
  process.exit(1);
}

/**
 * Reports update status with CHANGES_DETECTED signal for CI.
 * Emits structured output for GitHub Actions workflow parsing.
 */
function reportUpdateStatus(success: boolean, durationMs: number): void {
  const timing = `${durationMs.toFixed(0)}ms`;

  if (success) {
    log(`Weather data updated in ${timing}`, "success");
  } else {
    log(`No changes to commit (${timing})`, "warning");
  }

  // CI signal — only emit when running in GitHub Actions
  if (Bun.env["GITHUB_ACTIONS"]) {
    process.stdout.write(`CHANGES_DETECTED=${success}\n`);
  }
}

// ============================================================================
// Main Orchestrator
// ============================================================================

/**
 * Main orchestration function.
 * Coordinates environment validation, weather fetching, and README updates.
 *
 * @throws Error if any step fails
 */
export async function main(): Promise<void> {
  const startTime = performance.now();

  try {
    log("Starting weather update", "info");

    const env = Bun.env["GITHUB_ACTIONS"] ? "ci" : "local";
    log(`env=${env} node_env=${Bun.env.NODE_ENV ?? "development"}`, "info");

    // Validate environment and check rate limits
    await ensureEnvironmentVariables();

    // Fetch current weather data
    const weatherData = await fetchWeatherData();

    // Handle custom README path with path traversal validation
    const customReadmePath = Bun.env["PROFILE_README_PATH"];
    if (customReadmePath) {
      const resolvedPath = resolve(customReadmePath);
      if (resolvedPath.includes("..") || !resolvedPath.endsWith(".md")) {
        throw new Error(
          "Invalid PROFILE_README_PATH: must be a .md file without path traversal"
        );
      }
      log(`readme=${customReadmePath}`, "info");
    }

    // Update README with new weather data
    const updateSuccess = await updateReadme(weatherData, customReadmePath);

    // Report timing and status
    const durationMs = performance.now() - startTime;
    reportUpdateStatus(updateSuccess, durationMs);
  } catch (error: unknown) {
    const durationMs = performance.now() - startTime;
    const errorInfo = createErrorInfo(error);

    log(
      `Failed after ${durationMs.toFixed(0)}ms: ${errorInfo.message}`,
      "error"
    );

    if (Bun.env["GITHUB_ACTIONS"]) {
      log("Check workflow logs for details", "error");
    }

    throw error;
  }
}

// ============================================================================
// Entry Point
// ============================================================================

if (Bun.env.NODE_ENV !== "test") {
  main().catch(handleFatalError);
}

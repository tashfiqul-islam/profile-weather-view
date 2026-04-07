/**
 * Entry point for weather update orchestration.
 * Validates environment, fetches weather, updates README, reports status.
 *
 * @module index
 * @since 1.0.0
 */

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
 * Reports update status with CHANGES_DETECTED signal for CI.
 * Emits structured output for GitHub Actions workflow parsing.
 */
function reportUpdateStatus(success: boolean, details?: string): void {
  if (success) {
    log("Weather update process completed successfully!", "success");
    if (details) {
      log(`Details: ${details}`, "info");
    }
    process.stdout.write("CHANGES_DETECTED=true\n");
  } else {
    log("Weather update process completed with warnings", "warning");
    if (details) {
      log(`Details: ${details}`, "warning");
    }
    process.stdout.write("CHANGES_DETECTED=false\n");
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
    log("Starting weather update process...", "info");

    // Log environment context
    const envInfo = [
      `Environment: ${Bun.env.NODE_ENV ?? "development"}`,
      `GitHub Actions: ${Bun.env["GITHUB_ACTIONS"] ? "Yes" : "No"}`,
    ];
    for (const info of envInfo) {
      log(info, "info");
    }

    // Validate environment and check rate limits
    log("Validating environment variables...", "info");
    await ensureEnvironmentVariables();
    log("Environment variables validated", "success");

    // Fetch current weather data
    log("Fetching weather data from Open-Meteo API...", "info");
    const weatherData = await fetchWeatherData();
    log("Weather data fetched successfully", "success");

    // Handle custom README path
    const customReadmePath = Bun.env["PROFILE_README_PATH"];
    if (customReadmePath) {
      log(`Using custom README path: ${customReadmePath}`, "info");
    }

    // Update README with new weather data
    log("Updating README with new weather data...", "info");
    const updateSuccess = await updateReadme(weatherData, customReadmePath);

    if (updateSuccess) {
      log("README updated successfully", "success");
    } else {
      log("README update skipped (no changes detected)", "warning");
    }

    // Report timing and status
    const durationMs = performance.now() - startTime;
    log(`Total execution time: ${durationMs.toFixed(2)}ms`, "info");
    reportUpdateStatus(
      updateSuccess,
      `Execution time: ${durationMs.toFixed(2)}ms`
    );
  } catch (error: unknown) {
    const durationMs = performance.now() - startTime;
    const errorInfo = createErrorInfo(error);

    log(`Script failed after ${durationMs.toFixed(2)}ms`, "error");
    log(`Error: ${errorInfo.message}`, "error");

    if (Bun.env["GITHUB_ACTIONS"]) {
      log("This error occurred during a GitHub Actions workflow run", "error");
      log("Check the workflow logs for more details", "info");
    }

    throw error;
  }
}

// ============================================================================
// Entry Point
// ============================================================================

if (Bun.env.NODE_ENV !== "test") {
  main().catch((error: unknown) => {
    const errorInfo = createErrorInfo(error);
    log(`Script execution failed: ${errorInfo.message}`, "error");
    log(`Context: ${errorInfo.context}`, "error");
    process.exit(1);
  });
}

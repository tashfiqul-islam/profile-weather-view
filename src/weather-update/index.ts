/**
 * Entry point: validates env, fetches weather, updates README, reports status.
 * Comments focus on intent and non-obvious behavior.
 */

import "dotenv/config";
import { fetchWeatherData } from "./services/fetchWeather";
import { updateReadme } from "./services/updateReadme";
import { ensureEnvironmentVariables } from "./utils/preload";

/** Builds a serializable error shape with timestamped context. */
function handleError(error: unknown): {
  readonly message: string;
  readonly details: string;
  readonly context: string;
} {
  const timestamp = new Date().toISOString();
  const context = `[${timestamp}] Weather Update Script`;

  if (error instanceof Error) {
    return {
      message: error.message,
      details: error.stack || "No stack trace available",
      context,
    };
  }

  return {
    message: String(error),
    details: "Unknown error type",
    context,
  };
}

type LogType = "info" | "success" | "warning" | "error";

/** Logs with ISO timestamp and severity. */
function log(message: string, type: LogType = "info"): void {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] Weather Update:`;
  const logEntry = `${prefix} ${message}\n`;

  switch (type) {
    case "success":
      process.stdout.write(`✅ ${logEntry}`);
      break;
    case "warning":
      process.stderr.write(`⚠️ ${logEntry}`);
      break;
    case "error":
      process.stderr.write(`❌ ${logEntry}`);
      break;
    default:
      process.stdout.write(`ℹ️ ${logEntry}`);
  }
}

/** Emits a CHANGES_DETECTED flag and human-readable summary for CI. */
function reportUpdateStatus(success: boolean, details?: string): void {
  if (success) {
    log("Weather update process completed successfully!", "success");
    if (details) {
      log(`Details: ${details}`, "info");
    }
    // Emit change signal for GitHub Actions parser
    process.stdout.write("CHANGES_DETECTED=true\n");
  } else {
    log("Weather update process completed with warnings", "warning");
    if (details) {
      log(`Details: ${details}`, "warning");
    }
    process.stdout.write("CHANGES_DETECTED=false\n");
  }
}

/** Orchestrates validation, fetch, update, timing, and CI reporting. */
export async function main(): Promise<void> {
  const startTime = performance.now();

  try {
    log("Starting weather update process...", "info");

    // Basic environment context for troubleshooting
    const envInfo = [
      `Environment: ${process.env["NODE_ENV"] || "development"}`,
      `GitHub Actions: ${process.env["GITHUB_ACTIONS"] ? "Yes" : "No"}`,
    ] as const;

    for (const info of envInfo) {
      log(info, "info");
    }

    // Ensure required environment variables are present
    log("Validating environment variables...", "info");
    await ensureEnvironmentVariables();
    log("Environment variables validated", "success");

    // Fetch current weather data
    log("Fetching weather data from OpenWeather API...", "info");
    const weatherData = await fetchWeatherData();
    log("Weather data fetched successfully", "success");

    // Allow override of README path via env
    const customReadmePath = process.env["PROFILE_README_PATH"];
    if (customReadmePath) {
      log(`Using custom README path: ${customReadmePath}`, "info");
    }

    // Update the README with the new weather data
    log("Updating README with new weather data...", "info");
    const updateSuccess = await updateReadme(weatherData, customReadmePath);

    if (updateSuccess) {
      log("README updated successfully", "success");
    } else {
      log("README update skipped (no changes detected)", "warning");
    }

    // Calculate and log execution time
    const duration = performance.now() - startTime;
    log(`Total execution time: ${duration.toFixed(2)}ms`, "info");

    // Report status for GitHub Actions
    reportUpdateStatus(
      updateSuccess,
      `Execution time: ${duration.toFixed(2)}ms`
    );
  } catch (error: unknown) {
    const duration = performance.now() - startTime;
    const errorInfo = handleError(error);

    log(`Script failed after ${duration.toFixed(2)}ms`, "error");
    log(`Error: ${errorInfo.message}`, "error");

    // Provide extra guidance when running inside CI
    if (process.env["GITHUB_ACTIONS"]) {
      log("This error occurred during a GitHub Actions workflow run", "error");
      log("Check the workflow logs for more details", "info");
    }

    throw error;
  }
}

// Execute unless running tests; surface failures with exit code for CI
if (process.env["NODE_ENV"] !== "test") {
  main().catch((error: unknown) => {
    const errorInfo = handleError(error);
    log(`Script execution failed: ${errorInfo.message}`, "error");
    log(`Context: ${errorInfo.context}`, "error");

    // Exit with error code for GitHub Actions
    process.exit(1);
  });
}

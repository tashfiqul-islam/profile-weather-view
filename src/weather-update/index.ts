import { fetchWeatherData } from "./services/fetchWeather";
import { updateReadme } from "./services/updateReadme";
import { ensureEnvironmentVariables } from "./utils/preload";

/**
 * Enhanced error handling with detailed context for GitHub Actions
 * @param error The error to handle
 * @returns Error information for reporting
 */
function handleError(error: unknown): {
  message: string;
  details: string;
  context: string;
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

/**
 * Enhanced logging with timestamps and GitHub Actions context
 * @param message Log message
 * @param type Log type (info, success, warning, error)
 */
function log(
  message: string,
  type: "info" | "success" | "warning" | "error" = "info"
): void {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] Weather Update:`;
  const logEntry = `${prefix} ${message}\n`;

  // biome-ignore lint/nursery/noUnnecessaryConditions: Switch on string union type is necessary for different log outputs
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

/**
 * Reports update status for GitHub Actions with detailed information
 * @param success Whether the update was successful
 * @param details Additional details about the update
 */
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

/**
 * Main function to fetch weather data and update the README.
 * Uses modern async/await patterns and comprehensive error handling.
 */
export async function main(): Promise<void> {
  const startTime = performance.now();

  try {
    log("Starting weather update process...", "info");

    // Log environment information
    const envInfo = [
      `Environment: ${process.env.NODE_ENV || "development"}`,
      `GitHub Actions: ${process.env["GITHUB_ACTIONS"] ? "Yes" : "No"}`,
    ];
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

    // Check for a custom README path from environment variable
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
  } catch (error) {
    const duration = performance.now() - startTime;
    const errorInfo = handleError(error);

    log(`Script failed after ${duration.toFixed(2)}ms`, "error");
    log(`Error: ${errorInfo.message}`, "error");

    // For GitHub Actions, provide more context
    if (process.env["GITHUB_ACTIONS"]) {
      log("This error occurred during a GitHub Actions workflow run", "error");
      log("Check the workflow logs for more details", "info");
    }

    throw error;
  }
}

// Execute the main function using top-level await with proper error handling
// Skip automatic execution during tests to allow unit testing of main()
if (process.env.NODE_ENV !== "test") {
  main().catch((error: unknown) => {
    const errorInfo = handleError(error);
    log(`Script execution failed: ${errorInfo.message}`, "error");
    log(`Context: ${errorInfo.context}`, "error");

    // Exit with error code for GitHub Actions
    process.exit(1);
  });
}

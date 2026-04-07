/**
 * Shared logger for the weather update pipeline.
 * Writes timestamped, level-prefixed entries to stdout or stderr.
 *
 * @module logger
 * @since 3.2.0
 */

import { Temporal } from "@js-temporal/polyfill";

// ============================================================================
// Types
// ============================================================================

/** Log severity levels */
export type LogLevel = "info" | "success" | "warning" | "error";

// ============================================================================
// Constants
// ============================================================================

/** Log level prefixes for console output */
const LOG_PREFIXES: Readonly<Record<LogLevel, string>> = {
  info: "ℹ️",
  success: "✅",
  warning: "⚠️",
  error: "❌",
} as const;

// ============================================================================
// Public API
// ============================================================================

/**
 * Logs a message with timestamp and severity indicator.
 * Writes to stdout for info/success, stderr for warning/error.
 */
export function log(message: string, level: LogLevel = "info"): void {
  const timestamp = Temporal.Now.instant().toString();
  const prefix = LOG_PREFIXES[level];
  const entry = `${prefix} [${timestamp}] Weather Update: ${message}\n`;

  const stream =
    level === "error" || level === "warning" ? process.stderr : process.stdout;
  stream.write(entry);
}

/**
 * Shared logger for the weather update pipeline.
 * Clean, structured output with ANSI color coding for terminal readability.
 *
 * @module logger
 * @since 3.2.0
 */

// ============================================================================
// Types
// ============================================================================

/** Log severity levels */
export type LogLevel = "info" | "success" | "warning" | "error";

// ============================================================================
// ANSI Formatting
// ============================================================================

/** Whether stdout supports color (CI or terminal) */
const NO_COLOR = !!Bun.env["NO_COLOR"];

const ansi = {
  reset: NO_COLOR ? "" : "\x1b[0m",
  dim: NO_COLOR ? "" : "\x1b[2m",
  bold: NO_COLOR ? "" : "\x1b[1m",
  blue: NO_COLOR ? "" : "\x1b[34m",
  green: NO_COLOR ? "" : "\x1b[32m",
  yellow: NO_COLOR ? "" : "\x1b[33m",
  red: NO_COLOR ? "" : "\x1b[31m",
  cyan: NO_COLOR ? "" : "\x1b[36m",
} as const;

// ============================================================================
// Level Configuration
// ============================================================================

interface LevelStyle {
  readonly badge: string;
  readonly color: string;
}

const LEVEL_STYLES: Readonly<Record<LogLevel, LevelStyle>> = {
  info: { badge: "info", color: ansi.blue },
  success: { badge: " ok ", color: ansi.green },
  warning: { badge: "warn", color: ansi.yellow },
  error: { badge: "fail", color: ansi.red },
} as const;

// ============================================================================
// Public API
// ============================================================================

/**
 * Logs a structured message with timestamp, severity badge, and content.
 *
 * Output format:
 *   HH:MM:SS [info] message
 *   HH:MM:SS [ ok ] message
 *   HH:MM:SS [warn] message
 *   HH:MM:SS [fail] message
 */
export function log(message: string, level: LogLevel = "info"): void {
  const now = new Date();
  const time = now.toISOString().slice(11, 19);
  const style = LEVEL_STYLES[level];

  const entry = `${ansi.dim}${time}${ansi.reset} ${style.color}[${style.badge}]${ansi.reset} ${message}\n`;

  const stream =
    level === "error" || level === "warning" ? process.stderr : process.stdout;
  stream.write(entry);
}

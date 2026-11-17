/**
 * The only logger: one line per event, `HH:MM:SS [badge] message`.
 *
 * Warnings and errors go to stderr, everything else to stdout, so CI logs stay greppable and a
 * failing run's cause is the last stderr line. Timestamps are UTC (`Date#toISOString`); the
 * logger deliberately does not depend on Temporal or the configured timezone.
 *
 * @module
 */

/** Severity of a log line; selects its badge, colour, and output stream. */
export type LogLevel = 'info' | 'success' | 'warning' | 'error';

/** ANSI SGR escape for `code`, or nothing when `NO_COLOR` is set. */
const ansi = (code: number): string => (Bun.env.NO_COLOR ? '' : `\x1b[${code}m`);

const RESET = ansi(0);
const DIM = ansi(2);

const STYLES = {
  info: { badge: 'info', color: ansi(34) },
  success: { badge: ' ok ', color: ansi(32) },
  warning: { badge: 'warn', color: ansi(33) },
  error: { badge: 'fail', color: ansi(31) },
} as const satisfies Record<LogLevel, { badge: string; color: string }>;

/**
 * Writes one log line.
 *
 * @param message - Text after the badge; keep it to one line.
 * @param level - Defaults to `info`; `warning` and `error` go to stderr.
 * @example
 * ```ts
 * log('Patched README.md', 'success'); // 05:23:41 [ ok ] Patched README.md
 * ```
 */
export function log(message: string, level: LogLevel = 'info'): void {
  const time = new Date().toISOString().slice(11, 19);
  const { badge, color } = STYLES[level];
  const stream = level === 'warning' || level === 'error' ? process.stderr : process.stdout;
  stream.write(`${DIM}${time}${RESET} ${color}[${badge}]${RESET} ${message}\n`);
}

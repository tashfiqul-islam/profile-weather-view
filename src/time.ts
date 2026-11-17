/**
 * Time formatting on the native `Temporal` global (Bun ≥ 1.4). Pure: every function takes the
 * instant or zone it formats, so callers and tests control the clock.
 *
 * @module
 */

/**
 * Compacts an ISO offset into the label the README shows.
 *
 * @param offset - `±HH:MM`, as in `Temporal.ZonedDateTime#offset`.
 * @returns `UTC±H`, with `:MM` only when minutes are non-zero.
 * @throws RangeError when `offset` is not `±HH:MM`.
 * @example
 * ```ts
 * formatUtcOffset('+06:00'); // 'UTC+6'
 * formatUtcOffset('+05:30'); // 'UTC+5:30'
 * ```
 */
export function formatUtcOffset(offset: string): string {
  const [, sign, hours, minutes] = /^([+-])(\d{2}):(\d{2})$/.exec(offset) ?? [];
  if (sign === undefined || hours === undefined || minutes === undefined) {
    throw new RangeError(`Not a ±HH:MM offset: ${offset}`);
  }
  return `UTC${sign}${Number(hours)}${minutes === '00' ? '' : `:${minutes}`}`;
}

/**
 * Wall-clock time of a Unix timestamp in a given zone.
 *
 * @param epochSeconds - Seconds since the Unix epoch (Open-Meteo's `timeformat=unixtime`).
 * @param timeZone - IANA zone name, e.g. `Asia/Dhaka`.
 * @returns `HH:MM`, 24-hour.
 */
export function formatClock(epochSeconds: number, timeZone: string): string {
  return Temporal.Instant.fromEpochMilliseconds(epochSeconds * 1000)
    .toZonedDateTimeISO(timeZone)
    .toPlainTime()
    .toString({ smallestUnit: 'minute' });
}

/**
 * Locale-formatted timestamp with a compact UTC offset suffix.
 *
 * @param now - The instant to format, in its own zone.
 * @param options - `Intl` options for the `en-US` part of the output.
 * @returns e.g. `Tuesday, November 17, 2026 at 23:05:09 (UTC+6)`; the joining words come from ICU.
 */
export function formatTimestamp(
  now: Temporal.ZonedDateTime,
  options: Intl.DateTimeFormatOptions,
): string {
  return `${now.toLocaleString('en-US', options)} (${formatUtcOffset(now.offset)})`;
}

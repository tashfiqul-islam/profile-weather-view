/**
 * The GitHub Actions job summary for a weather run: a compact card of what was written, plus
 * timings. {@link renderSummary} is the pure core; {@link writeSummary} appends to the file GitHub
 * provides in `GITHUB_STEP_SUMMARY` and is a no-op everywhere else (local runs, tests).
 *
 * @see https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary
 * @module
 */

import { meteoconUrl } from './meteocons';
import { formatTimestamp } from './time';
import type { Weather } from './weather';

/** Everything one run knows about itself, for the summary. */
export interface RunReport {
  /** What was rendered into the README. */
  readonly weather: Weather;
  /** Refresh time stamped into the README, in its display zone. */
  readonly now: Temporal.ZonedDateTime;
  /** README that was patched. */
  readonly readmePath: string;
  /** Open-Meteo round trip, retries included. */
  readonly fetchMs: number;
  /** Whole run, fetch to file write. */
  readonly totalMs: number;
}

/** Short and unambiguous: `Wed, Nov 18, 02:21 (UTC+6)`. */
const SUMMARY_TIME = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
} as const satisfies Intl.DateTimeFormatOptions;

/**
 * Renders the job-summary Markdown for one run.
 *
 * @param report - What the run fetched and wrote, and how long it took.
 * @returns GitHub-flavoured Markdown, ending with a newline.
 * @example
 * ```ts
 * renderSummary({ weather, now, readmePath: 'profile/README.md', fetchMs: 219, totalMs: 231 });
 * // ### <img …> Overcast · 20 °C
 * // | Humidity | Sunrise | Sunset | Refreshed | …
 * ```
 */
export function renderSummary(report: RunReport): string {
  const { weather: w, now, readmePath, fetchMs, totalMs } = report;
  return [
    `### <img src="${meteoconUrl(w.icon)}" width="40" align="center" alt=""> ${w.description} · ${w.temperatureC} °C`,
    '',
    '| Humidity | Sunrise | Sunset | Refreshed |',
    '| :------: | :-----: | :----: | :-------: |',
    `| ${w.humidityPct} % | ${w.sunrise} | ${w.sunset} | ${formatTimestamp(now, SUMMARY_TIME)} |`,
    '',
    `Open-Meteo **${Math.round(fetchMs)} ms** · run **${Math.round(totalMs)} ms** · patched \`${readmePath}\``,
    '',
  ].join('\n');
}

/**
 * Appends Markdown to the current step's job summary.
 *
 * @param markdown - Content to append.
 * @param path - Summary file; defaults to `GITHUB_STEP_SUMMARY`. Nothing is written when unset.
 * @returns Whether anything was written.
 */
export async function writeSummary(
  markdown: string,
  path = Bun.env.GITHUB_STEP_SUMMARY,
): Promise<boolean> {
  if (!path) return false;
  const file = Bun.file(path);
  const existing = (await file.exists()) ? await file.text() : '';
  await Bun.write(file, existing + markdown);
  return true;
}

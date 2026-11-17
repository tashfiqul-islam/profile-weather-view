/**
 * Entry point: fetch current weather, patch the README at `PROFILE_README_PATH`.
 *
 * `bun start` runs {@link run}: exit code 0 means the README was written, 1 means something
 * failed, with the reason as the last line on stderr. Importing the module has no side effects.
 *
 * @module
 */

import { LOCATION } from './config';
import { log } from './log';
import { updateReadme } from './readme';
import { renderSummary, writeSummary } from './summary';
import { fetchWeather } from './weather';

/**
 * Fetches the weather, patches one README, and (in GitHub Actions) writes the job summary.
 *
 * The path is validated before any network call.
 *
 * @param readmePath - README to patch; defaults to `PROFILE_README_PATH`.
 * @throws Error when the path is missing or not `.md`, or when fetching or patching fails.
 */
export async function main(readmePath = Bun.env.PROFILE_README_PATH): Promise<void> {
  if (!readmePath) {
    throw new Error('PROFILE_README_PATH is required (path to the README to patch)');
  }
  if (!/\.md$/i.test(readmePath)) {
    throw new Error(`PROFILE_README_PATH must point to a .md file, got: ${readmePath}`);
  }
  const start = performance.now();
  const weather = await fetchWeather();
  const fetchMs = performance.now() - start;
  const now = Temporal.Now.zonedDateTimeISO(LOCATION.timezone);
  await updateReadme(readmePath, weather, now);
  const totalMs = performance.now() - start;
  await writeSummary(renderSummary({ weather, now, readmePath, fetchMs, totalMs }));
  log(`Done in ${totalMs.toFixed(0)}ms`, 'success');
}

/**
 * CLI wrapper around {@link main}: logs any failure and sets `process.exitCode` to 1 instead of
 * throwing, so the process exits cleanly with a single readable error line.
 */
export async function run(): Promise<void> {
  try {
    await main();
  } catch (error: unknown) {
    log(error instanceof Error ? error.message : String(error), 'error');
    process.exitCode = 1;
  }
}

if (import.meta.main) await run();

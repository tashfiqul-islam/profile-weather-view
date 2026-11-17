/**
 * Shared test fakes. Every fake replaces a seam (fetch, stdio, the filesystem) and is undone by
 * `mock.restore()` or `await using`, so tests stay order-independent under `randomize`.
 *
 * @module
 */

import { spyOn } from 'bun:test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Weather } from './weather';

/**
 * Writes a README into the OS temp dir and deletes it when the `await using` scope exits.
 *
 * @param content - File contents.
 * @param extension - File extension, e.g. `.MD` to test case-insensitive paths.
 * @returns The file's path, disposable with `await using`.
 */
export async function tempReadme(
  content: string,
  extension = '.md',
): Promise<{ readonly path: string } & AsyncDisposable> {
  const path = join(tmpdir(), `pwv-${crypto.randomUUID()}${extension}`);
  await Bun.write(path, content);
  return { path, [Symbol.asyncDispose]: () => Bun.file(path).delete() };
}

/** A typical daytime {@link Weather} value. */
export const WEATHER = {
  description: 'Clear Sky',
  icon: 'clear-day',
  temperatureC: 25,
  humidityPct: 60,
  sunrise: '06:14',
  sunset: '17:12',
} as const satisfies Weather;

/**
 * A valid Open-Meteo forecast payload whose sunrise and sunset fall at 06:14 and 17:12 in Dhaka.
 *
 * @param current - Overrides for the `current` block, e.g. `{ is_day: 0 }`.
 * @returns A JSON-serialisable response body.
 */
export const openMeteoBody = (current: Record<string, number> = {}): object => ({
  current: {
    temperature_2m: 25.4,
    relative_humidity_2m: 60,
    weather_code: 0,
    is_day: 1,
    ...current,
  },
  daily: { sunrise: [1_763_338_440], sunset: [1_763_377_920] },
});

/**
 * Replaces the global `fetch` with a scripted sequence of outcomes; the last one repeats.
 * Restore with `mock.restore()`.
 *
 * @param first - Outcome of the first call: a response, or an error to reject with.
 * @param rest - Outcomes of later calls.
 * @returns The spy, for call assertions.
 */
export function mockFetch(
  first: Response | Error,
  ...rest: ReadonlyArray<Response | Error>
): ReturnType<typeof spyOn> {
  const outcomes = [first, ...rest];
  let call = 0;
  return spyOn(globalThis, 'fetch').mockImplementation(
    asFetch(() => {
      const outcome = outcomes[Math.min(call++, outcomes.length - 1)] ?? first;
      if (outcome instanceof Error) return Promise.reject(outcome);
      // A fresh copy per call, so a repeated outcome's body can be read again.
      return Promise.resolve(new Response(outcome.clone().body, outcome));
    }),
  );
}

/**
 * Adapts a plain function to Bun's `typeof fetch`, which also carries `preconnect`.
 *
 * @param impl - Fake implementation.
 * @returns `impl`, typed as `fetch`.
 */
export const asFetch = (
  impl: (...args: Parameters<typeof fetch>) => Promise<Response>,
): typeof fetch => Object.assign(impl, { preconnect: fetch.preconnect });

/**
 * Swallows stdout and stderr until `mock.restore()`.
 *
 * @returns A reader for everything written so far, both streams joined.
 */
export function silence(): () => string {
  const out = spyOn(process.stdout, 'write').mockImplementation(() => true);
  const err = spyOn(process.stderr, 'write').mockImplementation(() => true);
  return () => [...out.mock.calls, ...err.mock.calls].map(([chunk]) => String(chunk)).join('');
}

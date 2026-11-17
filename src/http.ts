/**
 * The network seam: every outbound request goes through {@link fetchWithRetry}.
 *
 * Exists because a bare `fetch` once sat on a dead socket for 222 s and failed the scheduled run.
 * Each attempt gets its own timeout that covers headers and body; transient failures are retried
 * with full-jitter exponential backoff, honouring `Retry-After`.
 *
 * @module
 */

import { log } from './log';

/**
 * Retry and timeout policy for {@link fetchWithRetry}; every field has a production default.
 *
 * The defaults ride out roughly 75 s of upstream trouble (4 × 15 s attempts plus jittered waits of
 * up to 2, 4 and 8 s), sized from observed Open-Meteo stalls from GitHub's runners while staying far
 * inside the job's 5-minute timeout.
 */
export interface RetryOptions {
  /** Total attempts, including the first. Default `4`. */
  readonly attempts: number;
  /** Budget per attempt, headers and body together. Default `15_000`. */
  readonly timeoutMs: number;
  /** Base for full-jitter exponential backoff. Default `2000`. */
  readonly baseDelayMs: number;
  /** Cap on any single wait, including `Retry-After`. Default `20_000`. */
  readonly maxDelayMs: number;
}

const DEFAULTS = {
  attempts: 4,
  timeoutMs: 15_000,
  baseDelayMs: 2000,
  maxDelayMs: 20_000,
} as const satisfies RetryOptions;

/** Request timeout, rate limiting, and server errors are worth another attempt; other 4xx are not. */
const isRetryableStatus = (status: number): boolean =>
  status === 408 || status === 429 || status >= 500;

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/** RFC 9110 IMF-fixdate, e.g. `Tue, 17 Nov 2026 12:00:05 GMT`. */
const IMF_FIXDATE = /^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/;

/**
 * Parses a `Retry-After` header.
 *
 * Only the two RFC 9110 forms are accepted; anything else (`1.5`, `-5`, ISO dates) is ignored so
 * the caller falls back to its own backoff instead of retrying immediately.
 *
 * @param header - Raw header value, or `null` when absent.
 * @param now - Reference time for the date form; defaults to `Date.now()`.
 * @returns Delay in milliseconds (`0` for a past date), or `undefined` if absent or invalid.
 * @example
 * ```ts
 * parseRetryAfter('3'); // 3000
 * parseRetryAfter('Tue, 17 Nov 2026 12:00:05 GMT', Date.parse('2026-11-17T12:00:00Z')); // 5000
 * ```
 */
export function parseRetryAfter(header: string | null, now = Date.now()): number | undefined {
  const value = header?.trim();
  if (value === undefined) return undefined;
  if (/^\d+$/.test(value)) return Number(value) * 1000;
  return IMF_FIXDATE.test(value) ? Math.max(0, Date.parse(value) - now) : undefined;
}

/**
 * `fetch` with a per-attempt timeout and bounded, jittered retries.
 *
 * Retries network failures (dropped sockets, DNS, timeouts) and HTTP 408/429/5xx. Any other
 * response is returned as-is, so status handling stays with the caller; if every attempt ends in
 * a retryable status, the last response is returned. The body is fully buffered inside the
 * attempt, so the returned `Response` is readable after the timeout window has passed.
 *
 * @param url - Absolute URL to `GET`.
 * @param options - Overrides for {@link RetryOptions}; tests pass zero delays.
 * @returns The first non-retryable response, or the last response once attempts run out.
 * @throws Error with the final network error as `cause` when every attempt fails before a response.
 * @example
 * ```ts
 * const response = await fetchWithRetry('https://api.open-meteo.com/v1/forecast?…');
 * if (!response.ok) throw new Error(`HTTP ${response.status}`);
 * ```
 */
export async function fetchWithRetry(
  url: URL | string,
  options: Partial<RetryOptions> = {},
): Promise<Response> {
  const { attempts, timeoutMs, baseDelayMs, maxDelayMs } = { ...DEFAULTS, ...options };
  const backoff = (attempt: number): number =>
    Math.min(maxDelayMs, Math.random() * baseDelayMs * 2 ** (attempt - 1));

  // Attempts are sequential by nature: each one decides whether, and how long, to wait for the next.
  const attempt = async (n: number): Promise<Response> => {
    const isLast = n === attempts;
    let delayMs: number;
    let reason: string;

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (isLast || !isRetryableStatus(response.status)) {
        return new Response(await response.arrayBuffer(), response);
      }
      await response.body?.cancel(); // release the socket before waiting
      const retryAfter = parseRetryAfter(response.headers.get('Retry-After'));
      delayMs = Math.min(maxDelayMs, retryAfter ?? backoff(n));
      reason = `HTTP ${response.status}`;
    } catch (error: unknown) {
      if (isLast) {
        throw new Error(`Request failed after ${attempts} attempts: ${messageOf(error)}`, {
          cause: error,
        });
      }
      delayMs = backoff(n);
      reason = messageOf(error);
    }

    log(`${reason}; retry ${n}/${attempts - 1} in ${delayMs.toFixed(0)}ms`, 'warning');
    await Bun.sleep(delayMs);
    return attempt(n + 1);
  };

  return attempt(1);
}

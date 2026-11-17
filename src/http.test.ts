import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test';
import { fetchWithRetry, parseRetryAfter } from './http';
import { asFetch, mockFetch, silence } from './test-utils';

const TARGET = 'https://example.test/';
const FAST = { baseDelayMs: 0, maxDelayMs: 0 } as const;

beforeEach(() => silence());
afterEach(() => mock.restore());

describe('fetchWithRetry', () => {
  test('passes an abort signal and returns a healthy response untouched', async () => {
    const fetch = mockFetch(Response.json({ ok: true }));
    const response = await fetchWithRetry(TARGET, FAST);
    expect(response.status).toBe(200);
    expect(fetch.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);
  });

  test('retries a dropped socket, then succeeds', async () => {
    const fetch = mockFetch(
      new Error('The socket connection was closed unexpectedly'),
      new Response('ok'),
    );
    expect((await fetchWithRetry(TARGET, FAST)).ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test.each([408, 429, 503])('retries HTTP %i', async (status) => {
    const fetch = mockFetch(
      new Response('', { status, headers: { 'Retry-After': '0' } }),
      new Response('ok'),
    );
    expect((await fetchWithRetry(TARGET, FAST)).ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('waits for Retry-After over backoff, capped at maxDelayMs', async () => {
    const sleep = spyOn(Bun, 'sleep').mockResolvedValue(undefined);
    mockFetch(
      new Response('', { status: 429, headers: { 'Retry-After': '3' } }),
      new Response('', { status: 503, headers: { 'Retry-After': '120' } }),
      new Response('ok'),
    );
    await fetchWithRetry(TARGET, { baseDelayMs: 0, maxDelayMs: 10_000 });
    expect(sleep.mock.calls).toEqual([[3000], [10_000]]);
  });

  test('buffers the body so it is readable after the timeout window', async () => {
    mockFetch(Response.json({ ok: true }));
    const response = await fetchWithRetry(TARGET, { ...FAST, timeoutMs: 1 });
    await Bun.sleep(5);
    expect(await response.json()).toEqual({ ok: true });
  });

  test('does not retry other 4xx', async () => {
    const fetch = mockFetch(new Response('', { status: 404 }));
    expect((await fetchWithRetry(TARGET, FAST)).status).toBe(404);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('returns the last retryable response when attempts run out', async () => {
    const fetch = mockFetch(new Response('', { status: 502 }));
    expect((await fetchWithRetry(TARGET, { ...FAST, attempts: 3 })).status).toBe(502);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  test('throws with cause once network attempts run out', async () => {
    const root = new Error('ECONNRESET');
    mockFetch(root);
    const error = await fetchWithRetry(TARGET, { ...FAST, attempts: 2 }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({
      message: 'Request failed after 2 attempts: ECONNRESET',
      cause: root,
    });
  });

  test('stringifies non-Error rejections', async () => {
    spyOn(globalThis, 'fetch').mockImplementation(asFetch(() => Promise.reject('boom')));
    await expect(fetchWithRetry(TARGET, { ...FAST, attempts: 1 })).rejects.toThrow(
      'Request failed after 1 attempts: boom',
    );
  });

  test('aborts a hung request via the per-attempt timeout', async () => {
    const fetch = spyOn(globalThis, 'fetch').mockImplementation(
      asFetch(
        (_input, init) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(init.signal?.reason));
          }),
      ),
    );
    await expect(fetchWithRetry(TARGET, { ...FAST, attempts: 2, timeoutMs: 20 })).rejects.toThrow(
      'failed after 2 attempts',
    );
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

describe('parseRetryAfter', () => {
  const now = Date.parse('2026-11-17T12:00:00Z');

  test.each([
    ['3', 3000],
    ['Tue, 17 Nov 2026 12:00:05 GMT', 5000],
    ['Tue, 17 Nov 2026 11:00:00 GMT', 0],
    [' 7 ', 7000],
    ['soon', undefined],
    ['1.5', undefined],
    ['-5', undefined],
    ['2026-11-17', undefined],
    [null, undefined],
  ] as const)('%p → %p', (header, expected) => {
    expect(parseRetryAfter(header, now)).toBe(expected);
  });
});

---
applyTo: "src/tests/**"
---

# Testing Rules — profile-weather-view

## Framework & Structure

- `bun test` only — never Jest, Vitest, or any other runner
- 100% line and function coverage enforced — never lower `coverageThreshold` in `bunfig.toml`
- Test files mirror source structure: `src/weather-update/services/foo.ts` → `src/tests/unit/services/foo.test.ts`
- Imports from `bun:test`: `describe`, `it`, `expect`, `beforeEach`, `afterEach`, `mock`, `spyOn`

## Log Capture Pattern

`log()` routes to `process.stdout.write` (info/success/warning) and `process.stderr.write` (error).
**Never mock `console.log`** — it won't capture anything.

```ts
const stdoutCalls: string[] = [];
const stderrCalls: string[] = [];
const origStdout = process.stdout.write.bind(process.stdout);
const origStderr = process.stderr.write.bind(process.stderr);

beforeEach(() => {
  process.stdout.write = (chunk: string) => { stdoutCalls.push(chunk); return true; };
  process.stderr.write = (chunk: string) => { stderrCalls.push(chunk); return true; };
});

afterEach(() => {
  process.stdout.write = origStdout;
  process.stderr.write = origStderr;
  stdoutCalls.length = 0;
  stderrCalls.length = 0;
});
```

## Temporal.Now Mock

```ts
import { Temporal } from "@js-temporal/polyfill";

// BRACKET NOTATION required — dot notation causes TS4111 (index signature error)
const orig = Temporal.Now.zonedDateTimeISO;

beforeEach(() => {
  (Temporal.Now as Record<string, unknown>)["zonedDateTimeISO"] = (_tz: unknown) => mockZdt;
});

afterEach(() => {
  (Temporal.Now as Record<string, unknown>)["zonedDateTimeISO"] = orig;
});
```

## Open-Meteo Mock Shape

```ts
// CORRECT — Open-Meteo format
const mockWeather = {
  current: {
    temperature_2m: 25,
    relative_humidity_2m: 60,
    weather_code: 0,
    is_day: 1,
  },
  daily: {
    sunrise: [1_704_153_600],
    sunset:  [1_704_196_800],
  },
  utc_offset_seconds: 21_600,
};

// WRONG — old OpenWeatherMap format (do not use)
// { lat, lon, timezone, current: { weather: [{ id, main, description }] } }
```

## Disposable Temp Files

```ts
// createDisposableTempFile uses Symbol.asyncDispose — auto-cleanup on scope exit
await using file = await testUtils.fs.createDisposableTempFile("initial content", "test.md");
// file.path is the temp file path
// automatically deleted when the `await using` block exits
```

## Fetch Mock

```ts
// Mock global fetch for API tests
const mockFetch = mock(() =>
  Promise.resolve(new Response(JSON.stringify(mockWeather), { status: 200 }))
);
global.fetch = mockFetch;

afterEach(() => {
  mockFetch.mockReset();
});
```

## General Rules

- Restore every mock in `afterEach` — never leave global state mutated between tests
- Use `mock(() => ...)` from `bun:test` — not `jest.fn()`
- Test both the happy path and all documented error paths
- `process.env` writes are allowed in tests (Bun.env is read-only)

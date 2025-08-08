# Unit Testing Guide

This guide documents how unit tests are structured, executed, and measured in this project using Vitest on the Bun toolchain.

## Goals & principles
- Deterministic and fast: no real network or filesystem I/O in unit tests
- 100% coverage on core modules; CI threshold set to 90% global to avoid flakes
- Clear Arrange–Act–Assert structure, minimal mocking surface
- Small, focused tests that validate behavior and error handling

---

## Quickstart
- Run all tests (watch): `bun run test`
- Run once (CI mode): `bun run test:ci`
- Coverage (text, html, lcov): `bun run test:coverage`
- Watch a file: `bunx vitest --watch src/__tests__/unit/services/fetchWeather.test.ts`
- Filter by name: `bunx vitest -t "retries on transient error"`

HTML coverage is written to `html/` and `coverage/`. Preview HTML quickly:

```bash
npx vite preview --outDir html
```

---

## Directory layout & naming
- Unit tests live under `src/__tests__/unit/**` and alongside source using `*.test.ts`
- Vitest includes patterns (from `vitest.config.ts`):
  - `src/**/*.{test,spec}.{js,ts}`
  - `**/__tests__/**/*.{js,ts}`
  - `**/*.{test,spec}.{js,ts}`
- Prefer colocated tests when the file is small; use `__tests__/unit` for larger suites/utilities

---

## Environment & setup
Global setup file: `src/__tests__/setup.ts`
- Sets `NODE_ENV=test` and provides safe defaults for:
  - `OPEN_WEATHER_KEY` (32+ chars), `FORCE_UPDATE`, `GITHUB_ACTIONS`, `PROFILE_README_PATH`
- Stubs Bun APIs with an in‑memory FS for `Bun.file`/`Bun.write`
- Captures `stdout`/`stderr` to assertions and restores them per test
- Exposes helpers: `setMockFile`, `removeMockFile`, `captureOutput`, `waitFor`, `createTestEnv`, and typed factories for mock weather/API data

Execution environment:
- Node test environment
- Isolated test contexts, thread pool enabled (determinism kept via low concurrency)
- Timeouts: test 30s, hooks/teardown 10s, slow threshold 5s

Aliases available in tests:
- `@` → `src/`
- `@weather`, `@services`, `@utils`, `@tests`

---

## Mocking strategy
- Use `vi.mock()` at the top before importing the module under test
- Use `vi.spyOn()` for selective spying and to avoid overspecifying behavior
- Use fake timers (`vi.useFakeTimers()`) when testing retry/backoff logic
- Replace `globalThis.fetch` with a small mock that validates URL, status, and returns `json()`/`text()`
- Never hit the real network; all API paths are simulated

Example (simplified):

```ts
vi.mock('@/weather-update/utils/preload', () => ({ ensureEnvironmentVariables: vi.fn() }));
vi.mock('@/weather-update/services/updateReadme', () => ({ updateReadme: vi.fn() }));

import { main } from '@/weather-update/index';
import { ensureEnvironmentVariables } from '@/weather-update/utils/preload';
import { updateReadme } from '@/weather-update/services/updateReadme';

it('sets CHANGES_DETECTED=true on successful update', async () => {
  vi.mocked(ensureEnvironmentVariables).mockResolvedValue({ OPEN_WEATHER_KEY: 'A'.repeat(32) } as { OPEN_WEATHER_KEY: string });
  vi.mocked(updateReadme).mockResolvedValue(true);
  await main();
});
```

---

## Coverage & reporting
Coverage settings (see `vitest.config.ts`):
- Provider: v8
- Includes: `src/weather-update/**` (index, services, utils)
- Excludes: tests, configs, `dist`, types
- Reports: `text`, `text-summary`, `html`, `lcov`, `json`, `json-summary`
- Directory: `coverage/`
- Thresholds (global): 90% branches/functions/lines/statements

Integration:
- SonarCloud consumes `coverage/lcov.info`
- `html/` folder contains a static report preview (handy for local review)

Raising the bar:
- To enforce 100% in CI, set `thresholds.global` to 100 and optionally `perFile: true`

---

## Writing new tests
Guidelines:
- One behavior per test; name with intent: "throws when API key missing"
- Keep asserts focused; prefer strict equality and specific messages
- Validate both success paths and failure modes (network, schema, rate limit)
- Prefer factories/utilities from `setup.ts` for consistency

Typical pattern:

```ts
describe('fetchWeatherData', () => {
  it('retries on transient error then succeeds', async () => {
    vi.useFakeTimers();
    try {
      // arrange: first call fails, second succeeds
      // act: call function under test and advance timers
      // assert: result is successful and call count matches
    } finally {
      vi.useRealTimers();
    }
  });
});
```

What to cover in this project:
- `fetchWeather.ts`
  - Success mapping (description casing, icon defaults)
  - Non‑OK responses (4xx without retry, 5xx with backoff retries)
  - Non‑Error rejections and JSON parse failures
  - Zod schema validation failures
- `updateReadme.ts`
  - Marker detection and content replacement in `<table>`, `<div>`, and simple blocks
  - Idempotency when content is identical; `FORCE_UPDATE` semantics
  - Fallbacks for empty description/icon, refresh timestamp replacement
  - Error paths: missing file, read/write failures
- `preload.ts`
  - Env validation behavior and messages
  - Daily API call limit tracking and rollovers
  - Error logging on tracking write failure

---

## Reporters
A tiny banner reporter prints start/end banners.
- File: `src/__tests__/reporters/BannersReporter.ts`
- Ensure your Vitest config references the correct path if you relocate it

---

## CI usage
- `bun run test:ci` runs once with configured reporters and writes JUnit to `test-results/junit.xml`
- `bun run test:coverage` generates LCOV for SonarCloud
- Global thresholds guard quality; failing thresholds fail CI

---

## Troubleshooting
- Tests exit early or hang: ensure no real network/file I/O; use stubs
- Coverage missing files: check `coverage.include` globs
- Path alias errors: ensure aliases match both `vitest.config.ts` and `tsconfig.json`
- Flaky timing: always use fake timers for backoff/retry and time-based logic
- Missing banners: verify reporter path matches your config

---

## References
- Vitest: https://vitest.dev
- Coverage: https://vitest.dev/guide/coverage
- Expect API: https://vitest.dev/api/expect

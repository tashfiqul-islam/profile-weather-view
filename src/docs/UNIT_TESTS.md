# Unit Testing Guide

This guide explains how we write, run, and measure unit tests using Bun's built‑in test runner.

## Goals & principles

- Deterministic and fast: no real network or filesystem I/O in unit tests
- 100% coverage on all modules; CI enforces this threshold
- Clear Arrange–Act–Assert structure, minimal mocking surface
- Small, focused tests that validate behavior and error handling

---

## Quickstart

- Run all tests: `bun test`
- Run all tests (watch): `bun test --watch`
- Coverage (text, lcov): `bun test --coverage`
- Run a specific file: `bun test src/tests/unit/services/fetch-weather.test.ts`
- Filter by name: `bun test -t "should fetch and transform"`

Coverage is written to `coverage/`. LCOV file at `coverage/lcov.info`.

---

## Directory layout & naming

Tests live under `src/tests/`:

```text
src/tests/
├── setup.ts                        # Global test setup (preloaded via bunfig.toml)
├── unit/
│   ├── basic.test.ts               # Infrastructure and helper tests
│   ├── services/
│   │   ├── fetch-weather.test.ts   # Open-Meteo API integration tests
│   │   ├── update-readme.test.ts   # README update logic tests
│   │   └── wmo-mapper.test.ts      # WMO code → Meteocons mapping tests
│   └── utils/
│       └── preload.test.ts         # Environment validation and rate limit tests
└── utils/
    └── weather-test-helpers.ts     # Shared test utilities and factories
```

File naming: `*.test.ts` or `*.spec.ts`.

---

## Environment & setup

Global setup file: `src/tests/setup.ts` (loaded via `bunfig.toml` `test.preload`).

- Sets `NODE_ENV=test` and safe defaults for environment variables
- Provides helpers for performance timing and temp file creation
- Uses `bun:test` primitives like `beforeAll`, `afterAll`, `beforeEach`, `afterEach`

Execution environment:

- Bun test runtime with isolated contexts
- Timeouts and coverage thresholds are configured in `bunfig.toml` under the `[test]` section

Path aliases (configured in `tsconfig.json`):

- `@/*` → `src/*`

---

## Mocking strategy

- Use `mock` from `bun:test` to create function mocks
- Replace `globalThis.fetch` with a mock that validates URL, status, and returns JSON
- Prefer minimal, behavior‑focused stubs over broad module mocks
- Avoid real network and filesystem I/O in unit tests

Example:

```ts
import { describe, expect, mock, test } from "bun:test";

describe("fetchWeatherData", () => {
  test("should fetch and transform weather data successfully", async () => {
    const mockResponse = {
      current: { temperature_2m: 25, relative_humidity_2m: 60, weather_code: 0, is_day: 1 },
      daily: { sunrise: [1704153600], sunset: [1704196800] },
      utc_offset_seconds: 21600,
    };

    global.fetch = mock(() =>
      Promise.resolve(Response.json(mockResponse))
    ) as unknown as typeof fetch;

    const result = await fetchWeatherData();
    expect(result.temperatureC).toBe(25);
    expect(result.icon).toBe("clear-day");
  });
});
```

---

## Coverage & reporting

Coverage settings (see `bunfig.toml` `[test]`):

- Coverage enabled by default; Bun writes coverage artifacts to `coverage/`
- Thresholds: 90% branches/functions/lines/statements (targeting 100%)
- See `bunfig.toml` for `coverage`, `coverageSkipTestFiles`, and `coverageThreshold`

Integration:

- SonarCloud consumes `coverage/lcov.info` when configured

---

## Writing new tests

Guidelines:

- One behavior per test; name with intent (e.g., "should throw when array is empty")
- Keep asserts focused; prefer strict equality and specific messages
- Validate both success paths and failure modes
- Prefer shared factories/utilities from `src/tests/setup.ts` and `src/tests/utils/`

Typical pattern:

```ts
import { describe, expect, test } from "bun:test";

describe("getFirstElement", () => {
  test("should return first element from non-empty array", () => {
    expect(getFirstElement([42, 100], "test")).toBe(42);
  });

  test("should throw error for empty array", () => {
    expect(() => getFirstElement([], "sunrise")).toThrow(
      "Missing sunrise data in API response"
    );
  });
});
```

---

## What to cover

- `fetch-weather.ts`
  - Success mapping (temperature, humidity, WMO code → icon)
  - Non‑OK responses (4xx, 5xx error handling)
  - Non‑Error rejections and JSON parse failures
  - Zod schema validation failures
  - `getFirstElement` helper for array extraction

- `wmo-mapper.ts`
  - Day/night icon mapping for all WMO codes
  - Unknown code fallback
  - URL generation for Meteocons CDN
  - Description formatting

- `update-readme.ts`
  - Marker detection and content replacement
  - Markdown pipe-table and HTML table format support (auto-detection)
  - Idempotency when content is identical; `FORCE_UPDATE` semantics
  - Refresh timestamp replacement
  - Error paths: missing file, read/write failures

- `preload.ts`
  - Env validation behavior and messages
  - Daily API call limit tracking and rollovers
  - Error logging on tracking write failure

---

## Mocking Environment Variables

Use `Bun.env` with bracket notation for proper mocking:

```ts
import { afterEach, beforeEach, describe, expect, test } from "bun:test";

describe("shouldProceedWithUpdate", () => {
  beforeEach(() => {
    // Clear environment before each test
    Bun.env["FORCE_UPDATE"] = undefined;
    Bun.env["GITHUB_ACTIONS"] = undefined;
  });

  afterEach(() => {
    // Clean up after each test
    Bun.env["FORCE_UPDATE"] = undefined;
    Bun.env["GITHUB_ACTIONS"] = undefined;
  });

  test("should return true when FORCE_UPDATE is true", () => {
    Bun.env["FORCE_UPDATE"] = "true";
    const result = shouldProceedWithUpdate("content", "content");
    expect(result).toBeTrue();
  });
});
```

> **Note**: Use `= undefined` instead of `delete` to satisfy Biome's `noDelete` performance rule.

---

## Reporters

Use Bun reporters via `--reporter` (e.g., `verbose`). Default reporter provides clear pass/fail output.

---

## CI usage

- `bun test --coverage` generates LCOV for SonarCloud
- Coverage thresholds guard quality; failing thresholds fail CI

---

## Troubleshooting

- Tests exit early or hang: ensure no real network/file I/O; use stubs
- Coverage missing files: verify `bunfig.toml` coverage settings and paths
- Path alias errors: ensure aliases match both `bunfig.toml` (preload root) and `tsconfig.json`
- Mock not working: use `as unknown as typeof fetch` for type casting

---

## References

- Bun Test: <https://bun.sh/docs/cli/test>
- Bun Test Configuration: <https://bun.sh/docs/runtime/bunfig>

# Unit Testing Guide

This guide explains how we write, run, and measure unit tests using Bun's built‑in test runner.

## Goals & principles

- Deterministic and fast: no real network or filesystem I/O in unit tests
- 100% coverage on core modules; CI threshold set to 90% global to avoid flakes
- Clear Arrange–Act–Assert structure, minimal mocking surface
- Small, focused tests that validate behavior and error handling

---

## Quickstart

- Run all tests: `bun test`
- Run all tests (watch): `bun test --watch`
- Coverage (text, html, lcov): `bun test --coverage`
- Run a specific file: `bun test tests/unit/services/fetchWeather.test.ts`
- Filter by name: `bun test -t "retries on transient error"`

HTML coverage is written to `coverage/`. Preview an exported HTML folder if present:

```bash
npx vite preview --outDir html
```

---

## Directory layout & naming

- Unit tests live under `tests/unit/**`. Fixtures and helpers live under `tests/fixtures` and `tests/utils`.
- File naming: `*.test.ts` or `*.spec.ts`.
- Colocate small tests when it improves readability; keep larger suites in `tests/unit/`.

---

## Environment & setup

Global setup file: `tests/setup.ts` (loaded via `bunfig.toml` `test.preload`).

- Sets `NODE_ENV=test` and safe defaults for: `OPEN_WEATHER_KEY`, `FORCE_UPDATE`, `GITHUB_ACTIONS`.
- Provides helpers for performance timing and temp file creation.
- Uses `bun:test` primitives like `beforeAll`, `afterAll`, `beforeEach`, `afterEach`.

Execution environment:

- Bun test runtime with isolated contexts.
- Timeouts and coverage thresholds are configured in `bunfig.toml` under the `[test]` section.

Aliases (if configured):

- Keep path usage consistent with `tsconfig.json` if using path aliases.

---

## Mocking strategy

- Use `mock` from `bun:test` to create function mocks.
- Replace `globalThis.fetch` with a small mock that validates URL, status, and returns `json()`/`text()`.
- Prefer minimal, behavior‑focused stubs over broad module mocks.
- Avoid real network and filesystem I/O in unit tests.

Example (simplified):

```ts
import { describe, expect, mock, test } from "bun:test";

// Example: mocking a dependency function
const ensureEnvironmentVariables = mock(() => Promise.resolve({ OPEN_WEATHER_KEY: "X".repeat(32) }));
const updateReadme = mock(() => Promise.resolve(true));

test("sets CHANGES_DETECTED=true on successful update", async () => {
  // Arrange mocks and call the unit under test
  // Assert on output signals or return values
  expect(await updateReadme()).toBe(true);
});
```

---

## Coverage & reporting

Coverage settings (see `bunfig.toml` `[test]`):

- Coverage enabled by default; Bun writes coverage artifacts to `coverage/`.
- Thresholds (global): 90% branches/functions/lines/statements.
- See `bunfig.toml` for `coverage`, `coverageSkipTestFiles`, and `coverageThreshold`.

Integration:

- SonarCloud consumes `coverage/lcov.info` when configured.

Raising the bar:

- Increase `coverageThreshold` in `bunfig.toml` to 1.0 for stricter gates.

---

## Writing new tests

Guidelines:

- One behavior per test; name with intent (e.g., "throws when API key missing").
- Keep asserts focused; prefer strict equality and specific messages.
- Validate both success paths and failure modes (network, schema, rate limit).
- Prefer shared factories/utilities from `tests/setup.ts` and `tests/utils`.

Typical pattern:

```ts
import { describe, expect, mock, test } from "bun:test";

describe("fetchWeatherData", () => {
  test("retries on transient error then succeeds", async () => {
    // arrange: first call fails, second succeeds
    // act: call function under test
    // assert: result is successful and call count matches
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
  - Marker detection and content replacement
  - Idempotency when content is identical; `FORCE_UPDATE` semantics
  - Fallbacks for empty description/icon, refresh timestamp replacement
  - Error paths: missing file, read/write failures
- `preload.ts`
  - Env validation behavior and messages
  - Daily API call limit tracking and rollovers
  - Error logging on tracking write failure

---

## Reporters

Use Bun reporters via `--reporter` (e.g., `verbose`). Custom reporters require a separate runner; keep defaults unless needed.

---

## CI usage

- `bun test --coverage` generates LCOV for SonarCloud.
- Global thresholds guard quality; failing thresholds fail CI.

---

## Troubleshooting

- Tests exit early or hang: ensure no real network/file I/O; use stubs.
- Coverage missing files: verify `bunfig.toml` coverage settings and paths.
- Path alias errors: ensure aliases match both `bunfig.toml` (preload root) and `tsconfig.json`.
- Timing flakiness: minimize reliance on real timers; isolate retry behavior and assert outcomes.

---

## References

- Bun Test: <https://bun.sh/docs/cli/test>
- Bun Test Configuration: <https://bun.sh/docs/runtime/bunfig>

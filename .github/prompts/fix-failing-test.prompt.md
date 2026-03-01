---
name: "fix-test"
description: "Diagnose and fix a failing Bun test"
argument-hint: "test file path or test name"
mode: "agent"
tools: ["codebase", "readFile", "writeFile", "runCommand"]
---

Diagnose and fix the failing test at `$input`.

## Diagnosis steps

1. Run `bun test $input --reporter=verbose` and capture the full output.
2. Read the failing test file.
3. Read the corresponding source file being tested.
4. Read `src/tests/setup.ts` for available helpers.
5. Identify the root cause — check for these common failure patterns first:

## Common failure patterns in this project

**Wrong log capture:**
```ts
// Wrong — won't capture log() output
jest.spyOn(console, "log");

// Correct — log() writes to process.stdout.write
process.stdout.write = (chunk: string) => { calls.push(chunk); return true; };
```

**Wrong Temporal mock (dot notation causes TS4111):**
```ts
// Wrong
Temporal.Now.zonedDateTimeISO = mockFn;

// Correct — bracket notation required
(Temporal.Now as Record<string, unknown>)["zonedDateTimeISO"] = mockFn;
```

**Wrong API mock shape (OpenWeatherMap vs Open-Meteo):**
```ts
// Wrong — old OpenWeatherMap shape
{ lat, lon, timezone, current: { weather: [{ id, main }] } }

// Correct — Open-Meteo shape
{ current: { temperature_2m, relative_humidity_2m, weather_code, is_day },
  daily: { sunrise: [], sunset: [] }, utc_offset_seconds }
```

**Leaked mock state between tests:**
```ts
// Ensure afterEach restores all mocks and clears captured arrays
afterEach(() => {
  process.stdout.write = origStdout;
  capturedLogs.length = 0;
  (Temporal.Now as Record<string, unknown>)["zonedDateTimeISO"] = origTemporal;
});
```

**Bun.env is read-only in production (use process.env in tests):**
```ts
// In tests only — Bun.env is read-only
process.env.MY_VAR = "test-value";
// cleanup in afterEach
delete process.env.MY_VAR;
```

## Fix and verify

After applying the fix:
```bash
bun test $input --reporter=verbose  # target test must pass
bun test --coverage                  # full suite must still be 100%
bun run typecheck                    # must be clean
```

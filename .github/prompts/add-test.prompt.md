---
name: "add-test"
description: "Write a complete Bun test file for a source module"
argument-hint: "path to source file (e.g. src/weather-update/services/fetch-weather.ts)"
mode: "agent"
tools: ["codebase", "readFile", "writeFile"]
---

Write a comprehensive Bun test file for the module at `$input`.

## Steps

1. Read the source file at `$input` to understand all exported functions, types, and branches.
2. Determine the correct output path: `src/tests/unit/<mirrored-path>.test.ts`
3. Read `src/tests/setup.ts` to understand `testUtils`, `testConfig`, and available helpers.
4. Write the test file following all rules below.

## Required test patterns

**Imports:**
```ts
import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { testUtils, testConfig } from "../../setup"; // adjust relative path
```

**Log capture** (required whenever the module calls `log()`):
```ts
const stdoutCalls: string[] = [];
const origStdout = process.stdout.write.bind(process.stdout);
beforeEach(() => { process.stdout.write = (c: string) => { stdoutCalls.push(c); return true; }; });
afterEach(() => { process.stdout.write = origStdout; stdoutCalls.length = 0; });
```

**Temporal mock** (required if the module uses `Temporal.Now`):
```ts
import { Temporal } from "@js-temporal/polyfill";
const orig = Temporal.Now.zonedDateTimeISO;
beforeEach(() => { (Temporal.Now as Record<string, unknown>)["zonedDateTimeISO"] = () => mockZdt; });
afterEach(() => { (Temporal.Now as Record<string, unknown>)["zonedDateTimeISO"] = orig; });
```

**Open-Meteo fetch mock** (required if the module calls the API):
```ts
const mockFetch = mock(() =>
  Promise.resolve(new Response(JSON.stringify({
    current: { temperature_2m: 25, relative_humidity_2m: 60, weather_code: 0, is_day: 1 },
    daily: { sunrise: [1_704_153_600], sunset: [1_704_196_800] },
    utc_offset_seconds: 21_600,
  }), { status: 200 }))
);
global.fetch = mockFetch;
```

**Temp files** (required if the module reads/writes files):
```ts
await using file = await testUtils.fs.createDisposableTempFile("initial content", "test.md");
// file.path — auto-deleted when scope exits
```

## Coverage target

Every exported function must have at least one test. All conditional branches (if/else, try/catch, early returns) must be exercised. The file must contribute to 100% line and function coverage when run via `bun test --coverage`.

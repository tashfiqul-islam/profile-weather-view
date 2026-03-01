---
applyTo: "**/*.ts"
---

# TypeScript Rules — profile-weather-view

## Imports

- ESM only — `import`/`export`; never `require()`, `module.exports`, or `.cjs` syntax
- Every imported package must be in `package.json` (`linker = "isolated"` surfaces phantom deps as errors)
- Date/time: always `import { Temporal } from "@js-temporal/polyfill"` — never `new Date()` or native `Temporal`
- File I/O: `Bun.file()` / `Bun.write()` — never `import fs from "node:fs/promises"`
- Environment: `Bun.env.VARIABLE` — never `process.env.VARIABLE` (read-only in production; only use `process.env` writes in tests)

## Types

- Strict flags active: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `strictNullChecks`
- Config objects: `as const satisfies T` — not just `as const` and not just `satisfies`
- Never use `any` or `// @ts-ignore` — fix the underlying type issue
- Zod v4 schemas: `.meta({ description: "..." })` not `.describe()` (removed in Zod v4)

## Logging

All output must go through the shared logger — never raw console:

```ts
import { log } from "../utils/logger"; // or relative path as needed

log("Weather fetched successfully", "success");
log("Rate limit reached", "warning");
log("API request failed", "error");
log("Processing WMO code 61", "info");
```

Levels: `"info"` | `"success"` | `"warning"` | `"error"`

## Key Patterns

```ts
// Config objects
const LOCATION = {
  lat: 23.8759,
  lon: 90.3795,
  timezone: "Asia/Dhaka",
} as const satisfies LocationConfig;

// Zod v4 schema
const WeatherSchema = z.object({
  temperature: z.number().meta({ description: "Current temperature in °C" }),
  code: z.number().int().meta({ description: "WMO weather code" }),
});

// Temporal (polyfill only — never native)
import { Temporal } from "@js-temporal/polyfill";
const now = Temporal.Now.zonedDateTimeISO("Asia/Dhaka");
const today = Temporal.Now.plainDateISO("UTC").toString(); // "2026-03-01"

// Bun-native file I/O
const content = await Bun.file(path).text();
await Bun.write(path, updatedContent);
```

## Forbidden Patterns

```ts
// ❌ Never
import "dotenv/config";
console.log("...");
console.error("...");
import fs from "node:fs/promises";
const now = new Date();
const ts = Temporal.Now.instant(); // native Temporal — Bun issue #15853
```

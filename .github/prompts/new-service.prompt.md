---
name: "new-service"
description: "Scaffold a new weather service file with its test"
argument-hint: "service name in kebab-case (e.g. cache-weather)"
mode: "agent"
tools: ["codebase", "readFile", "writeFile"]
---

Scaffold a new service module named `$input` for this project.

## Steps

1. Read `src/weather-update/services/fetch-weather.ts` and `src/weather-update/services/update-readme.ts` to understand the existing service patterns.
2. Read `src/weather-update/utils/logger.ts` to understand the `log()` API.
3. Create `src/weather-update/services/$input.ts` following all source rules.
4. Create `src/tests/unit/services/$input.test.ts` following all test rules.

## Source file rules (`src/weather-update/services/$input.ts`)

- ESM: named exports only unless a class default is required
- Import `{ log }` from `"../utils/logger"` — never `console.log/error`
- Import `{ Temporal }` from `"@js-temporal/polyfill"` for any date/time logic
- File I/O: `Bun.file(path).text()` / `Bun.write(path, content)` — not `node:fs`
- Config: `as const satisfies T` for any configuration objects
- Zod v4 for runtime validation: `.meta({ description: "..." })` not `.describe()`
- No `dotenv` — use `Bun.env.VARIABLE` directly

## Test file rules (`src/tests/unit/services/$input.test.ts`)

Follow `.github/instructions/tests.instructions.md`:
- `bun:test` imports only
- Capture `process.stdout.write` / `process.stderr.write` for log assertions
- Mock Temporal.Now with bracket notation if the service uses it
- Use Open-Meteo mock shape if the service calls the API
- `await using` for temp files via `testUtils.fs.createDisposableTempFile`
- Restore all mocks in `afterEach`
- 100% line and function coverage of the new service file

## After scaffolding

Run:
```bash
bun run typecheck && bun test --coverage && bun run lint src/
```
All three must pass before the files are considered complete.

# GitHub Copilot Instructions — profile-weather-view

## Stack
- **Runtime**: Bun 1.3.10 | **Language**: TypeScript 5.9.3 (strict) | **Linter**: Biome 2.4.4 / Ultracite 7.2.4
- **Testing**: Bun built-in test runner | **Validation**: Zod v4.3.6 | **Time**: @js-temporal/polyfill 0.5.1

## Code Style Rules
- ESM only (`import`/`export`); no CommonJS
- TypeScript strict mode: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` enabled
- Zod v4: use `.meta({ description: "..." })` — NOT `.describe()`
- All logging via `log(message, level)` from `src/weather-update/utils/logger.ts` — no raw `console.log/error`
- Prefer `as const satisfies T` for config objects

## Testing
- Framework: `bun test` only (99 tests, 100% coverage enforced)
- Log capture: `process.stdout.write` / `process.stderr.write`, NOT `console.log`
- Temporal.Now mock: `(Temporal.Now as Record<string, unknown>)["zonedDateTimeISO"] = mockFn`
- Open-Meteo API mock shape: `{ current: { temperature_2m, relative_humidity_2m, weather_code, is_day }, daily: { sunrise: [], sunset: [] }, utc_offset_seconds }`

## Critical Rules
- **Never use native Temporal** — Bun does not support it (issue #15853); always use `@js-temporal/polyfill`
- **Never use `console.log/error`** — use `log()` from utils/logger.ts
- **Never bump versions manually** — semantic-release handles versioning
- **Commit with `-m` flag** — `git commit -m "type(scope): description"`; `czg` is interactive
- **`linker = "isolated"` in bunfig.toml** — all imports must be in `package.json`

## Architecture
```
index.ts → preload.ts → fetch-weather.ts → wmo-mapper.ts → update-readme.ts
```
Each file in `src/weather-update/` has a corresponding test in `src/tests/unit/`.

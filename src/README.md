# `src/`

The weather job itself: fetch current conditions from Open-Meteo, render them into the marked
section of a README, and report the run. About 450 lines of TypeScript plus colocated tests, run
directly by Bun (no build step).

## One run

`bun start` executes [`index.ts`](index.ts), which drives these steps in order. Any failure stops
the run with exit code 1 and a single readable error line.

```text
+------------------ [ ONE RUN ] -------------------+
|                                                  |
| 1  Validate the path        index.ts             |
|    PROFILE_README_PATH must be a .md file.       |
| │                                                |
| 2  Fetch                    http.ts              |
|    15 s per attempt, 4 attempts, jittered.       |
| │                                                |
| 3  Validate and transform   weather.ts           |
|    One Zod schema: JSON → Weather.               |
| │                                                |
| 4  Render                   readme.ts            |
|    renderReadme: pure, clock passed in.          |
| │                                                |
| 5  Write                                         |
|    readme.ts patches; summary.ts reports.        |
|                                                  |
+--------------------------------------------------+
```

## Modules

Each module is a **pure core** (all inputs, including the clock, are parameters) or a thin
**I/O shell** around one. Cores hold the logic and the tests; shells only read, write, and call.

| Module                         | Kind       | Public surface                                   |
| ------------------------------ | ---------- | ------------------------------------------------ |
| [`index.ts`](index.ts)         | shell      | `main(path)`, `run()`: the CLI and exit code     |
| [`weather.ts`](weather.ts)     | core       | `fetchWeather()`, `Weather`: schema + transform  |
| [`http.ts`](http.ts)           | shell      | `fetchWithRetry()`, `parseRetryAfter()`          |
| [`readme.ts`](readme.ts)       | core+shell | `renderReadme()` (pure), `updateReadme()` (file) |
| [`meteocons.ts`](meteocons.ts) | core       | `wmoToMeteocon()`, `meteoconUrl()`, icon types   |
| [`summary.ts`](summary.ts)     | core+shell | `renderSummary()` (pure), `writeSummary()`       |
| [`time.ts`](time.ts)           | core       | `formatClock()`, `formatTimestamp()`, offsets    |
| [`log.ts`](log.ts)             | shell      | `log()`: the only logger                         |
| [`config.ts`](config.ts)       | data       | `LOCATION`: coordinates and display timezone     |
| [`env.d.ts`](env.d.ts)         | types      | Every environment variable the app reads         |

Every module opens with a `@module` overview and documents each export in TSDoc; hovering any
symbol in an editor shows the contract.

## Invariants

- **One network seam.** Outbound HTTP goes through `fetchWithRetry`; a bare `fetch` once hung for
  222 s and failed a scheduled run.
- **No remote text reaches the README.** Descriptions come from the WMO table in `meteocons.ts`;
  everything else is a number or a time formatted here.
- **Stale weather never gets a fresh stamp.** `renderReadme` throws if the markers are missing or
  there is nothing to fill, so the run fails instead of lying.
- **Importing has no side effects.** Only `bun start` (`import.meta.main`) runs anything.

## Common changes

| To…                      | Change                                                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Track another city       | `LOCATION` in [`config.ts`](config.ts); the timezone drives both the API request and every rendered time                         |
| Map a new WMO code       | Add a row to `WMO_CODES` in [`meteocons.ts`](meteocons.ts); the compiler then asks for its night icon in `NIGHT`                 |
| Read a new env var       | Declare it in [`env.d.ts`](env.d.ts), then use `Bun.env.NAME`                                                                    |
| Show a new weather value | Request it in `FORECAST_URL`, validate it in `OpenMeteoResponse`, add it to `Weather`, render it in `readme.ts` and `summary.ts` |

## Tests

Tests sit next to their module (`http.ts` → `http.test.ts`) and go through the module's public
surface. [`test-utils.ts`](test-utils.ts) holds the shared fakes: `mockFetch`, `silence`,
`tempReadme`, and fixtures. The gate requires **100 %** line, function and statement coverage.

```sh
bun test                 # everything, randomized order
bun test src/readme      # one module
bun run check            # the full gate: types, lint, format, tests
```

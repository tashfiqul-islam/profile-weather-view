# GitHub Copilot Instructions — profile-weather-view

TypeScript/Bun automation that fetches real-time weather from Open-Meteo (no API key) and patches a GitHub profile README 3× daily via GitHub Actions.

> **All versions are in `package.json`** — never hardcode them here.

## Stack

| Tool                  | Purpose                                            |
| --------------------- | -------------------------------------------------- |
| Bun                   | Runtime + test runner + package manager            |
| TypeScript            | Strict mode + `erasableSyntaxOnly` (TS 7.0 stable) |
| oxlint / oxfmt        | Linting + formatting                               |
| Bun built-in          | Test runner (100% function coverage enforced)      |
| Zod v4                | Schema validation with `.meta()` API               |
| @js-temporal/polyfill | Date/time (Bun lacks native Temporal)              |

## Architecture

```
config.ts → index.ts → preload.ts → fetch-weather.ts → wmo-mapper.ts → update-readme.ts
```

Each `src/weather-update/` file has a 1:1 test in `src/tests/unit/`.

## Hard Rules (never violate)

- **No native Temporal** — Bun issue #15853; always `import { Temporal } from "@js-temporal/polyfill"`
- **No `console.log/error`** — use `log(message, level)` from `src/weather-update/utils/logger.ts`
- **No version bumps** — semantic-release drives versioning from commit messages
- **No CommonJS** — ESM only (`import`/`export`); no `require()` or `.cjs`
- **No enums or parameter properties** — `erasableSyntaxOnly: true` in tsconfig.json
- **No phantom deps** — `linker = "isolated"` in bunfig.toml; every import must be in `package.json`
- **No `czg` in scripts** — it's interactive; always `git commit -m "type(scope): description"`

## Code Style

- TypeScript 7.0 stable: `erasableSyntaxOnly`, `verbatimModuleSyntax`, no `baseUrl`, no `isolatedModules`
- Zod v4: `.meta({ description: "..." })` — NOT `.describe()` (removed in v4)
- Config objects: `as const satisfies T`
- Branded types: manual intersection (`number & { readonly __brand: unique symbol }`)
- File I/O: `Bun.file()` / `Bun.write()` — not `node:fs`
- Shared constants in `src/weather-update/config.ts`

## Testing

- `bun test` only — never Jest, Vitest, or other runners
- Coverage: `function=1.0, line=0.99, statement=0.99`
- Log capture: mock `process.stdout.write` / `process.stderr.write`, not `console.log`
- Temporal mock: `(Temporal.Now as Record<string, unknown>)["zonedDateTimeISO"] = mockFn`
- Open-Meteo mock: `{ current: { temperature_2m, relative_humidity_2m, weather_code, is_day }, daily: { sunrise: [], sunset: [] }, utc_offset_seconds }`

## Key Commands

```bash
bun run typecheck     # tsc --noEmit (must be clean)
bun run lint          # oxlint check
bun run format        # oxfmt fix
bun test              # 131 tests, seed=42
bun run check         # typecheck + lint + test (full gate)
```

## Environment

| Variable              | Purpose                                |
| --------------------- | -------------------------------------- |
| `PROFILE_README_PATH` | Path to the profile README to patch    |
| `FORCE_UPDATE`        | Bypass change detection, always commit |
| `GITHUB_ACTIONS`      | Set by GHA; changes log output format  |

> Path-specific rules: see `.github/instructions/` for TypeScript, test, and workflow rules.
> Reusable prompts: see `.github/prompts/` for `/add-test` and `/new-service` slash commands.

---
name: profile-weather-view-patterns
description: Coding patterns extracted from profile-weather-view — a Bun/TypeScript utility that fetches weather data and updates a GitHub profile README
version: 1.0.0
source: local-git-analysis
analyzed_commits: 200
---

# profile-weather-view Patterns

## Commit Conventions

This project strictly follows **conventional commits** with scope:

| Type | Usage | Frequency |
|------|-------|-----------|
| `chore` | Dependency updates, releases | 64% |
| `fix` | Bug fixes, config corrections | 19.5% |
| `feat` | New features | 4.5% |
| `docs` | Documentation updates | 4.5% |
| `test` | Test infrastructure changes | 2% |
| `refactor` | Code restructuring | 1.5% |
| `ci` | Workflow changes | 1.5% |
| `perf` | Performance improvements | 0.5% |

### Format

```
<type>(<scope>): <description>
```

Common scopes: `deps`, `core`, `config`, `ci`, `actions`, `release`, `test`, `utils`, `types`

### Automated Commits

- **Renovate bot**: `chore(deps): Update <package> <version> [skip actions] (#PR)`
- **semantic-release**: `chore(release): <version> [skip ci]`
- **sync-readme**: `docs(readme): sync tech stack badges and footer date [skip actions]`

## Code Architecture

```
src/
├── weather-update/
│   ├── config.ts                         # Shared constants (DISPLAY_TIMEZONE)
│   ├── index.ts                          # Orchestrator — main entry point
│   ├── services/
│   │   ├── fetch-weather.ts              # Open-Meteo API fetch + Zod validation
│   │   ├── update-readme.ts              # README section patching
│   │   └── wmo-mapper.ts                 # WMO code → Meteocon icon mapping
│   └── utils/
│       ├── logger.ts                     # ANSI-colored log(message, level) utility
│       └── preload.ts                    # Rate limiter + env validation
├── scripts/
│   └── sync-readme-tech-stack.ts         # Badge version sync from package.json
└── tests/
    ├── setup.ts                          # Global test setup, testUtils, testConfig
    ├── utils/
    │   └── weather-test-helpers.ts       # Mock builders for weather data
    └── unit/
        ├── basic.test.ts                 # Core infrastructure tests
        ├── config.test.ts                # Shared config tests
        ├── index.test.ts                 # Orchestrator tests
        ├── services/
        │   ├── fetch-weather.test.ts     # API fetch tests
        │   ├── update-readme.test.ts     # README patching tests
        │   └── wmo-mapper.test.ts        # WMO mapping tests
        └── utils/
            ├── logger.test.ts            # Logger routing tests
            └── preload.test.ts           # Preload/rate-limiter tests
```

### Naming Conventions

- **Source files**: `kebab-case.ts` (e.g., `fetch-weather.ts`, `wmo-mapper.ts`)
- **Test files**: Mirror source path with `.test.ts` suffix
- **Test helpers**: Placed in `tests/utils/` with descriptive names

### Data Flow

```
index.ts → preload.ts → fetch-weather.ts → wmo-mapper.ts → update-readme.ts
```

## Workflows

### Adding a New Service

1. Create `src/weather-update/services/<service-name>.ts`
2. Use Zod schemas with `.meta({ description: "..." })` for validation
3. Use branded types for domain values
4. Route all logging through `utils/logger.ts` — no raw `console.*`
5. Add tests at `src/tests/unit/services/<service-name>.test.ts`
6. Wire into `index.ts` orchestrator

### Modifying Weather Data Shape

1. Update Zod schema in `fetch-weather.ts`
2. Update mock shape in `tests/utils/weather-test-helpers.ts`
3. Update tests in `unit/services/fetch-weather.test.ts`
4. Update consumers: `update-readme.ts`, `wmo-mapper.ts`
5. Run `bun run check` (typecheck + lint + test)

### Updating GitHub Actions

1. Pin action SHAs — never use `@latest` or floating tags
2. Update all workflows in `.github/workflows/` that use the action
3. Use `ubuntu-24.04` (not `ubuntu-latest`) for reproducibility
4. Pin tool versions (match `package.json` — never use `@latest`)

### Dependency Updates

Renovate automates most updates with format:
```
chore(deps): Update <package> <version> [skip actions] (#PR)
```

Manual dependency changes:
1. Update `package.json`
2. Run `bun install` to update `bun.lock`
3. Run `bun run check` to verify nothing breaks
4. Commit with `chore(deps): <description>`

## Testing Patterns

- **Framework**: `bun test` (not jest, vitest, or others)
- **Coverage**: `function=1.0, line=0.99, statement=0.99` via `coverageThreshold` in `bunfig.toml`
- **Test randomization**: `randomize = true, seed = 42`
- **No `test.only()`** — enforced by randomization config

### Key Testing Patterns

| Pattern | Implementation |
|---------|----------------|
| Log capture | Intercept `process.stdout.write` / `process.stderr.write` |
| Temporal mocking | Patch via `(Temporal.Now as Record<string, unknown>)["zonedDateTimeISO"]` |
| Temp files | `createDisposableTempFile()` with `await using` + `Symbol.asyncDispose` |
| Weather mocks | Use Open-Meteo shape: `{ current: {...}, daily: {...}, utc_offset_seconds }` |

### Test File Organization

- `setup.ts` — Global hooks, `testUtils`, `testConfig`
- `weather-test-helpers.ts` — Mock builders (centralized, not per-test)
- Unit tests mirror `src/weather-update/` folder structure under `tests/unit/`

## File Co-change Patterns

Files that typically change together:

| Change Group | Files |
|-------------|-------|
| Weather service | `fetch-weather.ts` + `weather-test-helpers.ts` + `fetch-weather.test.ts` |
| README patching | `update-readme.ts` + `update-readme.test.ts` |
| Preload/config | `preload.ts` + `preload.test.ts` + `bunfig.toml` |
| CI workflows | All 4 `.github/workflows/*.yml` files together |
| Dependencies | `package.json` + `bun.lock` |
| Releases | `CHANGELOG.md` + `package.json` |

## Technology Stack

> All versions are defined in `package.json` — check there for current values.

| Tool | Purpose |
|------|---------|
| Bun | Runtime + test runner + package manager |
| TypeScript | Language (strict + `erasableSyntaxOnly`, TS 6.x) |
| Zod | Schema validation (v4, `.meta()` API) |
| Biome / Ultracite | Linting/formatting |
| Lefthook | Git hooks |
| semantic-release | Automated versioning (`conventionalcommits` preset) |
| Renovate | Dependency updates (pinned) |
| `@js-temporal/polyfill` | Temporal API (Bun lacks native support) |

## Configuration Conventions

- **`linker = "isolated"`** in `bunfig.toml` — phantom deps crash immediately
- **ESM only** — `import`/`export`; no `require()`, no CommonJS
- **TypeScript 6.x** — `erasableSyntaxOnly`, `verbatimModuleSyntax`, no `baseUrl`, no `isolatedModules`
- **Strict TypeScript** — `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`
- **No `isolatedDeclarations`** — incompatible with `noEmit: true`
- **Preload via CLI flag** — `--preload` on `start`/`dev` scripts only, not in bunfig.toml root
- **Release config** — `.releaserc.json` (not JS) with `conventionalcommits` preset
- **Commitlint config** — `commitlint.config.ts` (not `.mts`)

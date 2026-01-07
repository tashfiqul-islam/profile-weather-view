# Development Guide

This guide shows how to build, test, and verify changes locally with Bun and TypeScript, keeping CI parity.

## TL;DR

```bash
bun install                # install deps
bun run check              # typecheck, lint, test
bun run test:coverage      # writes LCOV to coverage/ (100% coverage)
bun run dev                # run the weather script locally (watch mode)
```

## Prerequisites

- Bun ≥ 1.3.5
- Node.js ≥ 22 (tooling in CI)

## Environment

No API key required — Open-Meteo provides free weather data.

Optional environment variables:

- `FORCE_UPDATE=true` to force writing the README section even if data is unchanged
- `PROFILE_README_PATH` to specify an alternate README file path
- `GITHUB_ACTIONS=true` set automatically in CI

## Install & run

```bash
bun install

# run orchestrator locally (watch mode)
bun run dev

# or run once
bun run start
```

## Quality

- Formatting/Linting (Ultracite/Biome):

  ```bash
  bun run format
  bun run lint
  ```

- Type-check:

  ```bash
  bun run typecheck
  ```

- Tests (Bun test runner, coverage via bunfig):

  ```bash
  bun test              # single pass
  bun test --coverage   # writes LCOV to coverage/
  ```

- Full CI-like check:

  ```bash
  bun run check
  ```

## Coverage expectations

- Target: 100% on statements, branches, functions, and lines
- Coverage settings and thresholds live in `bunfig.toml` under `[test]`
- LCOV output at `coverage/lcov.info`

## Test structure

Tests are organized under `src/tests/`:

```text
src/tests/
├── setup.ts                    # Global test setup
├── unit/
│   ├── basic.test.ts           # Infrastructure tests
│   ├── services/
│   │   ├── fetch-weather.test.ts
│   │   ├── update-readme.test.ts
│   │   └── wmo-mapper.test.ts
│   └── utils/
│       └── preload.test.ts
└── utils/
    └── weather-test-helpers.ts  # Shared test utilities
```

## Commit conventions

Use Conventional Commits (angular). Examples:

```text
feat(weather): add sunrise/sunset formatting
fix(ci): correct bun cache key
chore(deps): update zod to 4.x [skip actions]
```

You can use a guided prompt:

```bash
bun run commit
```

## Sonar & quality gates

- Sonar properties are in `sonar-project.properties`
- CI publishes LCOV from `coverage/lcov.info`

## README tech stack sync

- Manual sync (if needed locally):

  ```bash
  bun run sync-readme-tech-stack
  ```

- CI runs `.github/workflows/sync-readme-tech-stack.yml` automatically when `package.json`/`bun.lock` changes (e.g., Renovate). It updates flat-square version badges and the footer date with a signed commit.

## Troubleshooting

- Network errors: check internet connectivity; Open-Meteo may have temporary outages
- No README changes: ensure the markers exist in the target README
- Slow installs in CI: check `actions/cache` usage and `bun.lock` presence
- Coverage below 100%: ensure new code has tests; check `bunfig.toml` thresholds

## TypeScript Code Patterns

The codebase follows modern TypeScript patterns:

### Configuration with `satisfies`

```typescript
const LOCATION = {
  lat: 23.8759,
  lon: 90.3795,
  timezone: "Asia/Dhaka",
} as const satisfies LocationConfig;
```

### Named Zod Imports

```typescript
import { z } from "zod";  // Named import, no namespace

const Schema = z.object({ ... });
```

### Bun.env for Environment Access

```typescript
// Use Bun.env with bracket notation
const forceUpdate = Bun.env["FORCE_UPDATE"] === "true";
```

### Branded Types for Type Safety

```typescript
export type TemperatureCelsius = number & { readonly __brand: unique symbol };
export type TimeString = string & { readonly __brand: unique symbol };
```

### Structured Logging

```typescript
const LOG_PREFIXES: Readonly<Record<LogLevel, string>> = {
  info: "ℹ️",
  success: "✅",
  warning: "⚠️",
  error: "❌",
} as const;
```

## README Format Support

The weather updater supports two table formats (auto-detected):

### Markdown pipe-table

```markdown
<!-- Hourly Weather Update -->
| Weather | Temperature | Sunrise | Sunset | Humidity |
| ------- | ----------- | ------- | ------ | -------- |
| ☀️ Clear | 25°C | 06:00 | 18:00 | 65% |
<!-- End of Hourly Weather Update -->
```

### HTML table

```html
<!-- Hourly Weather Update -->
<td align="center">Clear <img src="..."></td>
<td align="center">25°C</td>
<td align="center">06:00</td>
<td align="center">18:00</td>
<td align="center">65%</td>
<!-- End of Hourly Weather Update -->
```

Both formats require the `<!-- Hourly Weather Update -->` markers.

## Project layout

See the full structure in the root README: [Project structure](../../README.md#project-structure)

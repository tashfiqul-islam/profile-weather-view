# Scripts Reference

This document catalogs the package scripts, their purpose, and how they interact with CI. Run scripts using Bun:

```bash
bun run <script>
```

## Environment variables

- `OPEN_WEATHER_KEY`: OpenWeather API key (required for runtime, not for unit tests)
- `FORCE_UPDATE`: `true` to force a README write even if data is unchanged
- `PROFILE_README_PATH`: path to a specific README to update
- `GITHUB_ACTIONS`: implicitly set in CI; affects logging/reporting

## Development

| Script | Purpose | When to use | CI |
|---|---|---|---|
| `dev` | Run the weather script directly (no build) | Local development | No |
| `start` | Build then run the weather script | Manual production-like run | No |

## Build

| Script | Purpose | When to use | CI |
|---|---|---|---|
| `build` | Bundle `index.ts` to `dist/` | Prep an artifact | Yes (indirect) |
| `build:prod` | Minified production build | Release-grade bundle | Optional |

## Testing

| Script | Purpose | When to use | CI |
|---|---|---|---|
| `test` | Run all tests with Bun’s test runner | Local runs | Yes (variant) |
| `test:ci` | One-shot tests (non-watch) | CI and local verification | Yes |
| `test:watch` | Watch mode | Fast iteration | No |
| `test:coverage` | Coverage (text, lcov) | Validate coverage locally | Yes |
| `test:staged` | Run tests for staged files | Pre-commit focused checks | Optional |

Notes

- Coverage: Bun writes text and LCOV to `coverage/` (e.g., `coverage/lcov.info`).
- `test:staged` uses a POSIX pipeline (works in Git Bash on Windows). If it doesn’t match your shell, use `test:ci`.

## Quality

| Script | Purpose | When to use | CI |
|---|---|---|---|
| `lint` | Ultracite lint (with fixes) | Local cleanup | Yes |
| `lint:check` | Lint without applying fixes | CI check | Yes |
| `format` | Ultracite format | Local formatting | Yes |
| `format:check` | Format check only | CI check | Yes |
| `type-check` | `tsc --noEmit` | Validate types | Yes |
| `check` | Lint + format | Quick local hygiene | Optional |
| `check-all` | Type, format:check, lint:check, tests | CI parity locally | Yes |
| `format-all` | Type-check → tests → format → lint | Hardening pass locally | Optional |

## Security & maintenance

| Script | Purpose | When to use | CI |
|---|---|---|---|
| `security` | Biome security check (`biome check --apply`) | Periodic hardening | Optional |
| `audit` | Bun audit | Dependency issues | Optional |
| `validate-deps` | Validates dependency graph invariants | Repo hygiene | Optional |

## Release & docs automation

| Script | Purpose | When to use | CI |
|---|---|---|---|
| `semantic-release` | Runs semantic-release | Release workflow | Yes |
| `sync-readme-tech-stack` | Updates README tech badges and footer date | Invoked by CI on dependency changes | Yes |

## Git helpers

| Script | Purpose |
|---|---|
| `prepare` | Initializes Husky hooks |
| `commit` | Commitizen prompt (`bunx commit`) |
| `preinstall` | Enforces Bun as the package manager |
| `postinstall` | Runs `prepare` after install |

## Typical local flows

- Quick validation before pushing:

  ```bash
  bun run check-all
  ```

- Run the script locally with your API key:

  ```bash
  export OPEN_WEATHER_KEY=your_api_key
  bun run dev
  ```

- Investigate coverage locally:

  ```bash
  bun run test:coverage
  ```

## CI interaction

- The “Profile Weather Update” workflow may run `lint`, `type-check`, and `test` before updating a README in your profile repo
- The “Semantic Release” workflow runs `semantic-release` to cut versions and maintain `CHANGELOG.md`
- The “README Tech Stack Sync” workflow runs `sync-readme-tech-stack` on dependency updates (e.g., Renovate)

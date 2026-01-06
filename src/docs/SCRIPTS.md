# Scripts Reference

This document catalogs the package scripts, their purpose, and how they interact with CI. Run scripts using Bun:

```bash
bun run <script>
```

## Environment variables

- `FORCE_UPDATE`: `true` to force a README write even if data is unchanged
- `PROFILE_README_PATH`: path to a specific README to update
- `GITHUB_ACTIONS`: implicitly set in CI; affects logging/reporting

Note: No API key required — Open-Meteo provides free weather data.

## Development

| Script | Purpose | When to use | CI |
| ------ | ------- | ----------- | -- |
| `dev` | Run the weather script with watch mode | Local development | No |
| `start` | Run the weather script once | Manual production-like run | No |

## Build

| Script | Purpose | When to use | CI |
| ------ | ------- | ----------- | -- |
| `build` | Bundle `index.ts` to `dist/` | Prep an artifact | Yes (indirect) |
| `build:prod` | Minified production build | Release-grade bundle | Optional |

## Testing

| Script | Purpose | When to use | CI |
| ------ | ------- | ----------- | -- |
| `test` | Run all tests with Bun's test runner | Local runs | Yes |
| `test:watch` | Watch mode | Fast iteration | No |
| `test:coverage` | Coverage (text, lcov) | Validate coverage locally | Yes |

Notes

- Coverage: Bun writes text and LCOV to `coverage/` (e.g., `coverage/lcov.info`)
- Target: 100% coverage on all files

## Quality

| Script | Purpose | When to use | CI |
| ------ | ------- | ----------- | -- |
| `lint` | Ultracite check | CI check | Yes |
| `format` | Ultracite fix | Local formatting | Yes |
| `typecheck` | `tsc --noEmit` | Validate types | Yes |
| `check` | Typecheck + lint + test | Full local validation | Yes |

## Release & docs automation

| Script | Purpose | When to use | CI |
| ------ | ------- | ----------- | -- |
| `release` | Runs semantic-release | Release workflow | Yes |
| `sync-readme-tech-stack` | Updates README tech badges and footer date | Invoked by CI on dependency changes | Yes |

## Git helpers

| Script | Purpose |
| ------ | ------- |
| `prepare` | Initializes Lefthook hooks |
| `commit` | Commitizen prompt (`bunx czg`) |

## Typical local flows

- Quick validation before pushing:

  ```bash
  bun run check
  ```

- Run the script locally:

  ```bash
  bun run dev
  ```

- Investigate coverage locally:

  ```bash
  bun test --coverage
  ```

## CI interaction

- The "Profile Weather Update" workflow runs `lint`, `typecheck`, and `test` before updating a README in your profile repo
- The "Semantic Release" workflow runs `release` to cut versions and maintain `CHANGELOG.md`
- The "README Tech Stack Sync" workflow runs `sync-readme-tech-stack` on dependency updates (e.g., Renovate)

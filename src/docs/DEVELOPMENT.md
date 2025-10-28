# Development Guide

This guide shows how to build, test, and verify changes locally with Bun and TypeScript, keeping CI parity.

## TL;DR

```bash
bun install                              # install deps
bun run check-all                        # type-check, format:check, lint:check, test:ci
bun run test:coverage                    # writes LCOV to coverage/ (100% on touched files)
bun run dev                              # run the weather script locally
```

## Prerequisites

- Bun ≥ 1.2.19
- Node.js ≥ 22 (tooling in CI)

## Environment

Set the OpenWeather key for local runs:

```bash
export OPEN_WEATHER_KEY=your_api_key
```

Optional:

- `FORCE_UPDATE=true` to force writing the README section even if data is unchanged

## Install & run

```bash
bun install

# run orchestrator locally
bun run dev

# or build then run
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
  bun run type-check
  ```

- Tests (Bun test runner, coverage via bunfig):

  ```bash
  bun run test:ci        # single pass
  bun run test:coverage  # writes LCOV to coverage/
  ```

- Full CI-like check:

  ```bash
  bun run check-all
  ```

## Coverage expectations

- Keep 100% on statements, branches, functions, and lines for changed files.
- Coverage settings and thresholds live in `bunfig.toml` under `[test]` (LCOV at `coverage/lcov.info`).

## Commit conventions

Use Conventional Commits (angular). Examples:

```text
feat(weather): add sunrise/sunset formatting
fix(ci): correct bun cache key
chore(deps): update axios to 1.11.0 [skip actions]
```

You can use a guided prompt:

```bash
bunx commit
```

## Sonar & quality gates

- Sonar properties are in `sonar-project.properties`.
- CI publishes LCOV from `coverage/lcov.info`.

## README tech stack sync

- Manual sync (if needed locally):

  ```bash
  bun run sync-readme-tech-stack
  ```

- CI runs `.github/workflows/sync-readme-tech-stack.yml` automatically when `package.json`/`bun.lock` changes (e.g., Renovate). It updates flat-square version badges and the footer date with a signed commit.

## Troubleshooting

- 401/403 from OpenWeather: verify `OPEN_WEATHER_KEY`.
- No README changes: ensure the markers exist in the target README.
- Slow installs in CI: check `actions/cache` usage and `bun.lock` presence.

## Project layout

See the full structure in the root README: [Project structure](../../README.md#project-structure).

<div align="center">
  <img src="/image/readme_cover.png" alt="Profile Weather View banner" width="900">
</div>

<h1 align="center">🌦️ Profile Weather View (v2)</h1>

<p align="center">
  Automate live weather on your GitHub profile using a modern TypeScript + Bun stack, robust CI/CD, strict quality gates, and zero‑maintenance dependency automation.
</p>

<p align="center">
  <a href="https://github.com/tashfiqul-islam/profile-weather-view/actions/workflows/profile-weather-update.yml">
    <img alt="Weather Update workflow" src="https://img.shields.io/github/actions/workflow/status/tashfiqul-islam/profile-weather-view/profile-weather-update.yml?style=flat&logo=github&label=weather%20update" />
  </a>
  <a href="https://github.com/tashfiqul-islam/profile-weather-view/actions/workflows/semantic-release.yml">
    <img alt="Release workflow" src="https://img.shields.io/github/actions/workflow/status/tashfiqul-islam/profile-weather-view/semantic-release.yml?style=flat&logo=githubactions&label=release" />
  </a>
  <a href="https://bun.sh">
    <img alt="Powered by Bun" src="https://img.shields.io/badge/powered%20by-bun-000?style=flat&logo=bun" />
  </a>
  <a href="#quality--testing">
    <img alt="Coverage 100%" src="https://img.shields.io/badge/coverage-100%25-brightgreen?style=flat&logo=vitest" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img alt="TypeScript" src="https://img.shields.io/badge/typescript-strict-3178C6?style=flat&logo=typescript&logoColor=white" />
  </a>
  <a href="CHANGELOG.md">
    <img alt="Changelog maintained" src="https://img.shields.io/badge/changelog-maintained-orange?style=flat&logo=keepachangelog" />
  </a>
  <a href="https://github.com/semantic-release/semantic-release">
    <img alt="semantic-release (angular)" src="https://img.shields.io/badge/semantic--release-angular-e10079?style=flat&logo=semantic-release" />
  </a>
  <a href="https://renovatebot.com">
    <img alt="Renovate Enabled" src="https://img.shields.io/badge/renovate-enabled-brightgreen?style=flat&logo=renovatebot" />
  </a>
  <a href="LICENSE">
    <img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue?style=flat&logo=opensourceinitiative" />
  </a>
</p>

---

## TL;DR

- Schedules a workflow 3× daily to fetch current weather (OpenWeather One Call 3.0) and update your profile `README.md`.
- Built with TypeScript (strict) on Bun for speed, with Zod validation, Temporal polyfill, and robust error handling.
  - Quality: 100% unit test coverage (v8 + LCOV), SonarCloud analysis, Ultracite (Biome) linting/formatting, commitlint.
- Delivery: GitHub Actions with caching, optional signed commits, and semantic-release for automated versioning.
- Dependencies: Renovate with chore commits that skip CI and do not tag releases.

---

## Features

- Runtime: Bun 1.2+ for fast startup and fetch performance
- Type-safety: TypeScript 5.x, Zod 4 schemas, strict `tsconfig` (null-safety, no implicit anys)
- Weather: OpenWeather One Call 3.0 (current) with retries and timeouts
- CI/CD: Two workflows
  - Profile Weather Update: schedules, validates, tests, updates profile README with optional signed commit
  - Semantic Release: conventional commits → automated releases and changelog
  - See detailed workflows: [WORKFLOWS.md](./src/docs/WORKFLOWS.md)
- Quality toolchain
  - Tests: Vitest (v8 coverage, LCOV at `coverage/lcov.info`), current coverage: 100%
  - Lint/format: Ultracite preset (Biome) via `biome.jsonc`
  - Commit standards: commitlint (Conventional Commits). See [COMMIT_CONVENTION.md](./src/docs/COMMIT_CONVENTION.md)
  - Code quality: SonarCloud (JS/TS analyzer, LCOV coverage)
- Releases: semantic-release (see [RELEASE.md](./src/docs/RELEASE.md))
 - Scripts: see [SCRIPTS.md](./src/docs/SCRIPTS.md)
 - Tests: see [UNIT_TESTS.md](./src/docs/UNIT_TESTS.md)
- Dependencies: Renovate with auto‑merge for safe updates and major‑update approvals

---

## Tech stack

<p>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=flat-square&logo=typescript&logoColor=white" /></a>
  <a href="https://bun.sh"><img alt="Bun" src="https://img.shields.io/badge/Bun-1.2.19-000000?style=flat-square&logo=bun&logoColor=white" /></a>
  <a href="https://vitest.dev/"><img alt="Vitest" src="https://img.shields.io/badge/Vitest-3.2.4-6E9F18?style=flat-square&logo=vitest&logoColor=white" /></a>
  <a href="https://github.com/colinhacks/zod"><img alt="Zod" src="https://img.shields.io/badge/Zod-4.0.15-3E67B1?style=flat-square" /></a>
  <a href="https://axios-http.com/"><img alt="Axios" src="https://img.shields.io/badge/Axios-1.11.0-5A29E4?style=flat-square&logo=axios&logoColor=white" /></a>
  <a href="https://github.com/tc39/proposal-temporal"><img alt="Temporal polyfill" src="https://img.shields.io/badge/Temporal-0.5.1-1F2A44?style=flat-square" /></a>
  <a href="https://vitejs.dev/"><img alt="Vite" src="https://img.shields.io/badge/Vite-7.1.0-646CFF?style=flat-square&logo=vite&logoColor=white" /></a>
  <a href="https://biomejs.dev/"><img alt="Biome" src="https://img.shields.io/badge/Biome-2.1.4-60A5FA?style=flat-square&logo=biome&logoColor=white" /></a>
  <a href="https://github.com/haydenbleasel/ultracite"><img alt="Ultracite" src="https://img.shields.io/badge/Ultracite-5.1.2-0B7285?style=flat-square" /></a>
  <a href="https://github.com/semantic-release/semantic-release"><img alt="semantic-release" src="https://img.shields.io/badge/semantic--release-24.2.7-e10079?style=flat-square&logo=semantic-release" /></a>
  <a href="https://github.com/renovatebot/renovate"><img alt="Renovate" src="https://img.shields.io/badge/Renovate-enabled-1A1F6C?style=flat-square&logo=renovatebot&logoColor=white" /></a>
  <a href="https://github.com/features/actions"><img alt="GitHub Actions" src="https://img.shields.io/badge/GitHub%20Actions-CI-2088FF?style=flat-square&logo=githubactions&logoColor=white" /></a>
  <a href="https://www.sonarsource.com/products/sonarcloud/"><img alt="SonarCloud" src="https://img.shields.io/badge/SonarCloud-configured-F3702A?style=flat-square&logo=sonarcloud&logoColor=white" /></a>
  <a href="https://openweathermap.org/api/one-call-3.0"><img alt="OpenWeather" src="https://img.shields.io/badge/OpenWeather-API-EE4B2B?style=flat-square&logo=openweather&logoColor=white" /></a>
</p>

---

## How it works

1. Workflow runs on a schedule (5:23, 13:23, 21:23 Asia/Dhaka) or manually.
2. Script `src/weather-update/index.ts` validates env, fetches current weather, formats output, and updates the target README section bounded by:
   - `<!-- Hourly Weather Update --> ... <!-- End of Hourly Weather Update -->`
3. If changes are detected (or forced), the workflow commits and pushes to your profile repo, optionally with GPG signing.

---

## Architecture

<div align="center">
  <img src="/image/architecture.png" alt="Profile Weather View Architecture diagram showing GitHub Actions triggering index.ts orchestrator which calls preload.ts, fetchWeather.ts, and updateReadme.ts" width="900">
  <p><em>High‑level data flow: GitHub Actions → orchestrator → weather service → README updater.</em></p>
</div>

See the detailed system design in [ARCHITECTURE.md](./src/docs/ARCHITECTURE.md).

---

## Example output on profile

Below is how the rendered section appears in the profile README after an update.

```markdown
## Current Weather in Uttara, Dhaka

| Weather | Temperature | Sunrise   | Sunset    | Humidity |
|---------|-------------|-----------|-----------|----------|
| Clear   | 32°C        | 06:12:30  | 18:15:45  | 65%      |

Last refresh: Saturday, April 20, 2025 14:30:22 UTC+6
```

The update replaces content between the markers:

```text
<!-- Hourly Weather Update -->
...generated table and timestamp...
<!-- End of Hourly Weather Update -->
```

You can style this section further in your profile repo; the generator focuses on content.

---

## Getting started

### Prerequisites

- Bun ≥ 1.2.19 (recommended)
- Node.js ≥ 22 (CI tooling)
- OpenWeather API key (free): `https://openweathermap.org/api`

### Install & Run locally

```bash
git clone https://github.com/tashfiqul-islam/profile-weather-view.git
cd profile-weather-view
bun install

# Provide your API key in the environment
export OPEN_WEATHER_KEY=your_api_key

# Run once locally
bun run dev
```

### Configure your profile repository

The workflow updates a profile README hosted at `PROFILE_REPO` (defaults to `tashfiqul-islam/tashfiqul-islam`). Change this in `.github/workflows/profile-weather-update.yml` if needed.

### Required GitHub secrets

Add these to your repository (Settings → Secrets and variables → Actions):

- `OPEN_WEATHER_KEY` (required): OpenWeather API key
- `PAT` (required): A Personal Access Token with `repo` scope to push to your profile repo

Optional (for signed commits):

- `GPG_PRIVATE_KEY`: ASCII‑armored private key
- `GPG_PASSPHRASE`: Passphrase for the key
- `GIT_COMMITTER_NAME`, `GIT_COMMITTER_EMAIL`: Identity for commits

---

## Configuration

### Weather location

Coordinates live in `src/weather-update/services/fetchWeather.ts`:

```ts
const LOCATION = { lat: '23.8759', lon: '90.3795' } as const;
```

Change these to your latitude/longitude. The script fetches only "current" data for speed and reliability.

### Environment variables

- `OPEN_WEATHER_KEY` (required)
- `FORCE_UPDATE` (optional): set to `true` in a manual run input to force a commit even when data is unchanged

---

## Workflows

### 1) Profile Weather Update (`.github/workflows/profile-weather-update.yml`)

- Schedule: 3× daily (Asia/Dhaka)
- Tooling: `oven-sh/setup-bun@v2`, `actions/setup-node@v4`
- Caching: `actions/cache@v4` keyed by `bun.lock`
- Quality gates (skippable via input): Ultracite lint, TS type‑check, Vitest
- Artifacts: uploads the updated README for traceability
- Commit: optional GPG signing; uses `PAT` to push to the profile repo

Manual inputs:

- `force_update` (boolean): force commit even if unchanged
- `skip_tests` (boolean): bypass quality steps for speed

### 2) Semantic Release (`.github/workflows/semantic-release.yml`)

- Trigger: push to `master` and manual dispatch (supports dry‑run)
- Runtime: Bun for install/cache, Node LTS for running semantic‑release
- Auth: uses `GITHUB_TOKEN` for release creation (no PAT required)
- Skip‑CI handling: commits with `[skip ci]`/`[skip actions]` are analyzed but won’t create a release
- SLSA provenance: optional generation for released assets

Release rules (from `.releaserc.js`):

- `feat:` → minor
- `fix:` → patch
- `chore(deps|actions|bun|dependencies):` → patch
- `chore:` (other) → no release
- `BREAKING CHANGE:` → major

---

### 3) README Tech Stack Sync (`.github/workflows/sync-readme-tech-stack.yml`)

- Trigger: on changes to `package.json` or `bun.lock` (Renovate merges included); manual dispatch supported
- Action: updates flat‑square tech stack badges in `README.md` with the latest versions and refreshes footer date
- Commit: signed commit as you (GPG), message includes `[skip actions]` to avoid loops
- Tooling: Bun + dependency cache keyed by `bun.lock`, concurrency guard per ref

---

## Dependency automation (Renovate)

Renovate (`renovate.json`) is configured to:

- Use semantic chore commits that intentionally skip CI: suffix/body `[skip actions]`
- Auto‑merge non‑major updates directly to the base branch (`automergeType: "branch"`)
- Require manual approval for majors (Dependency Dashboard)
- Auto‑merge vulnerability fixes promptly
- Group classes of dependencies (ESLint, Vitest, TypeScript, Actions) to reduce PR noise
- Maintain Bun versions via `customManagers` and regex managers

This preserves a clean release history: Renovate chore commits do not tag releases, and the release workflow recognizes skip‑CI semantics.

---

## Quality & testing

### Ultracite (Biome)

- Config: `biome.jsonc` (extends `ultracite`)
- Commands: `bunx ultracite lint` and `bunx ultracite format`
- JavaScript globals configured for Bun; file include rules; style/suspicious overrides where appropriate

### Vitest

- Config: `vitest.config.ts`
- Coverage: v8 provider; LCOV at `coverage/lcov.info` (used by SonarCloud); HTML report in `html/`
  - Preview local HTML report: `npx vite preview --outDir html`
- Coverage status (v2): 100% across statements, branches, functions, and lines
- CI enforcement: global thresholds ≥ 90% (see `coverage.thresholds.global` in `vitest.config.ts`)
- Optional (enforce 100% in CI): set thresholds to 100 and, if desired, enable `perFile: true` in `vitest.config.ts`

#### Coverage snapshot (v2)

```text
% Coverage report from v8
------------------|---------|----------|---------|---------|-------------------
File              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
------------------|---------|----------|---------|---------|-------------------
All files         |     100 |      100 |     100 |     100 |
 weather-update   |     100 |      100 |     100 |     100 |
  index.ts        |     100 |      100 |     100 |     100 |
 services         |     100 |      100 |     100 |     100 |
  fetchWeather.ts |     100 |      100 |     100 |     100 |
  updateReadme.ts |     100 |      100 |     100 |     100 |
 utils            |     100 |      100 |     100 |     100 |
  preload.ts      |     100 |      100 |     100 |     100 |
------------------|---------|----------|---------|---------|-------------------
```

| Metric      | Value             |
|-------------|-------------------|
| Statements  | 100% (620/620)    |
| Branches    | 100% (127/127)    |
| Functions   | 100% (28/28)      |
| Lines       | 100% (620/620)    |


### SonarCloud

- Config: `sonar-project.properties`
  - `sonar.sources=src/`
  - `sonar.tests=src/__tests__/`
  - `sonar.javascript.lcov.reportPaths=coverage/lcov.info`
  - `sonar.typescript.tsconfigPaths=tsconfig.json`
  - Exclusions for tests, benchmarks, d.ts

---

## Commit conventions (commitlint)

Conventional Commits enforced by `commitlint.config.mjs`.

Examples:

```text
feat(weather): add hourly icon rendering
fix(ci): correct cache key for bun.lock
chore(deps): update zod to 4.0.15 [skip actions]
docs(readme): improve setup section
```

Scopes include: `actions`, `bun`, `ci`, `config`, `core`, `deps`, `docs`, `perf`, `release`, `security`, `test`, `types`, `utils`, `weather`.

---

## Scripts

```bash
# Development
bun run dev            # run the weather script locally
bun run start          # build then run

# Build
bun run build          # production build
bun run build:prod     # minified build

# Testing
bun run test           # vitest watch
bun run test:ci        # run once
bun run test:coverage  # coverage (lcov, html, text)

# Quality
bun run lint           # ultracite lint (with fixes)
bun run lint:check     # lint check only
bun run format         # ultracite format
bun run type-check     # tsc --noEmit
bun run check-all      # type-check, format:check, lint:check, test:ci

# Security
bun run audit
bun run validate-deps

# Release
bun run semantic-release
```

---

## Project structure

```text
📦 profile-weather-view/
├─ 📁 .github/
│  └─ 📁 workflows/
│     ├─ 📄 profile-weather-update.yml
│     ├─ 📄 semantic-release.yml
│     └─ 📄 sync-readme-tech-stack.yml # auto-update README tech badges
├─ 📁 src/
│  ├─ 📁 __tests__/                         # test setup and unit tests
│  ├─ 📁 weather-update/
│  │  ├─ 📁 services/                       # fetchWeather, updateReadme
│  │  ├─ 📁 utils/                          # preload/env/rate-limit
│  │  └─ 📄 index.ts                        # orchestrator
│  └─ 📁 scripts/                           # validate-dependency-system.ts
├─ 📁 html/                                 # static coverage & reports preview
├─ 📁 image/                                # documentation images
├─ 📄 biome.jsonc                           # Ultracite/Biome config
├─ 📄 bunfig.toml                           # Bun runtime/test config
├─ 📄 renovate.json                         # Renovate config
├─ 📄 sonar-project.properties              # SonarCloud config
├─ 📄 tsconfig.json                         # TS strict config
├─ 📄 vitest.config.ts                      # test + coverage config
├─ 📄 README.md
├─ 📄 LICENSE
└─ 📄 package.json
```

---

## Contributing

- See the full guides:
  - [Contributing Guide](./src/docs/CONTRIBUTING.md)
  - [Development Guide](./src/docs/DEVELOPMENT.md)

Quick start:
1) Fork and clone
2) `bun install`
3) Create a branch and implement changes
4) Run checks: `bun run check-all`
5) Commit using Conventional Commits
6) Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```text
MIT License

Copyright (c) 2025 Tashfiqul Islam

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<br>

<p align="center">
  <strong>Thanks for visiting!</strong>
  <br>
  <em>Feedback and support are always welcome.</em>
  <br><br>
  <a href="https://github.com/tashfiqul-islam/profile-weather-view/issues/new?labels=bug&title=%5Bbug%5D%3A+">🐛 Report Bug</a>
  ·
  <a href="https://github.com/tashfiqul-islam/profile-weather-view/issues/new?labels=enhancement&title=%5Bfeature%5D%3A+">💡 Request Feature</a>
    ·
    <a href="https://github.com/sponsors/tashfiqul-islam">💖 Sponsor</a>
    ·
  <a href="https://github.com/tashfiqul-islam">🐦 Follow</a>
  <br>
  <sub>Last refresh: August 8, 2025</sub>
  <br>
  <a href="#-profile-weather-view-v2">↑ Back to top</a>
</p>


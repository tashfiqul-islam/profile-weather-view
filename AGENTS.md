# AGENTS.md — AI Agent Context for profile-weather-view

Universal agent context file. Compatible with Claude Code, OpenAI Codex, GitHub Copilot, Cursor, Aider, and other AI coding tools.

---

## Project Overview

**What it is**: TypeScript/Bun automation that fetches real-time weather from the Open-Meteo API (no API key) and patches a GitHub profile README every 8 hours.

**Runtime**: Bun 1.3.10 | **Language**: TypeScript 5.9.3 (strict) | **Version**: 3.1.3

**Key constraint**: This project writes to a *different* repository (`tashfiqul-islam/tashfiqul-islam`) from where it lives (`tashfiqul-islam/profile-weather-view`). Cross-repo push uses a PAT secret.

---

## Repository Structure

```
profile-weather-view/
├── src/
│   ├── weather-update/
│   │   ├── index.ts                    # Orchestrator — run this
│   │   ├── services/
│   │   │   ├── fetch-weather.ts        # Open-Meteo API + Zod parsing
│   │   │   ├── wmo-mapper.ts           # WMO code → Meteocon SVG icon
│   │   │   └── update-readme.ts        # Regex-patches README weather section
│   │   └── utils/
│   │       ├── logger.ts               # log(message, level) → stdout/stderr
│   │       └── preload.ts              # Rate limit check + env validation
│   ├── scripts/
│   │   └── sync-readme-tech-stack.ts   # Syncs badge versions from package.json
│   └── tests/
│       ├── setup.ts                    # testUtils, testConfig, global hooks
│       ├── utils/
│       │   └── weather-test-helpers.ts # Mock builders for weather data
│       └── unit/                       # Unit tests mirror src/ structure
├── .github/workflows/
│   ├── profile-weather-update.yml      # Main: schedule 3×/day, fetch + commit
│   ├── semantic-release.yml            # Release automation on push to master
│   ├── sync-readme-tech-stack.yml      # Badge sync on package.json changes
│   └── renovate-validation.yml         # Validate renovate.json on PR
├── CLAUDE.md                           # Claude Code specific instructions
├── AGENTS.md                           # This file
├── bunfig.toml                         # Bun runtime + test + install config
├── tsconfig.json                       # TypeScript strict config
├── lefthook.yml                        # Git hook definitions (pre-commit, commit-msg)
└── renovate.json                       # Dependency update automation
```

---

## Setup

```bash
# Prerequisites: Bun >= 1.3.10 (https://bun.sh)
bun install        # install all dependencies
```

No `.env` file needed for tests. For running the weather update locally, set:

```bash
export PROFILE_README_PATH="path/to/profile/README.md"
export GITHUB_ACTIONS="true"    # optional, changes output behavior
export FORCE_UPDATE="true"      # optional, bypasses change detection
```

---

## Build & Run

```bash
bun run start          # single weather update run
bun run dev            # watch mode (re-runs on file save)
bun run build          # bundle to dist/ (target: bun)
bun run build:prod     # bundle + minify
```

---

## Test Commands

```bash
bun test                                      # all tests (99 tests, randomized)
bun test src/tests/unit/basic.test.ts         # single test file
bun test --watch                              # watch mode
bun test --coverage                           # with coverage report (enforced 90%+ lines)
```

**Coverage is always enforced.** Do not disable `coverageThreshold` in `bunfig.toml`.

---

## Lint, Format & Typecheck

```bash
bun run typecheck      # tsc --noEmit (strict mode; must be clean)
bun run lint           # ultracite check (passes Biome 2.4.4 rules)
bun run lint src/      # lint specific directory
bun run format         # ultracite fix (auto-formats in place)
bun run check          # typecheck + lint + test (full gate)
```

All three must pass before any commit (enforced by lefthook pre-commit hook).

---

## Commit Guidelines

**CRITICAL**: Always use `git commit -m "message"`. The `czg` tool used in the commit-msg hook is interactive and will block in non-TTY environments.

Format: `type(scope): description`

Valid types: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `types` `chore` `revert` `security`

Examples:
```bash
git commit -m "fix(preload): correct Temporal.Now mock pattern in tests"
git commit -m "ci(actions): upgrade setup-bun to v2.1.2"
git commit -m "feat(wmo-mapper): add WMO code 77 snow grains mapping"
```

**Do not bump versions manually** — semantic-release drives this from commit messages.

---

## Architecture & Data Flow

```
GitHub Actions (cron: 3×/day)
  → index.ts (orchestrator)
      → preload.ts        checks rate limit (≤1000 calls/day) + validates env
      → fetch-weather.ts  GET open-meteo.com/v1/forecast (no API key required)
      → wmo-mapper.ts     maps weather_code + is_day to Meteocon SVG icon name
      → update-readme.ts  regex-patches <!-- Hourly Weather Update --> ... <!-- End --> block
  → GPG-signed git commit to profile repo
  → push via PAT to tashfiqul-islam/tashfiqul-islam
```

**Rate limiting**: `.api-calls.json` in project root tracks daily call count (max 1000). Resets at UTC midnight using Temporal.

---

## Key Libraries

| Package | Version | Purpose |
|---------|---------|---------|
| `@js-temporal/polyfill` | 0.5.1 | Date/time (Bun has no native Temporal yet) |
| `zod` | 4.3.6 | Runtime validation + branded types |
| `typescript` | 5.9.3 | Language (strict mode) |
| `@biomejs/biome` | 2.4.4 | Linting + formatting engine |
| `ultracite` | 7.2.4 | Opinionated Biome wrapper |
| `semantic-release` | 25.0.3 | Automated versioning + changelog |
| `lefthook` | 2.1.1 | Git hooks runner |
| `czg` | 1.12.0 | Interactive conventional commit prompt |

---

## Testing Patterns

### Log capture (preload tests)
```ts
// Capture log() output — NOT console.log
const stdoutCalls: string[] = [];
const stderrCalls: string[] = [];
process.stdout.write = (chunk: string) => { stdoutCalls.push(chunk); return true; };
process.stderr.write = (chunk: string) => { stderrCalls.push(chunk); return true; };
// Restore in afterEach
```

### Temporal.Now mock
```ts
import { Temporal } from "@js-temporal/polyfill";
// Bracket notation required (TS4111 with dot notation on index signature)
const orig = Temporal.Now.zonedDateTimeISO;
(Temporal.Now as Record<string, unknown>)["zonedDateTimeISO"] = (_tz: unknown) => mockZdt;
// afterEach:
(Temporal.Now as Record<string, unknown>)["zonedDateTimeISO"] = orig;
```

### Open-Meteo mock shape
```ts
// CORRECT — Open-Meteo format
createMockOpenWeatherResponse() → {
  current: { temperature_2m: 25, relative_humidity_2m: 60, weather_code: 0, is_day: 1 },
  daily: { sunrise: [unixTimestamp], sunset: [unixTimestamp] },
  utc_offset_seconds: 21_600
}
// WRONG — old OpenWeatherMap format (lat, lon, timezone, current.weather[])
```

### Disposable temp files
```ts
await using file = await testUtils.fs.createDisposableTempFile("content", "test.md");
// file.path — automatically cleaned up when scope exits
```

---

## GitHub Actions — Pinned Action SHAs

All 4 workflows use SHA-pinned actions. When updating, always pin to full commit SHA + version comment.

| Action | Version | SHA |
|--------|---------|-----|
| `actions/checkout` | v6.0.2 | `de0fac2e4500dabe0009e67214ff5f5447ce83dd` |
| `oven-sh/setup-bun` | v2.1.2 | `3d267786b128fe76c2f16a390aa2448b815359f3` |
| `actions/cache` | v5.0.3 | `cdf6c1fa76f9f475f3d7449005a359c84ca0f306` |
| `actions/setup-node` | v6.2.0 | `6044e13b5dc448c55e2357c09f80417699197238` |
| `actions/upload-artifact` | v7.0.0 | `bbbca2ddaa5d8feaa63e36b76fdaad77386f024f` |
| `actions/download-artifact` | v8.0.0 | `70fc10c6e5e1ce46ad2ea6f2b72d43f7d47b13c3` |
| `crazy-max/ghaction-import-gpg` | v6.3.0 | `e89d40939c28e39f97cf32126055eeae86ba74ec` |
| `actions/attest-build-provenance` | v4.1.0 | `a2bbfa25375fe432b6a289bc6b6cd05ecd0c4c32` |

- `bun-version` is pinned to `1.3.10` (not `latest`) in all Bun workflows
- `upload-artifact` and `download-artifact` must remain version-paired (v7/v8)
- All runners use `ubuntu-24.04` (explicit, not `ubuntu-latest`)

---

## Known Gotchas

1. **No native Temporal** — Bun issue #15853; always `import { Temporal } from "@js-temporal/polyfill"` never from globals
2. **Isolated linker** — `linker = "isolated"` in bunfig.toml; phantom dependencies cause runtime errors, not silent failures
3. **Preload scope** — `--preload` flag only on `start`/`dev` scripts in package.json; NOT the root bunfig.toml preload (removed). Test preload at `[test].preload = ["./src/tests/setup.ts"]` is separate.
4. **`isolatedDeclarations` blocked** — requires `declaration: true` or `composite: true`; incompatible with `noEmit: true`
5. **UTC offset is dynamic** — `update-readme.ts` derives it from `now.offset` (Temporal property); hardcoded `"UTC+6"` was removed
6. **`bun.lock` is git-tracked** — never put it in `actions/cache path:` blocks; only use in `hashFiles()`
7. **Zod `.describe()` removed** — Zod v4 uses `.meta({ description: "..." })`; `.describe()` causes type errors
8. **czg is interactive** — never use `bunx czg` or `bun run commit` in scripts/CI; always pass `-m` to `git commit`

---

## PR Checklist

Before opening a PR:
- [ ] `bun run typecheck` — clean
- [ ] `bun run lint src/` — clean
- [ ] `bun test --coverage` — 100% lines/functions/statements
- [ ] New functions have corresponding tests
- [ ] Mock shapes use Open-Meteo format (not OpenWeatherMap)
- [ ] Commit messages follow conventional commit format
- [ ] New GHA action uses `@SHA # vX.Y.Z` format

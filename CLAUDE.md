# CLAUDE.md — Claude Code Instructions for profile-weather-view

> Under 200 lines. Only what Claude would get wrong without it.
> Versions live in `package.json` — never hardcode them here.

---

## Commands

```bash
bun install                          # install dependencies
bun run start                        # single run (preloads preload.ts)
bun run dev                          # watch mode (preloads preload.ts)
bun run typecheck                    # tsc --noEmit
bun run lint                         # ultracite check
bun run format                       # ultracite fix
bun test                             # run all tests
bun test src/tests/path/to/test.ts   # run single test file
bun run check                        # typecheck + lint + test (pre-push gate)
bun run build                        # bundle to dist/
```

---

## Architecture

| File | Role |
|------|------|
| `src/weather-update/index.ts` | Orchestrator — entry point |
| `src/weather-update/services/fetch-weather.ts` | Open-Meteo API fetch + Zod validation |
| `src/weather-update/services/wmo-mapper.ts` | WMO code → Meteocon icon name |
| `src/weather-update/services/update-readme.ts` | README section patching; UTC offset from `now.offset` |
| `src/weather-update/utils/logger.ts` | Shared `log(message, level)` — routes warning/error → stderr |
| `src/weather-update/utils/preload.ts` | Rate limiter + env validation; preloaded via `--preload` flag |
| `src/tests/setup.ts` | `testUtils`, `testConfig` (no empty hooks) |
| `src/tests/utils/weather-test-helpers.ts` | Mock builders |
| `src/scripts/sync-readme-tech-stack.ts` | Syncs badge versions from `package.json` to README |

Data flow: `index.ts` → `preload.ts` → `fetch-weather.ts` → `wmo-mapper.ts` → `update-readme.ts`

---

## Code Style

- **ESM only** — `import`/`export`; no `require()`, no CommonJS
- **TypeScript 6.x** — `erasableSyntaxOnly` enforced (no enums, no parameter properties, no value namespaces); `baseUrl` removed (deprecated); `verbatimModuleSyntax` replaces `isolatedModules`
- **Zod v4** — use `.meta({ description: "..." })` NOT `.describe()`; schemas use `.parse()` not `.safeParse()`
- **Branded types** — `TemperatureCelsius`, `HumidityPercentage`, `TimeString`, `MeteoconIconName` via manual intersection (`number & { readonly __brand: unique symbol }`)
- **`as const satisfies T`** — preferred over plain `as const` or type annotation for config objects
- **Temporal everywhere** — all timestamps use `Temporal.Now.instant()` (not `new Date()`), including `logger.ts`
- **No raw console** — all output through `log(message, level)` from `utils/logger.ts`
- **`linker = "isolated"` in bunfig.toml** — phantom deps crash immediately; verify imports exist in `package.json`

---

## Testing Rules

- **100% coverage always enforced** — `coverageThreshold` in bunfig.toml; never skip
- **Use `bun test`** — not jest, vitest, or any other runner
- **Log capture pattern** — preload tests capture `process.stdout.write` / `process.stderr.write`, NOT `console.log`:
  ```ts
  process.stdout.write = (chunk: string) => { stdoutCalls.push(chunk); return true; };
  ```
- **Temporal.Now mock pattern**:
  ```ts
  (Temporal.Now as Record<string, unknown>)["zonedDateTimeISO"] = (_tz: unknown) => mockZdt;
  ```
  Must use bracket notation `["zonedDateTimeISO"]` not dot notation (TS4111 error otherwise)
- **Open-Meteo mock shape** — use this exact structure:
  ```ts
  { current: { temperature_2m, relative_humidity_2m, weather_code, is_day },
    daily: { sunrise: [number], sunset: [number] },
    utc_offset_seconds: 21_600 }
  ```
- **`createDisposableTempFile()`** in `testUtils.fs` — returns `{ path, [Symbol.asyncDispose] }` for `await using`
- **Test randomization** — `randomize = true, seed = 42` in bunfig.toml; do not add `test.only()`
- **Fetch mock helper** — use `mockGlobalFetch()` in `fetch-weather.test.ts` to avoid `as unknown as typeof fetch` repetition

---

## Commit & Release Workflow

- **IMPORTANT: always use `git commit -m "..."`** — czg is interactive and will hang CI/automated contexts
- **Pre-commit hook** (lefthook): `typecheck → format → test` — all must pass before commit
- **Commit-msg hook**: czg + commitlint validates the format
- **Conventional commit types**: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `types` `chore` `revert` `security`
- **Never bump versions manually** — semantic-release drives versioning from commit messages
- **`[skip ci]` tag** — appended by release bot commits to prevent infinite loops; preserves the tag in summaries

---

## Critical Gotchas

- **Bun does NOT support native Temporal** (issue #15853) — ALWAYS use `@js-temporal/polyfill`; never `Temporal` from built-ins
- **TS 6.x deprecations** — `baseUrl` removed; `isolatedModules` removed (superseded by `verbatimModuleSyntax`); `erasableSyntaxOnly: true` prevents enums/param properties
- **Root-level preload removed from bunfig.toml** — `--preload` flag only on `start`/`dev` scripts; `[test].preload` loads `./src/tests/setup.ts` separately
- **`isolatedDeclarations: true` is incompatible with `noEmit: true`** — do not add it to tsconfig.json
- **`bun.lock` must NOT be in cache `path:` blocks** — it's git-tracked; only use it in `hashFiles()` cache keys
- **Action SHAs** — see `.github/instructions/workflows.instructions.md` for the full pinned SHA table
- **Job-level permissions** — `recovery` and `generate-summary` jobs are `contents: read`; do not widen them
- **Artifact pairs** — `upload-artifact` and `download-artifact` must be the same major-version generation (currently v7/v8)
- **`npx --yes --package renovate@<version> renovate-config-validator`** — do NOT use global npm install for renovate

---

## Environment Variables

| Variable | Where | Notes |
|----------|-------|-------|
| `FORCE_UPDATE` | Bun.env | Force README commit even without changes |
| `PROFILE_README_PATH` | Bun.env | Path to target profile README |
| `GITHUB_ACTIONS` | Bun.env | Set by GHA runner; controls output format |
| `PAT` | GHA secret | Cross-repo write access for profile commits |
| `GPG_PRIVATE_KEY` | GHA secret | ASCII-armored PGP block; validated before use |
| `GPG_PASSPHRASE` | GHA secret | Passphrase for above |
| `GIT_COMMITTER_EMAIL` | GHA secret | Bot identity for signed commits |

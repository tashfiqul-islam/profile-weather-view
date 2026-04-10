# AGENTS.md — AI Agent Context for profile-weather-view

Universal agent context file. Compatible with Claude Code, OpenAI Codex, GitHub Copilot, Cursor, Gemini CLI, and other AI coding tools.

> **Versions live in `package.json`** — never hardcode them in agent context files.

---

## Project Overview

**What it is**: TypeScript/Bun automation that fetches real-time weather from the Open-Meteo API (no API key) and patches a GitHub profile README every 8 hours.

**Key constraint**: This project writes to a *different* repository (`tashfiqul-islam/tashfiqul-islam`) from where it lives (`tashfiqul-islam/profile-weather-view`). Cross-repo push uses a PAT secret.

---

## Tech Stack

All versions are defined in `package.json` (engines, dependencies, devDependencies). Key choices:

| Tool | Purpose | Why this choice |
|------|---------|-----------------|
| **Bun** | Runtime + test runner + package manager | Fast, native TS support, built-in test runner |
| **TypeScript** | Language (strict + `erasableSyntaxOnly`) | TS 6.x with full strict mode and Bun-compatible type-stripping |
| **Zod** | Schema validation + branded types | v4 with `.meta()` API, runtime validation |
| **@js-temporal/polyfill** | Date/time | Bun lacks native Temporal (issue #15853) |
| **Biome / Ultracite** | Linting + formatting | Fast, opinionated, replaces ESLint+Prettier |
| **semantic-release** | Automated versioning | Drives releases from conventional commits |
| **Lefthook** | Git hooks | Pre-commit: typecheck + format + test |

---

## Executable Commands

```bash
bun install                # install dependencies
bun run start              # single weather update run
bun run dev                # watch mode (re-runs on file save)
bun run typecheck          # tsc --noEmit (must be clean)
bun run lint               # ultracite check
bun run format             # ultracite fix
bun test                   # all tests (randomized, seed=42)
bun test --coverage        # with coverage report
bun run check              # typecheck + lint + test (full gate)
bun run build              # bundle to dist/ (target: bun)
```

All three quality gates must pass before any commit (enforced by lefthook pre-commit hook).

---

## Repository Structure

```
profile-weather-view/
├── src/
│   ├── weather-update/
│   │   ├── config.ts                   # Shared constants (DISPLAY_TIMEZONE)
│   │   ├── index.ts                    # Orchestrator — run this
│   │   ├── services/
│   │   │   ├── fetch-weather.ts        # Open-Meteo API + Zod parsing
│   │   │   ├── wmo-mapper.ts           # WMO code → Meteocon SVG icon
│   │   │   └── update-readme.ts        # Regex-patches README weather section
│   │   └── utils/
│   │       ├── logger.ts               # log(message, level) → ANSI-colored stdout/stderr
│   │       └── preload.ts              # Rate limit check + env validation
│   ├── scripts/
│   │   └── sync-readme-tech-stack.ts   # Syncs badge versions from package.json
│   └── tests/
│       ├── setup.ts                    # testUtils, testConfig
│       ├── utils/
│       │   └── weather-test-helpers.ts # Mock builders for weather data
│       └── unit/                       # Unit tests mirror src/ structure
├── .github/workflows/                  # 4 GitHub Actions workflows
├── CLAUDE.md                           # Claude Code specific instructions
├── AGENTS.md                           # This file
├── .releaserc.json                     # semantic-release config (conventionalcommits preset)
├── commitlint.config.ts                # Conventional commit enforcement
├── bunfig.toml                         # Bun runtime + test + install config
├── tsconfig.json                       # TypeScript strict config
├── lefthook.yml                        # Git hook definitions
└── renovate.json                       # Dependency update automation
```

### Data Flow

```
index.ts → preload.ts → fetch-weather.ts → wmo-mapper.ts → update-readme.ts
```

---

## Counterintuitive Patterns

1. **No native Temporal** — Bun issue #15853; always `import { Temporal } from "@js-temporal/polyfill"` never from globals
2. **Logger uses `Date.toISOString()`** — Not Temporal. The logger only needs UTC timestamps; using the polyfill for logging added unnecessary overhead
3. **TS 6.x: `erasableSyntaxOnly: true`** — No enums, no parameter properties, no value namespaces. Bun strips types rather than compiling them
4. **TS 6.x: `baseUrl` removed** — Deprecated in TS 6.0; `paths` entries use `./` prefix instead
5. **TS 6.x: `isolatedModules` removed** — Superseded by `verbatimModuleSyntax: true`
6. **`linker = "isolated"`** — Phantom dependencies cause immediate crashes, not silent failures
7. **Preload scope split** — `--preload` flag only on `start`/`dev` scripts; test preload at `[test].preload` is separate
8. **UTC offset is dynamic** — `update-readme.ts` derives it from `now.offset` (Temporal property)
9. **Zod `.describe()` removed** — Zod v4 uses `.meta({ description: "..." })`
10. **czg is interactive** — never use `bunx czg` in scripts/CI; always `git commit -m "type(scope): description"`

---

## Testing Rules

- **Framework**: `bun test` only — never Jest, Vitest, or other runners
- **Coverage**: `function=1.0, line=0.99, statement=0.99` enforced via `coverageThreshold` in `bunfig.toml`
- **Randomization**: `randomize = true, seed = 42` — no `test.only()`

### Key Testing Patterns

| Pattern | Implementation |
|---------|----------------|
| Log capture | Intercept `process.stdout.write` / `process.stderr.write` (not `console.log`) |
| Temporal mocking | `(Temporal.Now as Record<string, unknown>)["zonedDateTimeISO"]` — bracket notation required |
| Temp files | `await using file = await testUtils.fs.createDisposableTempFile("content", "test.md")` |
| Weather mocks | Open-Meteo shape: `{ current: {...}, daily: {...}, utc_offset_seconds }` |
| Fetch mocking | `mockGlobalFetch()` helper in `fetch-weather.test.ts` |

---

## Boundaries

### Always Do
- Use `import type` for type-only imports (enforced by `verbatimModuleSyntax`)
- Route all logging through `utils/logger.ts` — no raw `console.*`
- Use `Bun.file()` / `Bun.write()` for I/O — not `node:fs`
- Use `as const satisfies T` for config objects
- Validate external data with Zod schemas
- Use conventional commit format: `type(scope): description`

### Never Do
- Bump versions manually — semantic-release handles this
- Use `require()` or CommonJS patterns
- Use native `Temporal` from globals — always import the polyfill
- Add `test.only()` — randomization is enforced
- Put `bun.lock` in `actions/cache path:` blocks — only in `hashFiles()`

---

## Commit Guidelines

**CRITICAL**: Always use `git commit -m "message"`. The `czg` tool is interactive and blocks in non-TTY environments.

Format: `type(scope): description`

Valid types: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `types` `chore` `revert` `security`

---

## GitHub Actions

- All actions pinned to full commit SHAs — see `.github/instructions/workflows.instructions.md` for the current table
- All runners use `ubuntu-24.04` (explicit, not `ubuntu-latest`)
- Bun version pinned in workflows (not `latest`) — see `package.json` `engines.bun`

---

## Environment

| Variable | Purpose |
|----------|---------|
| `PROFILE_README_PATH` | Path to the profile README to patch (must end in `.md`) |
| `FORCE_UPDATE` | Bypass change detection, always commit |
| `GITHUB_ACTIONS` | Set by GHA; changes log output format |

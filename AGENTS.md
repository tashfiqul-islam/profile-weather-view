# AGENTS.md

Bun + TypeScript 7 job that fetches current weather from Open-Meteo (no API key) and patches the
weather table in a **different** repository's README, `tashfiqul-islam/tashfiqul-islam`, three
times a day. This repo holds the code; the profile repo only receives signed commits.

## Loop

| Step  | Command                                   | Done when                         |
| ----- | ----------------------------------------- | --------------------------------- |
| Setup | `mise install && mise run setup`          | `hk` hooks installed              |
| Gate  | `bun run check`                           | green: types, lint, format, tests |
| Try   | `PROFILE_README_PATH=<copy>.md bun start` | README section rewritten, exit 0  |

The **gate** is the definition of done for every change: typecheck → type-aware lint (zero
warnings) → format check → tests at **100 % line, function and statement coverage**. A change that
drops coverage is unfinished; add the test through the module's interface.

Tool versions live in `mise.toml`, deps in `package.json`, scripts in `package.json#scripts`.
Read those instead of trusting any copy of them.

## Map

Read [`src/README.md`](src/README.md) before changing code: run flow, every module's role and
public surface, invariants, and recipes for common changes. [`scripts/README.md`](scripts/README.md)
holds the `publish.sh` contract. Keep both current when modules or contracts change.

Logic lives in **pure cores** (`renderReadme`, `renderSummary`, the Zod transform, `meteocons`,
`time`) that take every input, including `now`, as a parameter. **I/O shells** (`updateReadme`,
`writeSummary`, `run`, `fetchWithRetry`, `log`) only read, write, and call cores. Tests sit next to
their module as `*.test.ts`; shared fakes live in `src/test-utils.ts`.

## Working agreement

- Run the gate after every source edit; report it red or green, never "should pass".
- Plan first, then ask, before changing workflows, CI, or root config.
- Ask before every commit and every push.

## Conventions

- Route every outbound HTTP call through `fetchWithRetry()`. A bare `fetch()` once hung on a dead
  socket for 222 s and failed the scheduled run.
- Validate external data with one Zod schema that `.transform()`s straight into the domain type.
- Derive types from data: `as const satisfies T` on tables, `typeof`/template-literal types on top.
- Use the native global `Temporal` (Bun ≥ 1.4). Pass `Temporal.ZonedDateTime` into pure functions
  so tests pin the clock.
- Use `Bun.file()` / `Bun.write()` / `Bun.env` for I/O and environment. Declare new env vars in
  `src/env.d.ts`.
- Log through `log()` from `src/log.ts`; stdout and stderr stay machine-readable for CI.
- Mock at the seam: `mockFetch()` / `silence()` / `tempReadme()` from `src/test-utils.ts`, then
  `mock.restore()` in `afterEach`.
- Document in TSDoc, enforced by oxlint: every file opens with a `@module` overview (what it is,
  pure core or I/O shell, why it exists); every export gets a one-line summary, then
  `@param name - …`, `@returns`, `@throws` and an `@example` for public entry points. Explain _why_
  on internals only when the code can't. Types live in TypeScript, never in JSDoc braces.
- Disable a lint rule only inline, with a `-- reason`.

## Gotchas

- **Two layouts.** `renderReadme()` auto-detects an HTML `<td>` table (first five cells) or a
  Markdown pipe table (every row after header + separator) inside the
  `<!-- Hourly Weather Update -->` markers. Missing markers or nothing to fill throw, so stale
  weather never gets a fresh stamp.
- **`PROFILE_README_PATH` is required.** This repo's own README has no markers; point it at a copy.
- **The refresh stamp always changes**, so every successful run commits. `git diff` in the workflow
  is the only change gate.
- **`bun:test` types `expect(p).rejects.*` as `void`** although it returns a promise; keep the
  `await`. The lint override in `oxlint.config.ts` exists for this.
- **`conventional-changelog-conventionalcommits` stays on v8.** v9+ templates break the writer
  bundled with semantic-release (empty release notes). Renovate holds it via `allowedVersions`.
- **`main` is ruleset-protected.** Changes land only through squash-merged PRs with a passing
  **CI / Quality gate** and signed commits; nothing (not even CI) commits to `main` directly.
- **`linker = "isolated"`**: an import missing from `package.json` fails immediately.
- **`bunfig.toml` enforces a 3-day `minimumReleaseAge`**; pick tool and action versions at least
  that old as well.
- **`CLAUDE.md` is a symlink to this file.** Edit `AGENTS.md`; on Windows clone with
  `git config core.symlinks true` (Developer Mode) so the link materialises.

## Commits & releases

Conventional commits, enforced by commitlint in the `commit-msg` hook:
`type(scope): subject`, with types and scopes in `commitlint.config.ts`. Use `git commit -m`.

PRs are **squash-merged**, so the PR title becomes the commit semantic-release reads: give it the
`type(scope): subject` that should drive the version.

Releases are automatic and tag-only: each push to `main` runs **CI → Release**, where
`semantic-release` derives the next version from commits since the last tag, creates the `vX.Y.Z`
tag and a GitHub Release with generated notes, and comments on the included PRs. There is no
version field and no changelog commit; `CHANGELOG.md` is the archive up to v3.2.7. README badges
read `package.json` / `mise.toml` live.

## CI

| Workflow       | Trigger                             | Jobs                                                                                                 |
| -------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `ci.yml`       | PR, push to `main`                  | **Quality gate** (gate + `mise run lint-actions`), **Dependency review** (PRs), **Release** (`main`) |
| `weather.yml`  | cron `23 5,13,21 * * *`, manual, PR | **render** → **render-retry** on a fresh runner if needed (no secrets; PR = dry run), **publish**    |
| `pr.yml`       | PR opened, edited, updated          | **Conventional title** (commitlint, required), **Type and release labels** (`scripts/pr-labels.ts`)  |
| `renovate.yml` | `renovate.json` changes             | strict config validation                                                                             |

- **Secrets stay behind a seam.** Only `weather.yml`'s **publish** job touches secrets, inside the
  `profile` environment. It runs `scripts/publish.sh` (bash, git, ssh-keygen; no toolchain, no
  dependencies) and nothing else. **render** does all the work with read-only access and hands the
  README over as an artifact; `publish.sh` refuses anything but a README change confined to the
  weather section and stamp. Keep new secret use in that shape.
- **Required checks on `main`:** Quality gate, Conventional title, Dependency review. Path-filtered
  or upstream-dependent jobs (the weather dry run, Renovate validation, labels) stay optional so
  they can never block an unrelated merge.
- **Open-Meteo throttles shared cloud IPs** by dropping connections, and a runner keeps one IP per
  job. So `render` tolerates failure and `render-retry` repeats the composite action
  `.github/actions/render` on a fresh runner; only both failing fails the run. Load local actions
  with the self-repository syntax `uses: $/…` (exact running commit, no checkout); actionlint
  doesn't know it yet, so `.github/actionlint.yaml` ignores that one message.
- **Shared steps live in composite actions**, loaded with `uses: $/…`: `.github/actions/setup`
  (mise tools via `tools:`, Bun cache, `install: all | production | none`) and
  `.github/actions/render`. Add setup steps there, not per job.
- **`scripts/publish.sh` is tested end to end** in `scripts/publish.test.ts` against a local bare
  repo with a throwaway key. Those tests skip on Windows (OpenSSH there ignores `umask`); CI's
  Ubuntu runner and WSL run them.
- **Workflows and scripts are linted like code.** `actionlint`, `zizmor` (strictest persona clean)
  and `shellcheck` run via `mise run lint-actions`; `lychee` checks every docs link and anchor via
  `mise run lint-docs`. Both run in the hk pre-commit hook and in CI. Every `permissions:` grant
  carries a `# why` comment; workflows start from `permissions: {}`.
- **PR feedback is native annotations, not a review bot.** The Quality gate runs one step per tool;
  tsc (via `.github/matchers/tsc.json`), oxlint (`--format github`), actionlint (Go template) and
  zizmor (`--format github`) annotate the PR diff with no extra action and no write token. Keep new
  checks in that shape rather than adding reviewdog-style bots. `bun run check` is the same gate
  locally; keep the two in sync.
- Actions are pinned to full commit SHAs with a `# vX.Y.Z` comment; tools come from `mise.toml` via
  `jdx/mise-action`. Renovate automerges non-major updates through PRs once CI is green; the hk
  version in `hk.pkl` and the Renovate CLI pin follow via regex managers.
- `profile` environment (deploys from `main` only): secrets `PAT`, `SIGNING_KEY` (ed25519, SSH
  commit signing via plain `git config`, verified with `git verify-commit` before push); variables
  `GIT_COMMITTER_NAME`, `GIT_COMMITTER_EMAIL`. Never add repo-level copies, and keep third-party
  actions out of the publish job.

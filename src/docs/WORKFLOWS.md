# CI/CD Workflows

This document describes the automated workflows, their triggers, required secrets/permissions, and the key steps they run.

## Conventions used across workflows
- Concurrency: one run per ref at a time
- Permissions: least-privilege; elevate only when pushing/creating releases
- Runtimes: Bun for install/runtime; Node LTS for semantic-release
- Caching: `actions/cache@v4` keyed by `bun.lock`
- Signed commits: via `crazy-max/ghaction-import-gpg@v6`
- Skip loops: commits include `[skip actions]` when appropriate

---

## 1) Profile Weather Update (`.github/workflows/profile-weather-update.yml`)

- Triggers
  - `schedule`: 3× daily (Asia/Dhaka)
  - `workflow_dispatch`: with inputs to force update or skip tests
- Inputs
  - `force_update` (boolean): commit even if content unchanged
  - `skip_tests` (boolean): bypass lint/type/test for speed
- Permissions
  - `contents: write`, `id-token: write` (for signing), minimal elsewhere
- Secrets required
  - `OPEN_WEATHER_KEY`: API key for OpenWeather
  - `PAT`: Personal Access Token with `repo` scope to push to profile repo
  - `GPG_PRIVATE_KEY`, `GPG_PASSPHRASE`, `GIT_COMMITTER_NAME`, `GIT_COMMITTER_EMAIL`
- Key steps
  - Checkout both repos (this repo and the target profile repo)
  - Setup Bun + (optionally) Node LTS, restore cache
  - Quality gates (Ultracite lint, type-check, tests) unless skipped
  - Run `src/weather-update/index.ts` which writes to the profile README between markers
  - If changes or forced: import GPG key, configure identity, signed commit, push
  - Upload the updated README as an artifact
- Observability
  - Step groups, timing output, `CHANGES_DETECTED=true|false` signal
  - Execution summary in the `verify` job

---

## 2) Semantic Release (`.github/workflows/semantic-release.yml`)

- Triggers
  - Pushes to `master` and `workflow_dispatch`
- Permissions
  - `contents: write`, `issues: write`, `pull-requests: write` (for release metadata)
- Secrets required
  - Uses `GITHUB_TOKEN` (PAT not required)
- Key steps
  - Setup Bun (install), Node LTS (run release)
  - Run `semantic-release` with `.releaserc.js` pipeline
  - Produce GitHub release and update `CHANGELOG.md`, `package.json`
- Notes
  - Supports `dry run` when `DRY_RUN=true`
  - See detailed strategy in `src/docs/RELEASE_STRAT.md`

---

## 3) README Tech Stack Sync (`.github/workflows/sync-readme-tech-stack.yml`)

- Triggers
  - Pushes to `master` affecting `package.json` or `bun.lock` (Renovate merges included)
  - Manual `workflow_dispatch`
  - Guard: job skips when head commit message contains `[skip actions]`
- Permissions
  - `contents: write` for committing README changes
- Secrets required
  - `GPG_PRIVATE_KEY`, `GPG_PASSPHRASE`, `GIT_COMMITTER_NAME`, `GIT_COMMITTER_EMAIL`
- Key steps
  - Setup Bun + cache
  - Run `bun run sync-readme-tech-stack` to update flat-square version badges and footer date
  - Import GPG key, configure identity, signed commit and push (only if README changed)

---

## Security and secrets
- Store secrets under Repository → Settings → Secrets and variables → Actions
- Do not echo secrets in logs; avoid printing API responses verbatim
- Prefer `GITHUB_TOKEN` over PAT for release tasks; use PAT only when pushing across repos (profile repo)

## Troubleshooting
- Missing commits or tags: ensure the workflow has `contents: write` permission
- README not changing: verify markers exist and that `PROFILE_README_PATH` is correct
- Release blocked: confirm commit messages follow Conventional Commits and no `[skip ci]` on release commits
- Cache misses: ensure `bun.lock` exists and cache key matches

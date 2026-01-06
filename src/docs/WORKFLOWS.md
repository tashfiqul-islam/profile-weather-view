# CI/CD Workflows

This document describes the automated workflows, their triggers, required secrets/permissions, and the key steps they run.

## Conventions used across workflows

- Concurrency: one run per ref at a time
- Permissions: least-privilege; elevate only when pushing/creating releases
- Runtimes: Bun for install/runtime; Node LTS for semantic-release
- Caching: `actions/cache` keyed by `bun.lock`
- Signed commits: via `crazy-max/ghaction-import-gpg`
- Skip loops: commits include `[skip actions]` when appropriate
- SHA pinning: all actions use full commit SHAs for security

---

## 1) Profile Weather Update (`.github/workflows/profile-weather-update.yml`)

- Triggers
  - `schedule`: 3× daily (Asia/Dhaka timezone)
  - `workflow_dispatch`: with inputs to force update or skip tests
- Inputs
  - `force_update` (boolean): commit even if content unchanged
  - `skip_tests` (boolean): bypass lint/type/test for speed
- Permissions
  - `contents: write`, `id-token: write` (for signing), minimal elsewhere
- Secrets required
  - `PAT`: Personal Access Token with `repo` scope to push to profile repo
  - `GPG_PRIVATE_KEY`, `GPG_PASSPHRASE`, `GIT_COMMITTER_NAME`, `GIT_COMMITTER_EMAIL`
- Key steps
  - Checkout both repos (this repo and the target profile repo)
  - Setup Bun, restore cache
  - Quality gates (Ultracite lint, typecheck, Bun tests) unless skipped
  - Run `src/weather-update/index.ts` which fetches from Open-Meteo and writes to the profile README
  - If changes or forced: import GPG key, configure identity, signed commit, push
  - Upload the updated README as an artifact
- Observability
  - Step groups, timing output, `CHANGES_DETECTED=true|false` signal
  - Execution summary with performance metrics

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
  - Supports dry run via workflow dispatch
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
  - Run `bun run sync-readme-tech-stack` to update version badges and footer date
  - Import GPG key, configure identity, signed commit and push (only if README changed)

---

## 4) Renovate Validation (`.github/workflows/renovate-validation.yml`)

- Triggers
  - Pull requests affecting `renovate.json` or workflow file
  - Push to `master` affecting same files
- Key steps
  - Setup Node LTS
  - Install renovate globally and run `renovate-config-validator --strict`
  - Output validation results as markdown table

---

## Security and secrets

- Store secrets under Repository → Settings → Secrets and variables → Actions
- Do not echo secrets in logs; avoid printing API responses verbatim
- Prefer `GITHUB_TOKEN` over PAT for release tasks; use PAT only when pushing across repos (profile repo)
- No weather API key required: Open-Meteo is free for non-commercial use

## Troubleshooting

- Missing commits or tags: ensure the workflow has `contents: write` permission
- README not changing: verify markers exist and that `PROFILE_README_PATH` is correct
- Release blocked: confirm commit messages follow Conventional Commits and no `[skip ci]` on release commits
- Cache misses: ensure `bun.lock` exists and cache key matches

# Release & Changelog Strategy

This project uses semantic-release to fully automate versioning, changelog generation, and GitHub releases. Releases are derived from Conventional Commits and run in CI.

## Overview
- Versioning: semantic-release, tag format `v${version}`
- Branches: `master` for stable, maintenance branches like `1.x`/`1.2.x`, and pre-release branches `alpha`/`beta`
- Auth: `GITHUB_TOKEN` (no PAT required) for releases
- Changelog: `CHANGELOG.md` maintained automatically
- Package: version in `package.json` updated automatically, no npm publish

## Commit conventions (angular)
Examples:
```text
feat(weather): add hourly icon rendering
fix(ci): correct cache key for bun.lock
chore(deps): update zod to 4.0.15 [skip actions]
```
- `feat:` → minor release
- `fix:` → patch release
- `BREAKING CHANGE:` in the commit body → major release
- `chore(deps|actions|bun|dependencies):` → patch release
- `chore:` (other) → no release

## Pipeline (plugins)
The release pipeline (see `.releaserc.js`) executes in this order:
1) `@semantic-release/commit-analyzer`
   - Parses Conventional Commits; custom rules for chores and security
2) `@semantic-release/release-notes-generator`
   - Generates release notes with grouped sections; skips merges and auto-release commits
3) `@semantic-release/changelog`
   - Updates `CHANGELOG.md` with the generated notes
4) `@semantic-release/npm`
   - Updates `package.json` version (no publish)
5) `@semantic-release/git`
   - Commits updated files (CHANGELOG.md, package.json, bun.lock, bunfig.toml, README.md)
   - Message: `chore(release): v${nextRelease.version} [skip ci]`
6) `@semantic-release/github`
   - Creates a GitHub release with notes

## How changelogs are maintained
- `CHANGELOG.md` is fully managed by the pipeline
- Headers include compare links (previous → current tag)
- Commit groups are sorted by type and scope
- Merge commits and auto-release commits are excluded

## CI workflow
- `.github/workflows/semantic-release.yml`:
  - Installs with Bun, runs semantic-release on Node LTS
  - Uses repo `GITHUB_TOKEN` permissions
  - Supports manual `workflow_dispatch` (with optional dry run)

## Pre-releases & maintenance
- `alpha` or `beta` branches produce pre-release tags
- Maintenance branches `1.x` / `1.2.x` receive backports → `1.x.y` releases

## Skipping releases
- Commits with `[skip ci]` (or Renovate’s `[skip actions]`) skip CI, but semantic-release still analyzes history on the next run
- Pure docs or chores without matching rules don’t bump versions

## Local expectations
- Do not manually edit `CHANGELOG.md` or version fields
- Use Conventional Commits; let CI handle releases
- Dry run locally if needed:
```bash
DRY_RUN=true bun run semantic-release
```

## Troubleshooting
- “No release notes generated” → ensure Conventional Commit messages
- “GitHub auth failed” → ensure `contents: write` permission for `GITHUB_TOKEN`
- “Changelog not updated” → confirm `@semantic-release/changelog` is in pipeline and CI can write

---

For details, see `.releaserc.js` and the official [semantic-release docs](https://semantic-release.gitbook.io/semantic-release/).

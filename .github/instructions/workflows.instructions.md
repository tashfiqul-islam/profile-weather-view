---
applyTo: ".github/workflows/**"
---

# GitHub Actions Rules — profile-weather-view

## Runners & Versions

- Always `runs-on: ubuntu-24.04` — never `ubuntu-latest` (prevents silent runtime migration between LTS versions)
- Always `bun-version: 1.3.10` — never `latest` (reproducibility)
- Install command: `LEFTHOOK=0 bun install --frozen-lockfile --no-summary --ignore-scripts`

## Action SHA Pinning

All actions must be pinned to a full commit SHA with a version comment. Never use a tag reference alone.

```yaml
# Correct
uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2

# Wrong
uses: actions/checkout@v6
uses: actions/checkout@main
```

### Current pinned SHAs (do not change without research)

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

## Permissions (least privilege)

Declare minimum permissions per job. Never inherit workflow-level write access in read-only jobs.

```yaml
# Workflow level — only grant what the most privileged job needs
permissions:
  contents: write

jobs:
  my-read-only-job:
    # Job-level override — narrows to read-only
    permissions:
      contents: read
```

Jobs that only write `$GITHUB_STEP_SUMMARY` need only `contents: read`.

## Cache Rules

- **Never include `bun.lock` in `path:`** — it is git-tracked; restoring it from cache can silently override the checked-out version
- Only use `bun.lock` inside `hashFiles()` for the cache key
- Cache only: `~/.bun/install/cache`

```yaml
# Correct
- uses: actions/cache/restore@cdf6c1fa76f9f475f3d7449005a359c84ca0f306 # v5.0.3
  with:
    path: ~/.bun/install/cache
    key: ${{ env.CACHE_KEY_PREFIX }}-${{ runner.os }}-bun-${{ hashFiles('**/bun.lock') }}

# Wrong — never add bun.lock to path:
    path: |
      ~/.bun/install/cache
      bun.lock
```

## Artifact Rules

- `upload-artifact` and `download-artifact` must be the same generation pair: **v7/v8** (current)
- Add `retention-days: 7` to ephemeral CI artifacts — do not default to 90 days
- Never mix generations (v6 upload + v8 download = silent failure)

## SLSA Provenance

Use `actions/attest-build-provenance` for real Sigstore-signed attestations — not manual sha256sum scripts:

```yaml
- name: Attest release provenance
  uses: actions/attest-build-provenance@a2bbfa25375fe432b6a289bc6b6cd05ecd0c4c32 # v4.1.0
  with:
    subject-path: |
      CHANGELOG.md
      package.json
```

Requires `attestations: write` in workflow-level permissions.

## One-off Tools

Prefer `npx --yes --package <pkg>@<version> <command>` over `npm install --global` for single-use CLI tools:

```yaml
# Correct
run: npx --yes --package renovate@43.46.1 renovate-config-validator --strict

# Wrong — downloads ~100MB globally just to run once
run: npm install --global renovate@43.46.1 && renovate-config-validator --strict
```

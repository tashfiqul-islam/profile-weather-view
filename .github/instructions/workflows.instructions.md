---
applyTo: '.github/workflows/**'
---

# GitHub Actions Rules — profile-weather-view

## Runners & Versions

- Always `runs-on: ubuntu-24.04` — never `ubuntu-latest` (prevents silent runtime migration between LTS versions)
- Always `bun-version: 1.3.14` — never `latest` (reproducibility)
- Install command: `LEFTHOOK=0 bun install --frozen-lockfile --no-summary --ignore-scripts`

## Action SHA Pinning

All actions must be pinned to a full commit SHA with a version comment. Never use a tag reference alone.

```yaml
# Correct
uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1

# Wrong
uses: actions/checkout@v7
uses: actions/checkout@main
```

### Current pinned SHAs (do not change without research)

| Action                            | Version | SHA                                        |
| --------------------------------- | ------- | ------------------------------------------ |
| `actions/checkout`                | v7.0.1  | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| `oven-sh/setup-bun`               | v2.2.0  | `0c5077e51419868618aeaa5fe8019c62421857d6` |
| `actions/cache`                   | v5.1.0  | `caa296126883cff596d87d8935842f9db880ef25` |
| `actions/setup-node`              | v6.3.0  | `53b83947a5a98c8d113130e565377fae1a50d02f` |
| `actions/upload-artifact`         | v7.0.0  | `bbbca2ddaa5d8feaa63e36b76fdaad77386f024f` |
| `actions/download-artifact`       | v8.0.1  | `3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c` |
| `crazy-max/ghaction-import-gpg`   | v7.0.0  | `2dc316deee8e90f13e1a351ab510b4d5bc0c82cd` |
| `actions/attest-build-provenance` | v4.1.1  | `0f67c3f4856b2e3261c31976d6725780e5e4c373` |

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
- uses: actions/cache/restore@caa296126883cff596d87d8935842f9db880ef25 # v5.1.0
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
  uses: actions/attest-build-provenance@0f67c3f4856b2e3261c31976d6725780e5e4c373 # v4.1.1
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

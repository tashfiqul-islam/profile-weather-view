# Commit Message Convention (Conventional Commits)

This project follows the Conventional Commits specification to enable automated releases, changelog generation, and clear change history.

Why it matters:

- Drives semantic-release versioning (major/minor/patch)
- Produces structured changelogs and GitHub releases
- Improves code review and searchability

---

## Format

```text
<type>(<scope>)!: <subject>

[body]

[footer(s)]
```

Rules

- Use lowercase `type` and optional `(scope)`
- Max header length: 100 chars
- No trailing period in subject
- Use imperative mood: "add", "fix", "update", not "added" or "fixes"
- Wrap body/footer lines at ~100 chars
- Breaking changes: add `!` after type/scope OR a `BREAKING CHANGE:` footer

Forbidden

- `fixup!`, `wip:`, `temp:`, `TODO`, `FIXME`

---

## Types

- feat: new user-facing feature (triggers MINOR)
- fix: bug fix (triggers PATCH)
- docs: documentation only changes
- style: formatting; no code meaning changes
- refactor: code change that is not feature/bugfix
- perf: performance improvement
- test: adding/adjusting tests
- build: build system/deps tooling
- ci: CI configuration/workflows
- chore: maintenance (see release mapping below)
- revert: reverts a previous commit
- security: security improvements

---

## Scopes

Use a single scope or multiple scopes separated by comma.

Allowed scopes (commitlint):
`actions, api, bun, build, ci, config, core, deps, docs, hooks, infra, perf, release, security, test, types, ui, utils, weather`

Examples

- `fix(weather): correct sunrise parsing`
- `feat(core,utils): add retry with exponential backoff`
- `docs(readme): add coverage snapshot table`

---

## Breaking changes

Indicate breaking changes using either method:

- Exclamation mark: `feat(api)!: switch to Open-Meteo API`
- Footer: add a paragraph starting with `BREAKING CHANGE:`

Example footer

```text
BREAKING CHANGE: switched from OpenWeather to Open-Meteo API; no API key required
```

---

## Footer

- Reference issues: `Closes #123`, `Refs #456`
- Co-authors: `Co-authored-by: Name <email>`
- Security notes: `Security: rotated tokens and tightened scopes`

Skip CI for automation

- Automation (e.g., Renovate) uses `[skip actions]` to avoid workflow loops
- Prefer not to skip CI in manual commits unless absolutely necessary

---

## Release mapping (semantic-release)

Based on `.releaserc.js` and commit analyzer rules:

- `feat:` → minor release
- `fix:` → patch release
- `chore(deps|actions|bun|dependencies):` → patch release
- `chore:` (others) → no release
- `BREAKING CHANGE:` (or `!`) → major release

Tip: Use precise types/scopes so the correct release is produced.

---

## Examples

Valid

```text
feat(weather): add humidity to output table
fix(ci): correct cache key for bun.lock
chore(deps): update zod to 4.x [skip actions]
docs(workflows): document signed commits and permissions
refactor(core): extract WMO mapper to separate module
perf(utils): memoize computed timezone offsets
security(api): mask token in logs
```

Breaking

```text
feat(api)!: migrate to Open-Meteo with Meteocons

BREAKING CHANGE: replaced OpenWeather with Open-Meteo API; icon format changed to WMO codes
```

Revert

```text
revert: feat(core): extract request builder from fetchWeather

This reverts commit <sha>.
```

---

## Workflow & tooling

- Lefthook `commit-msg` hook validates commits locally
- Commitlint enforces the spec and custom rules (see `commitlint.config.mts`)
- Optional interactive prompt: `bun run commit`
- CI also validates commit messages in PRs

---

## Do/Don't

Do

- Keep subject concise; explain details in body
- Use accurate scope and type for better release notes
- Reference issues in footer (not subject)

Don't

- Use capitalization or emojis in the subject
- End the subject with a period
- Use vague subjects like "update files"

---

## References

- Conventional Commits: <https://www.conventionalcommits.org/>
- Commitlint: <https://commitlint.js.org/>
- semantic-release: <https://semantic-release.gitbook.io/>

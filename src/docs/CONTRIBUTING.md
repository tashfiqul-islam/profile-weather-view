# Contributing Guide

Thank you for considering a contribution to Profile Weather View. This guide explains how to propose, implement, and ship changes with high quality and minimal friction.

## Principles

- Type safety first: TypeScript strict mode; never introduce the `any` type
- Tests are mandatory: maintain 100% unit test coverage
- Small, focused PRs: easier to review, merge, and release
- Conventional Commits: semantic-release derives versions from your messages
- Consistency over cleverness: match existing patterns and formatting

## Getting started

1) Fork and clone the repository
2) Install dependencies

   ```bash
   bun install
   ```

3) Create a feature branch

   ```bash
   git checkout -b feat/<short-scope>
   # examples: feat/weather-icons, fix/gha-cache, docs/readme
   ```

## Local development

Use Bun and the provided scripts:

```bash
# Run the weather script locally (watch mode)
bun run dev

# Run once
bun run start

# Quality checks
bun run typecheck
bun run format
bun run lint

# Tests (Bun test runner with coverage)
bun test
bun test --coverage

# Full check (typecheck + lint + test)
bun run check
```

### Testing standards

- Framework: Bun test runner; global setup at `src/tests/setup.ts` (configured in `bunfig.toml`)
- Coverage: LCOV written to `coverage/lcov.info` (used by SonarCloud)
- Target: 100% coverage on all files
- Test location: `src/tests/unit/**` with helpers in `src/tests/utils/`
- Use fast, deterministic tests; avoid real network I/O; use stubs/mocks instead

### Linting & formatting

- Tooling: Ultracite (Biome) driven by `biome.jsonc`
- Run `bun run format` and `bun run lint` before pushing
- Follow project rules (e.g., no console/debugger, avoid `delete` operator, no TypeScript enums, etc.)

## Commit conventions

We use Conventional Commits (angular style). Examples:

```text
feat(weather): show hourly icon
fix(ci): correct cache key for bun.lock
chore(deps): update zod to 4.x [skip actions]
docs(readme): add architecture diagram
```

- Types: feat, fix, docs, chore, refactor, perf, test, ci, build, revert
- Scope examples: actions, bun, ci, config, core, deps, docs, release, security, test, types, utils, weather
- Docs-only or Renovate-like commits may include `[skip actions]` to avoid unnecessary pipelines
- Use `bun run commit` for a guided prompt

## Pull Requests

- Use the template `.github/PULL_REQUEST_TEMPLATE.md`
- Keep PRs small and self-contained; explain the why and the how
- Include screenshots or logs when output changes
- Ensure checks pass locally before pushing:

  ```bash
  bun run check && bun test --coverage
  ```

- Do not bump versions manually; releases are automated by semantic-release

## CI/CD expectations

- Workflows:
  - Profile Weather Update: scheduled weather fetch + README update for profile repo
  - Semantic Release: automated versioning and changelog
  - README Tech Stack Sync: updates tech badges and footer date on dependency changes
- Signed commits: some workflows sign commits using the maintainer's GPG key

## Security & secrets

- Never commit secrets; use repository/action secrets for tokens and keys
- Validate input/environment via existing helpers; do not weaken validation
- No API key needed for Open-Meteo (free weather data)

## Documentation

- Update `README.md` when behavior or setup changes
- Add or update docs under `src/docs/` for contributor/developer-facing changes
- Keep examples minimal and copy-paste friendly

## License

By contributing, you agree your contributions will be licensed under the MIT License.

Thanks again for contributing — we appreciate your time and care.

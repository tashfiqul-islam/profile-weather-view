# CLAUDE.md

@AGENTS.md

## Claude Code

- Use plan mode for changes to workflows, CI, or config files
- Run `bun run check` after every source edit
- Never commit — ask user first
- Prefer `bunx` over `npx` for CLI tools
- Use `Bun.file()` / `Bun.write()` — never `node:fs`

## Gotchas

- **czg is interactive** — never `bunx czg` in scripts/CI; always `git commit -m "..."`
- **`bun.lock` in cache** — never in `path:` blocks, only in `hashFiles()`
- **`isolatedDeclarations` incompatible with `noEmit`** — do not add to tsconfig
- **Profile repo uses `main`** — push target `HEAD:main` in workflow
- **markdownlint-cli2** — `bunx markdownlint-cli2 "**/*.md" "#node_modules"` to lint markdown

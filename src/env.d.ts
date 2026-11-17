/**
 * Typed environment: every variable the app reads, declared on Bun's `Env` so `Bun.env.X` is
 * checked at compile time. Add new variables here, not as ad-hoc string lookups.
 *
 * @module
 */

declare module 'bun' {
  interface Env {
    /** README to patch; required, must end in `.md` (case-insensitive). */
    PROFILE_README_PATH?: string;
    /** Any value disables ANSI colours in log output, per https://no-color.org. */
    readonly NO_COLOR?: string;
    /** Set by GitHub Actions: Markdown file for the current step's job summary. */
    GITHUB_STEP_SUMMARY?: string;
  }
}

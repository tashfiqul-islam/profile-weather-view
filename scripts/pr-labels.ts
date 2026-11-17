/**
 * Labels for a pull request, derived from its title: `type: <type>` and `release: <impact>`.
 *
 * PRs are squash-merged, so the title becomes the commit semantic-release reads and the body becomes
 * its message. The release impact is computed from `.releaserc.json`'s own `releaseRules`, so the
 * label can never disagree with what the release job will do. Used by `.github/workflows/pr.yml`.
 *
 * @module
 */

import releaserc from '../.releaserc.json' with { type: 'json' };

/** What a merge of this PR will release. */
export type ReleaseImpact = 'major' | 'minor' | 'patch' | 'none';

/** The two managed labels for a PR. */
export interface PrLabels {
  /** Conventional commit type, e.g. `feat`; becomes the `type: <type>` label. */
  readonly type: string;
  /** Becomes the `release: <impact>` label. */
  readonly release: ReleaseImpact;
}

/** One commit-analyzer release rule, as written in `.releaserc.json`. */
export interface ReleaseRule {
  readonly type?: string;
  readonly scope?: string;
  readonly breaking?: boolean;
  readonly release: Exclude<ReleaseImpact, 'none'> | false;
}

/** `type(scope)!: subject`, the conventional commit header. */
const HEADER = /^(?<type>[a-z]+)(?:\((?<scope>[^)]*)\))?(?<bang>!)?: \S/;
/** A breaking-change footer anywhere in the squash message (the PR body). */
const BREAKING_FOOTER = /^BREAKING[ -]CHANGE: /m;
const RANK = { none: 0, patch: 1, minor: 2, major: 3 } as const satisfies Record<
  ReleaseImpact,
  number
>;

const isReleaseRule = (value: unknown): value is ReleaseRule =>
  typeof value === 'object' && value !== null && 'release' in value;

/** The commit-analyzer `releaseRules` from `.releaserc.json` (empty if the plugin is absent). */
export const RELEASE_RULES: readonly ReleaseRule[] = releaserc.plugins.flatMap((plugin) => {
  if (!Array.isArray(plugin) || plugin[0] !== '@semantic-release/commit-analyzer') return [];
  const options: unknown = plugin[1];
  if (typeof options !== 'object' || options === null || !('releaseRules' in options)) return [];
  const rules: unknown = options.releaseRules;
  return Array.isArray(rules) ? rules.filter(isReleaseRule) : [];
});

/**
 * Works out the labels for a PR the way commit-analyzer will judge its squash commit: every
 * matching rule counts and the highest release wins; no matching rule means no release.
 *
 * @param title - PR title, which becomes the squash commit header.
 * @param body - PR body, which becomes the squash commit message.
 * @param rules - Release rules; defaults to {@link RELEASE_RULES}.
 * @returns The labels, or `undefined` when the title is not a conventional commit header.
 * @example
 * ```ts
 * labelsFor('feat(weather): job summaries', ''); // { type: 'feat', release: 'minor' }
 * labelsFor('chore(deps): update zod', '');      // { type: 'chore', release: 'patch' }
 * ```
 */
export function labelsFor(
  title: string,
  body: string,
  rules: readonly ReleaseRule[] = RELEASE_RULES,
): PrLabels | undefined {
  const header = HEADER.exec(title.trim())?.groups;
  if (header?.['type'] === undefined) return undefined;
  const { type, scope, bang } = header;
  const breaking = bang !== undefined || BREAKING_FOOTER.test(body);

  let release: ReleaseImpact = 'none';
  for (const rule of rules) {
    const matches = rule.breaking
      ? breaking
      : rule.type === type && (rule.scope === undefined || rule.scope === scope);
    if (matches && rule.release !== false && RANK[rule.release] > RANK[release]) {
      release = rule.release;
    }
  }
  return { type, release };
}

/**
 * CLI: reads `PR_TITLE` and `PR_BODY`, prints `type=…` and `release=…` lines for `$GITHUB_OUTPUT`.
 *
 * @param env - Environment to read; defaults to `Bun.env`.
 * @returns The output lines.
 * @throws Error when the title is not a conventional commit header.
 */
export function cli(env: Record<string, string | undefined> = Bun.env): string {
  const labels = labelsFor(env['PR_TITLE'] ?? '', env['PR_BODY'] ?? '');
  if (labels === undefined) {
    throw new Error(`Not a conventional commit title: ${env['PR_TITLE'] ?? '(empty)'}`);
  }
  return `type=${labels.type}\nrelease=${labels.release}\n`;
}

if (import.meta.main) process.stdout.write(cli());

import { describe, expect, test } from 'bun:test';
import { cli, labelsFor, RELEASE_RULES } from './pr-labels';

describe('labelsFor (against the real .releaserc.json rules)', () => {
  test.each([
    ['feat(weather): job summaries', 'feat', 'minor'],
    ['fix: handle empty arrays', 'fix', 'patch'],
    ['perf(weather): faster render', 'perf', 'patch'],
    ['security: rotate key handling', 'security', 'patch'],
    ['revert: undo the thing', 'revert', 'patch'],
    ['chore(deps): update zod', 'chore', 'patch'],
    ['chore(bun): update bun', 'chore', 'patch'],
    ['chore(tooling): bump hk', 'chore', 'none'],
    ['docs: rewrite readme', 'docs', 'none'],
    ['ci(actions): tweak workflow', 'ci', 'none'],
    ['refactor: tidy', 'refactor', 'none'],
  ] as const)('%s → type: %s, release: %s', (title, type, release) => {
    expect(labelsFor(title, '')).toEqual({ type, release });
  });

  test('a ! in the header is a major release', () => {
    expect(labelsFor('feat(weather)!: drop the HTML layout', '')).toEqual({
      type: 'feat',
      release: 'major',
    });
  });

  test('a BREAKING CHANGE footer in the body is a major release', () => {
    expect(labelsFor('fix: rename env var', 'Details.\n\nBREAKING CHANGE: renamed X')).toEqual({
      type: 'fix',
      release: 'major',
    });
  });

  test.each(['Update stuff', 'feat:no space', 'feat(): ', ''])(
    'rejects a non-conventional title: %p',
    (title) => {
      expect(labelsFor(title, '')).toBeUndefined();
    },
  );

  test('reads rules straight from .releaserc.json', () => {
    expect(RELEASE_RULES).toContainEqual({ type: 'feat', release: 'minor' });
    expect(RELEASE_RULES).toContainEqual({ breaking: true, release: 'major' });
  });

  test('an empty rule set never releases', () => {
    expect(labelsFor('feat: x', '', [])).toEqual({ type: 'feat', release: 'none' });
  });
});

describe('cli', () => {
  test('prints GITHUB_OUTPUT lines', () => {
    expect(cli({ PR_TITLE: 'feat(weather): x', PR_BODY: '' })).toBe('type=feat\nrelease=minor\n');
  });

  test('throws on a non-conventional title', () => {
    expect(() => cli({ PR_TITLE: 'Update stuff' })).toThrow('Not a conventional commit title');
    expect(() => cli({})).toThrow('(empty)');
  });
});

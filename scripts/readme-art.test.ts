import { describe, expect, test } from 'bun:test';
import { escapeXml, readmeArt, writeReadmeArt } from './readme-art';

describe('readmeArt', () => {
  test('matches every committed asset', async () => {
    const files = Object.entries(readmeArt());
    expect(files.map(([path]) => path).toSorted()).toEqual([
      '.github/assets/architecture-dark.svg',
      '.github/assets/architecture-light.svg',
      '.github/assets/cover-dark.svg',
      '.github/assets/cover-light.svg',
      '.github/assets/pipeline-dark.svg',
      '.github/assets/pipeline-light.svg',
    ]);
    const committed = await Promise.all(files.map(([path]) => Bun.file(path).text()));
    expect(committed).toEqual(files.map(([, svg]) => svg));
  });

  test('gives every image an accessible name and description', () => {
    for (const svg of Object.values(readmeArt())) {
      expect(svg).toContain('role="img" aria-labelledby="title desc"');
      expect(svg).toMatch(/<desc id="desc">[^<]{40,}<\/desc>/);
    }
  });

  test('shows each pair by GitHub theme, never the OS', async () => {
    // GitHub hides links ending #gh-dark-mode-only / #gh-light-mode-only by its own theme setting;
    // a <picture> with prefers-color-scheme follows the OS instead.
    const docs = {
      '.github/CONTRIBUTING.md': ['pipeline'],
      'README.md': ['cover', 'architecture'],
    };
    const entries = Object.entries(docs);
    const texts = await Promise.all(entries.map(([path]) => Bun.file(path).text()));
    for (const [i, [, names]] of entries.entries()) {
      const doc = texts[i] ?? '';
      expect(doc).not.toContain('prefers-color-scheme');
      for (const name of names) {
        for (const mode of ['dark', 'light']) {
          expect(doc).toMatch(
            new RegExp(`#gh-${mode}-mode-only"><img src="[^"]*${name}-${mode}[.]svg"`),
          );
        }
      }
    }
  });
});

describe('writeReadmeArt', () => {
  test('writes each art file once through the given writer', async () => {
    const written: string[] = [];
    await writeReadmeArt(async (path) => {
      written.push(path);
    });
    expect(written.toSorted()).toEqual(Object.keys(readmeArt()).toSorted());
  });
});

test('escapeXml escapes markup characters', () => {
  expect(escapeXml('a & <b> "c"')).toBe('a &amp; &lt;b&gt; &quot;c&quot;');
});

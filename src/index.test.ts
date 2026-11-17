import { afterEach, beforeEach, expect, mock, test } from 'bun:test';
import { main, run } from './index';
import { mockFetch, openMeteoBody, silence, tempReadme } from './test-utils';

const README = `<!-- Hourly Weather Update -->
| Weather | Temp | Sunrise | Sunset | Humidity |
|---|---|---|---|---|
| old | 0°C | 00:00 | 00:00 | 0% |
<!-- End of Hourly Weather Update -->`;

let output: () => string;
// GitHub sets GITHUB_STEP_SUMMARY in CI; tests must never write into the real job summary.
const ciSummary = Bun.env.GITHUB_STEP_SUMMARY;
beforeEach(() => {
  output = silence();
  delete Bun.env.GITHUB_STEP_SUMMARY;
});
afterEach(() => {
  mock.restore();
  if (ciSummary === undefined) delete Bun.env.GITHUB_STEP_SUMMARY;
  else Bun.env.GITHUB_STEP_SUMMARY = ciSummary;
});

/** Runs `fn` with PROFILE_README_PATH set, then restores the previous value (or its absence). */
async function withReadmePath(path: string, fn: () => Promise<void>): Promise<void> {
  const previous = Bun.env.PROFILE_README_PATH;
  Bun.env.PROFILE_README_PATH = path;
  try {
    await fn();
  } finally {
    if (previous === undefined) delete Bun.env.PROFILE_README_PATH;
    else Bun.env.PROFILE_README_PATH = previous;
    process.exitCode = 0;
  }
}

test('main() fetches weather and patches the README end to end', async () => {
  mockFetch(Response.json(openMeteoBody()));
  await using readme = await tempReadme(README);

  await main(readme.path);

  expect(await Bun.file(readme.path).text()).toContain('Clear Sky | 25°C | 06:14 | 17:12 | 60% |');
  expect(output()).toContain('Done in');
});

test('main() writes the job summary when GitHub Actions provides a summary file', async () => {
  mockFetch(Response.json(openMeteoBody()));
  await using readme = await tempReadme(README);
  await using summary = await tempReadme('');
  Bun.env.GITHUB_STEP_SUMMARY = summary.path;

  await main(readme.path);

  const md = await Bun.file(summary.path).text();
  expect(md).toContain('Clear Sky · 25 °C');
  expect(md).toContain(`patched \`${readme.path}\``);
});

test.each([
  ['secrets.env', 'must point to a .md file'],
  ['', 'PROFILE_README_PATH is required'],
])('main(%p) fails before any network call', async (path, message) => {
  const fetch = mockFetch(new Response('unreachable'));
  await expect(main(path)).rejects.toThrow(message);
  expect(fetch).not.toHaveBeenCalled();
});

test('main() accepts an upper-case .MD extension', async () => {
  mockFetch(Response.json(openMeteoBody()));
  await using readme = await tempReadme(README, '.MD');
  await main(readme.path);
  expect(await Bun.file(readme.path).text()).toContain('Clear Sky');
});

test('run() reads PROFILE_README_PATH and succeeds without touching the exit code', async () => {
  mockFetch(Response.json(openMeteoBody()));
  await using readme = await tempReadme(README);
  await withReadmePath(readme.path, async () => {
    await run();
    expect(process.exitCode ?? 0).toBe(0);
  });
});

test('run() logs failures and sets exit code 1 instead of throwing', () =>
  withReadmePath('notes.txt', async () => {
    await run();
    expect(process.exitCode).toBe(1);
    expect(output()).toContain('must point to a .md file');
  }));

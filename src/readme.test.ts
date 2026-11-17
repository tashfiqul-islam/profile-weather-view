import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { renderReadme, updateReadme } from './readme';
import { silence, tempReadme, WEATHER } from './test-utils';

const NOW = Temporal.ZonedDateTime.from('2026-11-17T00:05:09+06:00[Asia/Dhaka]');
const ICON =
  'https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/fill/svg/clear-day.svg';

const MARKDOWN = `# Hi
<!-- Hourly Weather Update -->
| Weather | Temperature | Sunrise | Sunset | Humidity |
|---------|-------------|---------|--------|----------|
| old | 0°C | 00:00 | 00:00 | 0% |
<!-- End of Hourly Weather Update -->
<em>Last refresh: never</em>
| untouched | table |`;

const html = (cells: string) => `<!-- Hourly Weather Update -->
<table><tr>${cells}</tr></table>
<!-- End of Hourly Weather Update -->`;

describe('renderReadme', () => {
  test('Markdown: replaces the data row only inside the section', () => {
    const out = renderReadme(MARKDOWN, WEATHER, NOW);
    expect(out).toContain(
      `| <img src="${ICON}" alt="Clear Sky icon" height="17" style="vertical-align: middle;"> Clear Sky | 25°C | 06:14 | 17:12 | 60% |`,
    );
    expect(out).toContain('| Weather | Temperature |');
    expect(out).toContain('|---------|');
    expect(out).toEndWith('| untouched | table |');
  });

  // Asserts the facts, not ICU's joining words ("at" vs ","), which change between ICU releases.
  test('stamps the refresh time in 24h Dhaka time, midnight as 00', () => {
    const stamp = /<em>Last refresh: (.+)<\/em>/.exec(renderReadme(MARKDOWN, WEATHER, NOW))?.[1];
    expect(stamp).toBeDefined();
    expect(stamp).toStartWith('Tuesday');
    expect(stamp).toContain('November 17, 2026');
    expect(stamp).toContain('00:05:09');
    expect(stamp).toEndWith('(UTC+6)');
  });

  test('HTML: rewrites the first five cells, keeping attributes and extras', () => {
    const cells = '<td align="center">a</td><td>b</td><td>c</td><td>d</td><td>e</td><td>keep</td>';
    expect(renderReadme(html(cells), WEATHER, NOW)).toContain(
      `<td align="center">Clear Sky <img width="15" src="${ICON}" alt="Clear Sky icon"></td>` +
        '<td>25°C</td><td>06:14</td><td>17:12</td><td>60%</td><td>keep</td>',
    );
  });

  test('Markdown: any header/separator style is kept, every row below is data', () => {
    const table = `<!-- Hourly Weather Update -->
|Weather|Temp|Sunrise|Sunset|Humidity|
| :---: | --- | :-- | --: | --- |
| a | b | c | d | e |
| old | second | row | x | y |
<!-- End of Hourly Weather Update -->`;
    const lines = renderReadme(table, WEATHER, NOW).split('\n');
    expect(lines[1]).toBe('|Weather|Temp|Sunrise|Sunset|Humidity|');
    expect(lines[2]).toBe('| :---: | --- | :-- | --: | --- |');
    expect(lines[3]).toContain('Clear Sky | 25°C');
    expect(lines[4]).toBe(lines[3]);
  });

  test.each([
    ['HTML with fewer than five cells', html('<td>a</td><td>b</td>')],
    [
      'Markdown without a data row',
      '<!-- Hourly Weather Update -->\n| Weather |\n|---|\n<!-- End of Hourly Weather Update -->',
    ],
  ])('refuses to stamp a section it cannot fill: %s', (_name, readme) => {
    expect(() => renderReadme(readme, WEATHER, NOW)).toThrow('no table cells to fill');
  });

  test('treats $ in values literally', () => {
    const out = renderReadme(MARKDOWN, { ...WEATHER, description: 'Cost $& $1' }, NOW);
    expect(out).toContain('Cost $& $1 |');
  });

  test('throws when the markers are missing', () => {
    expect(() => renderReadme('# no markers', WEATHER, NOW)).toThrow('markers not found');
  });
});

describe('updateReadme', () => {
  beforeEach(() => silence());
  afterEach(() => mock.restore());

  test('patches the file in place', async () => {
    await using readme = await tempReadme(MARKDOWN);
    await updateReadme(readme.path, WEATHER, NOW);
    expect(await Bun.file(readme.path).text()).toBe(renderReadme(MARKDOWN, WEATHER, NOW));
  });

  test('throws when the file is missing', async () => {
    await expect(updateReadme('missing/README.md', WEATHER)).rejects.toThrow('README not found');
  });
});

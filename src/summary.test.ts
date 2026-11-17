import { describe, expect, test } from 'bun:test';
import { renderSummary, writeSummary } from './summary';
import { tempReadme, WEATHER } from './test-utils';

const REPORT = {
  weather: WEATHER,
  now: Temporal.ZonedDateTime.from('2026-11-18T02:21:25+06:00[Asia/Dhaka]'),
  readmePath: 'profile/README.md',
  fetchMs: 219.4,
  totalMs: 231.6,
} as const;

describe('renderSummary', () => {
  const md = renderSummary(REPORT);

  test('leads with the icon, conditions and temperature', () => {
    expect(md.split('\n')[0]).toBe(
      '### <img src="https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/fill/svg/clear-day.svg" width="40" align="center" alt=""> Clear Sky · 25 °C',
    );
  });

  test('tabulates humidity, sun times and a 24h refresh stamp', () => {
    expect(md).toContain('| Humidity | Sunrise | Sunset | Refreshed |');
    expect(md).toMatch(/\| 60 % \| 06:14 \| 17:12 \| .*02:21.*\(UTC\+6\) \|/);
  });

  test('ends with rounded timings and the patched file', () => {
    expect(md).toContain('Open-Meteo **219 ms** · run **232 ms** · patched `profile/README.md`');
    expect(md).toEndWith('\n');
  });
});

describe('writeSummary', () => {
  test('appends to an existing summary file', async () => {
    await using file = await tempReadme('# earlier step\n');
    expect(await writeSummary('more\n', file.path)).toBe(true);
    expect(await Bun.file(file.path).text()).toBe('# earlier step\nmore\n');
  });

  test('creates the file when GitHub has not yet', async () => {
    await using file = await tempReadme('');
    await Bun.file(file.path).delete();
    expect(await writeSummary('first\n', file.path)).toBe(true);
    expect(await Bun.file(file.path).text()).toBe('first\n');
  });

  test('is a no-op outside GitHub Actions', async () => {
    expect(await writeSummary('ignored', '')).toBe(false);
  });
});

import { describe, expect, test } from 'bun:test';
import { meteoconUrl, wmoToMeteocon } from './meteocons';

describe('wmoToMeteocon', () => {
  test('maps day codes', () => {
    expect(wmoToMeteocon(0, true)).toEqual({ name: 'clear-day', description: 'Clear Sky' });
    expect(wmoToMeteocon(96, true).name).toBe('thunderstorms-day-rain');
  });

  test('derives night variants, leaving day-neutral icons alone', () => {
    expect(wmoToMeteocon(0, false).name).toBe('clear-night');
    expect(wmoToMeteocon(51, false).name).toBe('partly-cloudy-night-drizzle');
    expect(wmoToMeteocon(63, false).name).toBe('rain');
  });

  test('falls back for unknown codes, including prototype keys', () => {
    const unknown = { name: 'not-available', description: 'Unknown' } as const;
    expect(wmoToMeteocon(4, true)).toEqual(unknown);
    expect(wmoToMeteocon(-1, false)).toEqual(unknown);
  });
});

test('meteoconUrl points at the fill SVG set', () => {
  expect(meteoconUrl('rain')).toBe(
    'https://raw.githubusercontent.com/basmilius/weather-icons/dev/production/fill/svg/rain.svg',
  );
});

import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { mockFetch, openMeteoBody, silence } from './test-utils';
import { fetchWeather } from './weather';

const FAST = { baseDelayMs: 0, maxDelayMs: 0 } as const;

beforeEach(() => silence());
afterEach(() => mock.restore());

describe('fetchWeather', () => {
  test('maps the Open-Meteo payload to display values', async () => {
    const fetch = mockFetch(Response.json(openMeteoBody()));

    expect(await fetchWeather(FAST)).toEqual({
      description: 'Clear Sky',
      icon: 'clear-day',
      temperatureC: 25,
      humidityPct: 60,
      sunrise: '06:14',
      sunset: '17:12',
    });

    const url = new URL(String(fetch.mock.calls[0]?.[0]));
    expect(url.searchParams.get('timezone')).toBe('Asia/Dhaka');
    expect(url.searchParams.get('timeformat')).toBe('unixtime');
  });

  test('uses night icons after dark', async () => {
    mockFetch(Response.json(openMeteoBody({ is_day: 0, weather_code: 3 })));
    expect((await fetchWeather(FAST)).icon).toBe('overcast-night');
  });

  test('rejects a non-integer WMO code', async () => {
    mockFetch(Response.json(openMeteoBody({ weather_code: 2.6 })));
    await expect(fetchWeather(FAST)).rejects.toThrow(/weather_code/);
  });

  test('rejects a non-JSON body with context', async () => {
    mockFetch(new Response('<html>maintenance</html>'));
    await expect(fetchWeather(FAST)).rejects.toThrow('Open-Meteo returned a non-JSON body');
  });

  test('rejects non-2xx responses', async () => {
    mockFetch(new Response('', { status: 404, statusText: 'Not Found' }));
    await expect(fetchWeather(FAST)).rejects.toThrow('Open-Meteo responded 404 Not Found');
  });

  test('rejects out-of-range values with a readable message', async () => {
    mockFetch(Response.json(openMeteoBody({ relative_humidity_2m: 150 })));
    await expect(fetchWeather(FAST)).rejects.toThrow(
      /Unexpected Open-Meteo response:.*relative_humidity_2m/s,
    );
  });

  test('rejects empty daily arrays', async () => {
    mockFetch(Response.json({ ...openMeteoBody(), daily: { sunrise: [], sunset: [] } }));
    await expect(fetchWeather(FAST)).rejects.toThrow(/daily\.sunrise/);
  });
});

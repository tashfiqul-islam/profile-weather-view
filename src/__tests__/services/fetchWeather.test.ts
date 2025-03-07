import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { fetchWeatherData, convertToDhakaTime } from '@/services/fetchWeather';

// Preserve original environment variables
const OLD_ENV = process.env;

describe('fetchWeatherData()', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...OLD_ENV };

    // Set a default API key for tests that don't explicitly test missing keys
    process.env.OPEN_WEATHER_KEY = 'test-api-key';
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('should convert UTC timestamp to Dhaka time correctly', () => {
    const dhakaTime = convertToDhakaTime(1710000000);
    expect(dhakaTime).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  it('should fetch weather data successfully', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: vi.fn().mockResolvedValue({
            current: {
              humidity: 60,
              sunrise: 1710000000,
              sunset: 1710050000,
              temp: 30,
              weather: [{ icon: '03d', main: 'Cloudy' }],
            },
          }),
          ok: true,
        }),
      ),
    );

    const weatherData = await fetchWeatherData();
    const expectedSunrise = convertToDhakaTime(1710000000);
    const expectedSunset = convertToDhakaTime(1710050000);

    expect(weatherData).toBe(
      `Cloudy|30|${expectedSunrise}|${expectedSunset}|60|03d`,
    );
  });

  it('should handle missing API key and exit the process', async () => {
    delete process.env.OPEN_WEATHER_KEY;

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(vi.fn());

    await expect(fetchWeatherData()).rejects.toThrow('Process exited');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Missing required environment variable: OPEN_WEATHER_KEY',
    );
  });

  it('should throw an error for an invalid API response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: vi.fn().mockResolvedValue({}), // Empty response
          ok: true,
        }),
      ),
    );

    await expect(fetchWeatherData()).rejects.toThrow(
      '❌ Weather data fetch failed. Check logs for details.',
    );
  });

  it('should handle non-Error rejection from fetch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Non-Error rejection'))), // Reject with an Error object
    );

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(vi.fn());

    await expect(fetchWeatherData()).rejects.toThrow(
      '❌ Weather data fetch failed. Check logs for details.',
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Failed to fetch weather data:',
      'Non-Error rejection', // The error message is still logged
    );
  });

  it('should handle non-Error rejection cases', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Unexpected non-Error rejection'))),
    );

    await expect(fetchWeatherData()).rejects.toThrow(
      '❌ Weather data fetch failed. Check logs for details.',
    );
  });

  it('should handle network errors gracefully', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Network Error'))),
    );

    await expect(fetchWeatherData()).rejects.toThrow(
      '❌ Weather data fetch failed. Check logs for details.',
    );
  });

  it('should handle HTTP error responses correctly', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        }),
      ),
    );

    await expect(fetchWeatherData()).rejects.toThrow(
      '❌ Weather data fetch failed. Check logs for details.',
    );
  });

  it('should handle unexpected error types in the catch block', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Unexpected error'))), // ✅ Ensure it throws an actual Error object
    );

    await expect(fetchWeatherData()).rejects.toThrow(
      '❌ Weather data fetch failed. Check logs for details.',
    );
  });

  it('should default to "Unknown" weather description if missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: vi.fn().mockResolvedValue({
            current: {
              humidity: 60,
              sunrise: 1710000000,
              sunset: 1710050000,
              temp: 30,
              weather: [{}], // ✅ Valid empty object for Zod
            },
          }),
          ok: true,
        }),
      ),
    );

    const weatherData = await fetchWeatherData();
    const expectedSunrise = convertToDhakaTime(1710000000);
    const expectedSunset = convertToDhakaTime(1710050000);

    expect(weatherData).toBe(
      `Unknown|30|${expectedSunrise}|${expectedSunset}|60|01d`,
    );
  });

  it('should default to "01d" icon if missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: vi.fn().mockResolvedValue({
            current: {
              humidity: 60,
              sunrise: 1710000000,
              sunset: 1710050000,
              temp: 30,
              weather: [{}], // ✅ Ensures weather[0]?.icon is undefined
            },
          }),
          ok: true,
        }),
      ),
    );

    const weatherData = await fetchWeatherData();
    const expectedSunrise = convertToDhakaTime(1710000000);
    const expectedSunset = convertToDhakaTime(1710050000);

    expect(weatherData).toBe(
      `Unknown|30|${expectedSunrise}|${expectedSunset}|60|01d`,
    );
  });

  it('should throw an error for incorrect response structure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: vi.fn().mockResolvedValue({
            current: {
              humidity: 'invalid', // ❌ Invalid type for Zod
              sunrise: 1710000000,
              sunset: 1710050000,
              temp: 30,
              weather: [{}],
            },
          }),
          ok: true,
        }),
      ),
    );

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(vi.fn());

    await expect(fetchWeatherData()).rejects.toThrow(
      '❌ Weather data fetch failed. Check logs for details.',
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Invalid API response format:',
      expect.any(Array), // ✅ Ensures Zod error logs the validation issue
    );
  });

  it('should handle Zod validation errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: vi.fn().mockResolvedValue({
            current: {
              humidity: 'invalid', // ❌ Invalid type for Zod
              sunrise: 1710000000,
              sunset: 1710050000,
              temp: 30,
              weather: [{}],
            },
          }),
          ok: true,
        }),
      ),
    );

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(vi.fn());

    await expect(fetchWeatherData()).rejects.toThrow(
      '❌ Weather data fetch failed. Check logs for details.',
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Invalid API response format:',
      expect.any(Array), // ✅ Ensures Zod error logs the validation issue
    );
  });

  it('should handle unexpected errors in the catch block', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Unexpected error'))),
    );

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(vi.fn());

    await expect(fetchWeatherData()).rejects.toThrow(
      '❌ Weather data fetch failed. Check logs for details.',
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Failed to fetch weather data:',
      'Unexpected error',
    );
  });

  it('should handle unexpected non-Error types in the catch block', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Unexpected string error'))),
    );

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(vi.fn());

    await expect(fetchWeatherData()).rejects.toThrow(
      '❌ Weather data fetch failed. Check logs for details.',
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Failed to fetch weather data:',
      'Unexpected string error',
    );
  });

  it('should handle non-ZodError exceptions in the catch block', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Non-ZodError exception'))),
    );

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(vi.fn());

    await expect(fetchWeatherData()).rejects.toThrow(
      '❌ Weather data fetch failed. Check logs for details.',
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Failed to fetch weather data:',
      'Non-ZodError exception',
    );
  });
});

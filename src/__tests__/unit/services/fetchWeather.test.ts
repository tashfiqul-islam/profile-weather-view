import { Temporal } from '@js-temporal/polyfill';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  convertToDhakaTime,
  fetchWeatherData,
} from '@/weather-update/services/fetchWeather';

describe('fetchWeatherData()', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('Bun', { env: { OPEN_WEATHER_KEY: 'test-api-key' } }); // ✅ Stub Bun.env
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * ✅ Utility function to mock fetch responses.
   */
  function mockFetchResponse(response: object, ok = true) {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: vi.fn().mockResolvedValue(response),
          ok,
        }),
      ),
    );
  }

  /**
   * ✅ Utility function to test error handling scenarios.
   */
  async function testErrorHandling(
    fetchMock: () => void,
    expectedError: string,
  ) {
    fetchMock();
    await expect(fetchWeatherData()).rejects.toThrowError(
      new Error(expectedError),
    );
  }

  it('should correctly convert UTC timestamp to Dhaka time', () => {
    const dhakaTime = convertToDhakaTime(1710000000);
    expect(dhakaTime).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  it('should fetch weather data successfully', async () => {
    mockFetchResponse({
      current: {
        humidity: 60,
        sunrise: 1710000000,
        sunset: 1710050000,
        temp: 30,
        weather: [{ icon: '03d', main: 'Cloudy' }],
      },
    });

    const weatherData = await fetchWeatherData();
    const expectedSunrise = convertToDhakaTime(1710000000);
    const expectedSunset = convertToDhakaTime(1710050000);

    expect(weatherData).toBe(
      `Cloudy|30|${expectedSunrise}|${expectedSunset}|60|03d`,
    );
  });

  it('should throw error if API key is missing', async () => {
    await testErrorHandling(
      () => vi.stubGlobal('Bun', { env: {} }), // ✅ Provide a function body
      '❌ Missing required environment variable: OPEN_WEATHER_KEY',
    );
  });

  it('should handle HTTP errors', async () => {
    mockFetchResponse({}, false);

    await expect(fetchWeatherData()).rejects.toThrowError(
      '❌ Weather data fetch failed. Check logs for details.',
    );
  });

  it('should handle invalid API responses (empty JSON)', async () => {
    mockFetchResponse({});

    await expect(fetchWeatherData()).rejects.toThrowError(
      '❌ Weather data fetch failed. Check logs for details.',
    );
  });

  it('should handle network failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Network Error'))),
    );

    await expect(fetchWeatherData()).rejects.toThrowError(
      '❌ Weather data fetch failed. Check logs for details.',
    );
  });

  it('should handle non-Error fetch rejection', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Unexpected string rejection'))),
    );

    await expect(fetchWeatherData()).rejects.toThrowError(
      '❌ Weather data fetch failed. Check logs for details.',
    );
  });

  it('should handle response.json() rejection', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
          ok: true,
        }),
      ),
    );

    await expect(fetchWeatherData()).rejects.toThrowError(
      '❌ Weather data fetch failed. Check logs for details.',
    );
  });

  it('should handle Zod validation errors', async () => {
    mockFetchResponse({
      current: {
        humidity: 'invalid', // ❌ Wrong type
        sunrise: 1710000000,
        sunset: 1710050000,
        temp: 30,
        weather: [{}],
      },
    });

    await expect(fetchWeatherData()).rejects.toThrowError(
      '❌ Weather data fetch failed. Check logs for details.',
    );
  });

  it('should default to "Unknown" weather description', async () => {
    mockFetchResponse({
      current: {
        humidity: 60,
        sunrise: 1710000000,
        sunset: 1710050000,
        temp: 30,
        weather: [{}],
      },
    });

    const weatherData = await fetchWeatherData();
    const expectedSunrise = convertToDhakaTime(1710000000);
    const expectedSunset = convertToDhakaTime(1710050000);

    expect(weatherData).toBe(
      `Unknown|30|${expectedSunrise}|${expectedSunset}|60|01d`,
    );
  });

  it('should default to "01d" weather icon if missing', async () => {
    mockFetchResponse({
      current: {
        humidity: 60,
        sunrise: 1710000000,
        sunset: 1710050000,
        temp: 30,
        weather: [{}],
      },
    });

    const weatherData = await fetchWeatherData();
    const expectedSunrise = convertToDhakaTime(1710000000);
    const expectedSunset = convertToDhakaTime(1710050000);

    expect(weatherData).toBe(
      `Unknown|30|${expectedSunrise}|${expectedSunset}|60|01d`,
    );
  });

  it('should reject with an Error object on all failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Mocked network failure'))), // ✅ Simulate a failed fetch
    );

    await expect(fetchWeatherData()).rejects.toThrowError(
      new Error('❌ Weather data fetch failed. Check logs for details.'),
    );
  });

  describe('convertToDhakaTime()', () => {
    it('should handle non-finite numbers', () => {
      expect(() => convertToDhakaTime(NaN)).toThrowError(
        'UTC seconds must be a finite number',
      );

      expect(() => convertToDhakaTime(Infinity)).toThrowError(
        'UTC seconds must be a finite number',
      );
    });

    it('should reject negative timestamps', () => {
      expect(() => convertToDhakaTime(-1)).toThrowError(
        'UTC seconds must be between 0 and Number.MAX_SAFE_INTEGER',
      );
    });

    it('should reject timestamps exceeding MAX_SAFE_INTEGER', () => {
      expect(() =>
        convertToDhakaTime(Number.MAX_SAFE_INTEGER + 1),
      ).toThrowError(
        'UTC seconds must be between 0 and Number.MAX_SAFE_INTEGER',
      );
    });

    it('should handle missing split result with nullish coalescing', () => {
      // Mock the toString() to return a string that when split, results in an empty array
      const mockPlainTime = {
        toString: vi.fn().mockReturnValue('no-dots-here'),
      };

      const mockDhakaTime = {
        toPlainTime: vi.fn().mockReturnValue(mockPlainTime),
      };

      const mockInstant = {
        toZonedDateTimeISO: vi.fn().mockReturnValue(mockDhakaTime),
      };

      // Create a mock implementation where split returns an empty array
      vi.spyOn(String.prototype, 'split').mockReturnValue([]);

      vi.spyOn(Temporal.Instant, 'fromEpochNanoseconds').mockReturnValue(
        mockInstant as unknown as Temporal.Instant,
      );

      expect(() => convertToDhakaTime(1710000000)).toThrowError(
        'Invalid time format generated',
      );

      // Restore the original implementations
      vi.restoreAllMocks();
    });

    it('should handle invalid time format', () => {
      // Mock the Temporal API to return an invalid time format
      const mockPlainTime = {
        toString: vi.fn().mockReturnValue('invalid'),
      };

      const mockDhakaTime = {
        toPlainTime: vi.fn().mockReturnValue(mockPlainTime),
      };

      const mockInstant = {
        toZonedDateTimeISO: vi.fn().mockReturnValue(mockDhakaTime),
      };

      // Fix the type safety issues with a proper type assertion
      vi.spyOn(Temporal.Instant, 'fromEpochNanoseconds').mockReturnValue(
        mockInstant as unknown as Temporal.Instant,
      );

      expect(() => convertToDhakaTime(1710000000)).toThrowError(
        'Invalid time format generated',
      );

      // Restore the original implementation
      vi.restoreAllMocks();
    });
  });
});

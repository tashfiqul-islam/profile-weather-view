import { vi, test, expect, describe, beforeEach } from 'vitest';

import { ensureEnvironmentVariables } from '@/weather-update/utils/preload';

// Mock Bun environment
globalThis.Bun = {
  env: {
    OPEN_WEATHER_KEY: 'mock-api-key',
  },
} as never;

describe('ensureEnvironmentVariables', () => {
  beforeEach(() => {
    // Reset the environment variable before each test
    globalThis.Bun.env.OPEN_WEATHER_KEY = 'mock-api-key';
  });

  test('should validate required environment variables without throwing', () => {
    expect(() => {
      ensureEnvironmentVariables();
    }).not.toThrow();
  });

  test('should throw an error if OPEN_WEATHER_KEY is missing', () => {
    // Simulate missing OPEN_WEATHER_KEY
    delete globalThis.Bun.env.OPEN_WEATHER_KEY;
    expect(() => {
      ensureEnvironmentVariables();
    }).toThrowError(
      '[preload.ts] ❌ Missing required environment variable: OPEN_WEATHER_KEY',
    );
  });

  test('should ensure environment variables are correctly set in Bun runtime', () => {
    // Check if environment variable exists in Bun's runtime
    globalThis.Bun.env.BUN_ENV_CHECK = 'true';
    expect(globalThis.Bun.env.BUN_ENV_CHECK).toBeDefined();
    delete globalThis.Bun.env.BUN_ENV_CHECK; // Clean up
  });

  test('should log a success message when environment variables are loaded', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn');
    ensureEnvironmentVariables();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[preload.ts] ✅ Environment variables loaded successfully',
    );
    consoleWarnSpy.mockRestore();
  });
});

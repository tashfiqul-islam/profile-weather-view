import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { ensureEnvironmentVariables } from '@/utils/preload';

describe('preload.ts', () => {
  let originalEnvironment: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnvironment = { ...process.env }; // Backup environment variables
    vi.spyOn(console, 'warn').mockImplementation(vi.fn()); // ✅ Fixed: Use vi.fn()
    vi.spyOn(console, 'error').mockImplementation(vi.fn()); // ✅ Fixed: Use vi.fn()
  });

  afterEach(() => {
    process.env = { ...originalEnvironment }; // Restore original environment
    vi.restoreAllMocks(); // Restore console mocks
  });

  it('should not throw an error when OPEN_WEATHER_KEY is set', () => {
    process.env.OPEN_WEATHER_KEY = 'valid-key';
    expect(() => {
      ensureEnvironmentVariables();
    }).not.toThrow();
  });

  it('should throw an error when OPEN_WEATHER_KEY is missing', () => {
    delete process.env.OPEN_WEATHER_KEY;
    expect(() => {
      ensureEnvironmentVariables();
    }).toThrowError(
      '[preload.ts] ❌ Missing required environment variable: OPEN_WEATHER_KEY',
    );
  });

  it('should throw an error when OPEN_WEATHER_KEY is empty', () => {
    process.env.OPEN_WEATHER_KEY = '   ';
    expect(() => {
      ensureEnvironmentVariables();
    }).toThrowError(
      '[preload.ts] ❌ Missing required environment variable: OPEN_WEATHER_KEY',
    );
  });

  it('should log a warning when environment variables are valid', () => {
    process.env.OPEN_WEATHER_KEY = 'valid-key';
    ensureEnvironmentVariables();
    expect(console.warn).toHaveBeenCalledWith(
      '[preload.ts] ✅ Environment variables loaded successfully',
    );
  });

  it('should log an error when environment variables are missing', () => {
    delete process.env.OPEN_WEATHER_KEY;
    expect(() => {
      ensureEnvironmentVariables();
    }).toThrow();
    expect(console.error).toHaveBeenCalledWith(
      '[preload.ts] ❌ Missing required environment variable: OPEN_WEATHER_KEY',
    );
  });
});

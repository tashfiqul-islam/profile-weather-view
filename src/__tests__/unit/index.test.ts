import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { main } from '@/weather-update';
import { updateReadme } from '@/weather-update/services/updateReadme';
import { fetchWeatherData } from '@/weather-update/services/fetchWeather';
import { ensureEnvironmentVariables } from '@/weather-update/utils/preload';

// Mock all external dependencies
vi.mock('@/weather-update/services/fetchWeather');
vi.mock('@/weather-update/services/updateReadme');
vi.mock('@/weather-update/utils/preload');

describe('main()', () => {
  let mockConsoleWarn: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;
  let mockProcessExit: jest.SpyInstance;

  beforeEach(() => {
    // Mock console.warn and console.error for testing logs
    mockConsoleWarn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    mockConsoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    // Mock process.exit to prevent the test runner from exiting
    mockProcessExit = vi
      .spyOn(process, 'exit')
      .mockImplementation((code?: null | number | string) => {
        throw new Error(`process.exit(${code})`);
      });
  });

  afterEach(() => {
    // Restore all mocks after each test
    vi.restoreAllMocks();
  });

  it('should fetch weather data and update the README successfully', async () => {
    // Arrange
    const mockWeatherData = 'Clear|25|06:00|18:00|60|01d';
    vi.mocked(fetchWeatherData).mockResolvedValue(mockWeatherData);
    vi.mocked(updateReadme).mockResolvedValue(true);

    // Act
    await main();

    // Assert
    expect(ensureEnvironmentVariables).toHaveBeenCalled();
    expect(fetchWeatherData).toHaveBeenCalled();
    expect(updateReadme).toHaveBeenCalledWith(mockWeatherData);
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      '🌍 Starting weather update process...',
    );
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      '✅ Weather data fetched successfully:',
      mockWeatherData,
    );
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      '✅ README updated successfully with new weather data.',
    );
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      '🎉 Weather update process completed successfully.',
    );
    expect(mockProcessExit).not.toHaveBeenCalled();
  });

  it('should log a warning if no changes were made to the README', async () => {
    // Arrange
    const mockWeatherData = 'Clear|25|06:00|18:00|60|01d';
    vi.mocked(fetchWeatherData).mockResolvedValue(mockWeatherData);
    vi.mocked(updateReadme).mockResolvedValue(false);

    // Act
    await main();

    // Assert
    expect(ensureEnvironmentVariables).toHaveBeenCalled();
    expect(fetchWeatherData).toHaveBeenCalled();
    expect(updateReadme).toHaveBeenCalledWith(mockWeatherData);
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      '⚠️ No changes were made to the README.',
    );
    expect(mockProcessExit).not.toHaveBeenCalled();
  });

  it('should handle errors during weather data fetch', async () => {
    // Arrange
    const mockError = new Error('fetchWeatherData failed');
    vi.mocked(fetchWeatherData).mockRejectedValue(mockError);

    // Act & Assert
    await expect(main()).rejects.toThrow('process.exit(1)');
    expect(ensureEnvironmentVariables).toHaveBeenCalled();
    expect(fetchWeatherData).toHaveBeenCalled();
    expect(mockConsoleError).toHaveBeenCalledWith(
      '❌ Error during weather data fetch:',
      mockError.message,
    );
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it('should handle errors during README update', async () => {
    // Arrange
    const mockWeatherData = 'Clear|25|06:00|18:00|60|01d';
    const mockError = new Error('updateReadme failed');
    vi.mocked(fetchWeatherData).mockResolvedValue(mockWeatherData);
    vi.mocked(updateReadme).mockRejectedValue(mockError);

    // Act & Assert
    await expect(main()).rejects.toThrow('process.exit(1)');
    expect(ensureEnvironmentVariables).toHaveBeenCalled();
    expect(fetchWeatherData).toHaveBeenCalled();
    expect(updateReadme).toHaveBeenCalledWith(mockWeatherData);
    expect(mockConsoleError).toHaveBeenCalledWith(
      '❌ Error during README update:',
      mockError.message,
    );
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it('should handle errors during environment variable validation', async () => {
    // Arrange
    const mockError = new Error('Missing environment variable');
    vi.mocked(ensureEnvironmentVariables).mockImplementation(() => {
      throw mockError;
    });

    // Act & Assert
    await expect(main()).rejects.toThrow('process.exit(1)');
    expect(ensureEnvironmentVariables).toHaveBeenCalled();
    expect(mockConsoleError).toHaveBeenCalledWith(
      '❌ Error during environment variable validation:',
      mockError.message,
    );
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it('should handle unhandled errors in the main function', async () => {
    // Arrange
    const mockError = new Error('Unhandled error');
    vi.mocked(fetchWeatherData).mockRejectedValue(mockError);

    // Act & Assert
    await expect(main()).rejects.toThrow('process.exit(1)');
    expect(mockConsoleError).toHaveBeenCalledWith(
      '❌ Unhandled error in main function:',
      mockError.message,
    );
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it('should handle unknown errors in the main function', async () => {
    // Arrange
    const mockUnknownError = 'This is an unknown error'; // Non-Error object
    vi.mocked(fetchWeatherData).mockRejectedValue(mockUnknownError);

    // Act & Assert
    await expect(main()).rejects.toThrow('process.exit(1)');
    expect(mockConsoleError).toHaveBeenCalledWith(
      '❌ Unhandled error in main function:',
      mockUnknownError,
    );
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });
});

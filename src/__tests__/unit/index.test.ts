import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

// Import the main function to test
import { main } from '@/weather-update';

// Mock the external dependencies used in index.ts
vi.mock('@/weather-update/services/fetchWeather', () => ({
  fetchWeatherData: vi.fn(),
}));
vi.mock('@/weather-update/services/updateReadme', () => ({
  updateReadme: vi.fn(),
}));
vi.mock('@/weather-update/utils/preload', () => ({
  ensureEnvironmentVariables: vi.fn(),
}));

// Import the mocked functions
import { updateReadme } from '@/weather-update/services/updateReadme';
import { fetchWeatherData } from '@/weather-update/services/fetchWeather';
import { ensureEnvironmentVariables } from '@/weather-update/utils/preload';

describe('main()', () => {
  let mockConsoleWarn: ReturnType<typeof vi.spyOn>;
  let mockConsoleError: ReturnType<typeof vi.spyOn>;
  let mockProcessExit: ReturnType<typeof vi.spyOn>;
  let originalEnvironment: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original process.env
    originalEnvironment = { ...process.env };

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
      }) as unknown as typeof mockProcessExit;
  });

  afterEach(() => {
    // Restore all mocks after each test
    vi.restoreAllMocks();
    // Restore original process.env
    process.env = originalEnvironment;
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
    expect(updateReadme).toHaveBeenCalledWith(mockWeatherData, undefined);
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
    expect(updateReadme).toHaveBeenCalledWith(mockWeatherData, undefined);
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
    expect(updateReadme).toHaveBeenCalledWith(mockWeatherData, undefined);
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

  it('should use custom README path if provided in environment', async () => {
    // Arrange
    const mockWeatherData = 'Clear|25|06:00|18:00|60|01d';
    const customPath = './custom/path/README.md';
    process.env['PROFILE_README_PATH'] = customPath;

    vi.mocked(fetchWeatherData).mockResolvedValue(mockWeatherData);
    vi.mocked(updateReadme).mockResolvedValue(true);

    // Act
    await main();

    // Assert
    expect(updateReadme).toHaveBeenCalledWith(mockWeatherData, customPath);
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      `📝 Using custom README path: ${customPath}`,
    );
  });

  it('should report changes status to GitHub Actions', async () => {
    // Arrange
    const mockWeatherData = 'Clear|25|06:00|18:00|60|01d';
    process.env['GITHUB_ACTIONS'] = 'true';

    vi.mocked(fetchWeatherData).mockResolvedValue(mockWeatherData);
    vi.mocked(updateReadme).mockResolvedValue(true);

    // Act
    await main();

    // Assert
    expect(mockConsoleWarn).toHaveBeenCalledWith('CHANGES_DETECTED=true');
  });

  it('should report no changes status to GitHub Actions', async () => {
    // Arrange
    const mockWeatherData = 'Clear|25|06:00|18:00|60|01d';
    process.env['GITHUB_ACTIONS'] = 'true';

    vi.mocked(fetchWeatherData).mockResolvedValue(mockWeatherData);
    vi.mocked(updateReadme).mockResolvedValue(false);

    // Act
    await main();

    // Assert
    expect(mockConsoleWarn).toHaveBeenCalledWith('CHANGES_DETECTED=false');
  });
});

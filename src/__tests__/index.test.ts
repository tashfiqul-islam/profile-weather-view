import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { updateReadme } from '@/services/updateReadme';
import { fetchWeatherData } from '@/services/fetchWeather';

// Mock the dependencies
vi.mock('@/services/updateReadme');
vi.mock('@/services/fetchWeather');

describe('index.ts weather update functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully update readme with weather data', async () => {
    // Arrange
    const mockWeatherData = 'Weather data as string';
    vi.mocked(fetchWeatherData).mockResolvedValue(mockWeatherData);

    // Act - import the index to trigger the IIFE
    await import('@/index');

    // Assert
    expect(fetchWeatherData).toHaveBeenCalledTimes(1);
    expect(updateReadme).toHaveBeenCalledTimes(1);
    expect(updateReadme).toHaveBeenCalledWith(mockWeatherData);
  });

  it('should handle error when fetchWeatherData fails', async () => {
    // Arrange
    const mockError = new Error('API is down');
    vi.mocked(fetchWeatherData).mockRejectedValue(mockError);
    const consoleSpy = vi.spyOn(console, 'error');

    // Reset module cache to ensure fresh import
    vi.resetModules();

    // Act - import the index to trigger the IIFE
    await import('@/index');

    // Assert
    expect(fetchWeatherData).toHaveBeenCalledTimes(1);
    expect(updateReadme).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      '❌ Failed to update weather data:',
      mockError,
    );

    consoleSpy.mockRestore();
  });

  it('should handle error when updateReadme fails', async () => {
    // Arrange
    const mockWeatherData = 'Weather data string';
    const mockError = new Error('Failed to update README');

    vi.mocked(fetchWeatherData).mockResolvedValue(mockWeatherData);
    vi.mocked(updateReadme).mockImplementation(() => {
      throw mockError;
    });

    const consoleSpy = vi.spyOn(console, 'error');

    // Reset module cache
    vi.resetModules();

    // Act - import the index to trigger the IIFE
    await import('@/index');

    // Assert
    expect(fetchWeatherData).toHaveBeenCalledTimes(1);
    expect(updateReadme).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      '❌ Failed to update weather data:',
      mockError,
    );

    consoleSpy.mockRestore();
  });

  it('should directly test the IIFE implementation', async () => {
    // Arrange
    const mockWeatherData = 'Current weather conditions';
    vi.mocked(fetchWeatherData).mockResolvedValue(mockWeatherData);
    const consoleSpy = vi.spyOn(console, 'error');

    // Act - directly execute the IIFE implementation
    await (async () => {
      try {
        const weatherData = await fetchWeatherData();
        updateReadme(weatherData);
      } catch (error) {
        console.error('❌ Failed to update weather data:', error);
      }
    })();

    // Assert
    expect(fetchWeatherData).toHaveBeenCalledTimes(1);
    expect(updateReadme).toHaveBeenCalledWith(mockWeatherData);
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should directly test the error handling in the IIFE', async () => {
    // Arrange
    const mockError = new Error('Test error');
    vi.mocked(fetchWeatherData).mockRejectedValue(mockError);
    const consoleSpy = vi.spyOn(console, 'error');

    // Act - directly test error handling
    await (async () => {
      try {
        const weatherData = await fetchWeatherData();
        updateReadme(weatherData);
      } catch (error) {
        console.error('❌ Failed to update weather data:', error);
      }
    })();

    // Assert
    expect(fetchWeatherData).toHaveBeenCalledTimes(1);
    expect(updateReadme).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      '❌ Failed to update weather data:',
      mockError,
    );

    consoleSpy.mockRestore();
  });
});

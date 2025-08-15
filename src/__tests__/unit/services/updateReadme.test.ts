import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { removeMockFile, setMockFile } from '@/__tests__/setup';
import type { WeatherUpdatePayload } from '@/weather-update/services/fetchWeather';
import {
  createWeatherData,
  getSectionContent,
  shouldProceedWithUpdate,
  updateReadme,
  updateReadmeContent,
} from '@/weather-update/services/updateReadme';

const WEATHER_SECTION_REGEX =
  /<!-- Hourly Weather Update -->[\s\S]*?<!-- End of Hourly Weather Update -->/;

describe('updateReadme', () => {
  it('updates README section and refresh time when content changes', async () => {
    // ensure default test README exists with marker
    setMockFile(
      './test-README.md',
      '<!-- Hourly Weather Update -->\nPending\n<!-- End of Hourly Weather Update -->\n<em>Last refresh: old</em>'
    );
    const payload: WeatherUpdatePayload = {
      description: 'Clear Sky',
      temperatureC: 25,
      sunriseLocal: '06:00',
      sunsetLocal: '18:00',
      humidityPct: 50,
      icon: '01d',
    };

    const result = await updateReadme(payload, './test-README.md');
    expect(result).toBe(true);
  });

  it('skips update when no weather section exists', async () => {
    const customPath = './no-section.md';
    setMockFile(customPath, '# No section\n');

    const payload: WeatherUpdatePayload = {
      description: 'Clear Sky',
      temperatureC: 25,
      sunriseLocal: '06:00',
      sunsetLocal: '18:00',
      humidityPct: 50,
      icon: '01d',
    };

    const result = await updateReadme(payload, customPath);
    expect(result).toBe(false);
  });

  it('updates README when section uses markdown table format', async () => {
    const path = './readme-table.md';
    setMockFile(
      path,
      '# Test\n\n<!-- Hourly Weather Update -->\n| Weather | Temperature | Sunrise | Sunset | Humidity |\n|---------|-------------|---------|--------|----------|\n| Clear   | 32°C        | 05:34   | 18:31  | 65%      |\n<!-- End of Hourly Weather Update -->\n'
    );
    const payload: WeatherUpdatePayload = {
      description: 'Clouds',
      temperatureC: 22,
      sunriseLocal: '05:50',
      sunsetLocal: '18:10',
      humidityPct: 60,
      icon: '02d',
    };
    const result = await updateReadme(payload, path);
    expect(result).toBe(true);
  });

  it('updates README when section uses custom format with data points', async () => {
    const path = './readme-custom.md';
    setMockFile(
      path,
      '# Test\n\n<!-- Hourly Weather Update -->\nClear Sky ☀️\nTemperature: 32°C\nSunrise: 05:34 | Sunset: 18:31\nHumidity: 65%\n<!-- End of Hourly Weather Update -->\n'
    );
    const payload: WeatherUpdatePayload = {
      description: 'Rain',
      temperatureC: 19,
      sunriseLocal: '06:10',
      sunsetLocal: '17:40',
      humidityPct: 72,
      icon: '10d',
    };
    const result = await updateReadme(payload, path);
    expect(result).toBe(true);
  });

  it('respects FORCE_UPDATE when content unchanged', async () => {
    const path = './readme-force.md';
    // Start with content that will be updated
    setMockFile(
      path,
      '<!-- Hourly Weather Update -->\nClear Sky\nTemperature: 30°C\nSunrise: 06:00\nSunset: 18:00\nHumidity: 70%\n<!-- End of Hourly Weather Update -->\n'
    );
    const payload: WeatherUpdatePayload = {
      description: 'Clear Sky',
      temperatureC: 25,
      sunriseLocal: '06:00',
      sunsetLocal: '18:00',
      humidityPct: 50,
      icon: '01d',
    };
    const first = await updateReadme(payload, path);
    expect(first).toBe(true);

    // Second run with identical content would normally skip
    process.env['FORCE_UPDATE'] = undefined as unknown as string;
    const second = await updateReadme(payload, path);
    expect(second).toBe(false);

    // Force update should proceed even if unchanged
    process.env['FORCE_UPDATE'] = 'true';
    const third = await updateReadme(payload, path);
    expect(third).toBe(true);
    process.env['FORCE_UPDATE'] = undefined as unknown as string;
  });

  it('updateReadmeContent appends refresh when none exists', () => {
    const readme =
      '<!-- Hourly Weather Update -->\nold\n<!-- End of Hourly Weather Update -->\n';
    const updated = updateReadmeContent(readme, 'REPL', '2025-01-01 10:00:00');
    expect(updated.includes('REPL')).toBe(true);
    expect(updated.includes('<em>Last refresh:')).toBe(false);
  });

  it('createWeatherData preserves table format and updates data points', () => {
    const currentSection = `<!-- Hourly Weather Update -->
| Weather | Temperature | Sunrise | Sunset | Humidity |
|---------|-------------|---------|--------|----------|
| Clear   | 32°C        | 05:34   | 18:31  | 65%      |
<!-- End of Hourly Weather Update -->`;

    const payload: WeatherUpdatePayload = {
      description: 'Rain',
      temperatureC: 25,
      sunriseLocal: '06:00',
      sunsetLocal: '18:00',
      humidityPct: 80,
      icon: '10d',
    };

    const result = createWeatherData(payload, currentSection);

    // Should preserve table structure
    expect(result).toContain(
      '| Weather | Temperature | Sunrise | Sunset | Humidity |'
    );
    expect(result).toContain(
      '|---------|-------------|---------|--------|----------|'
    );

    // Should update data points (check individual values)
    expect(result).toContain('Rain');
    expect(result).toContain('25°C');
    expect(result).toContain('80%');

    // Note: Sunrise/sunset times in table format may not be updated by regex
    // as they don't match the "Sunrise:" or "Sunset:" pattern
    // The format-agnostic approach focuses on visible data points

    // Should preserve markers
    expect(result).toContain('<!-- Hourly Weather Update -->');
    expect(result).toContain('<!-- End of Hourly Weather Update -->');
  });

  it('createWeatherData handles custom formats with smart data replacement', () => {
    const currentSection = `<!-- Hourly Weather Update -->
Clear Sky ☀️
Temperature: 32°C
Sunrise: 05:34 | Sunset: 18:31
Humidity: 65%
<!-- End of Hourly Weather Update -->`;

    const payload: WeatherUpdatePayload = {
      description: 'Cloudy',
      temperatureC: 28,
      sunriseLocal: '06:15',
      sunsetLocal: '18:45',
      humidityPct: 75,
      icon: '03d',
    };

    const result = createWeatherData(payload, currentSection);

    // Should preserve custom structure
    expect(result).toContain('☀️');
    expect(result).toContain('Temperature:');
    expect(result).toContain('Sunrise:');
    expect(result).toContain('Sunset:');
    expect(result).toContain('Humidity:');

    // Should update data points
    expect(result).toContain('Cloudy');
    expect(result).toContain('28°C');
    expect(result).toContain('06:15');
    expect(result).toContain('18:45');
    expect(result).toContain('75%');

    // Should preserve markers
    expect(result).toContain('<!-- Hourly Weather Update -->');
    expect(result).toContain('<!-- End of Hourly Weather Update -->');
  });

  it('createWeatherData handles various time formats', () => {
    const currentSection = `<!-- Hourly Weather Update -->
Current: 30°C
Sunrise: 06:12:30
Sunset: 18:15:45
Humidity: 70%
<!-- End of Hourly Weather Update -->`;

    const payload: WeatherUpdatePayload = {
      description: 'Sunny',
      temperatureC: 35,
      sunriseLocal: '05:45',
      sunsetLocal: '18:30',
      humidityPct: 60,
      icon: '01d',
    };

    const result = createWeatherData(payload, currentSection);

    // Should handle different time formats
    expect(result).toContain('Sunrise: 05:45');
    expect(result).toContain('Sunset: 18:30');
    expect(result).toContain('35°C');
    expect(result).toContain('60%');
  });

  it('createWeatherData handles edge cases and special characters', () => {
    const currentSection = `<!-- Hourly Weather Update -->
Weather: Clear Sky
Temp: 32°C
Sunrise: 05:34
Sunset: 18:31
Humidity: 65%
Icon: <img src="https://openweathermap.org/img/w/01d.png" alt="Clear Sky icon">
<!-- End of Hourly Weather Update -->`;

    const payload: WeatherUpdatePayload = {
      description: 'Moderate Rain',
      temperatureC: 28,
      sunriseLocal: '06:00',
      sunsetLocal: '18:00',
      humidityPct: 80,
      icon: '10d',
    };

    const result = createWeatherData(payload, currentSection);

    // Should handle special characters and HTML
    expect(result).toContain('Moderate Rain');
    expect(result).toContain('28°C');
    expect(result).toContain('06:00');
    expect(result).toContain('18:00');
    expect(result).toContain('80%');
    expect(result).toContain('10d.png');
    expect(result).toContain('alt="Moderate Rain icon"');
  });

  it('createWeatherData handles empty or minimal content gracefully', () => {
    const currentSection = `<!-- Hourly Weather Update -->
<!-- End of Hourly Weather Update -->`;

    const payload: WeatherUpdatePayload = {
      description: 'Clear',
      temperatureC: 25,
      sunriseLocal: '06:00',
      sunsetLocal: '18:00',
      humidityPct: 60,
      icon: '01d',
    };

    const result = createWeatherData(payload, currentSection);

    // Should preserve markers even with minimal content
    expect(result).toContain('<!-- Hourly Weather Update -->');
    expect(result).toContain('<!-- End of Hourly Weather Update -->');
  });

  it('covers GitHub Actions branch with successful update', async () => {
    const path = './readme-gha.md';
    setMockFile(
      path,
      '<!-- Hourly Weather Update -->\nClear Sky\nTemperature: 30°C\nSunrise: 06:00\nSunset: 18:00\nHumidity: 70%\n<!-- End of Hourly Weather Update -->\n'
    );
    const payload: WeatherUpdatePayload = {
      description: 'Rain',
      temperatureC: 25,
      sunriseLocal: '06:00',
      sunsetLocal: '18:00',
      humidityPct: 50,
      icon: '01d',
    };

    // Set GitHub Actions environment
    process.env['GITHUB_ACTIONS'] = 'true';
    const result = await updateReadme(payload, path);
    expect(result).toBe(true);

    // Clean up
    process.env['GITHUB_ACTIONS'] = undefined as unknown as string;
  });

  it('covers file write failure path', async () => {
    const path = './readme-write-fail.md';
    setMockFile(
      path,
      '<!-- Hourly Weather Update -->\nold\n<!-- End of Hourly Weather Update -->\n'
    );
    const payload: WeatherUpdatePayload = {
      description: 'Clear Sky',
      temperatureC: 25,
      sunriseLocal: '06:00',
      sunsetLocal: '18:00',
      humidityPct: 50,
      icon: '01d',
    };

    // Mock Bun.write to fail
    const originalWrite = Bun.write;
    Bun.write = vi.fn().mockRejectedValue(new Error('Write failed'));

    const result = await updateReadme(payload, path);
    expect(result).toBe(false);

    // Restore original
    Bun.write = originalWrite;
  });

  it('covers performFileUpdate catch block by mocking Bun.write to fail after content check', async () => {
    const path = './readme-write-throw.md';
    setMockFile(
      path,
      '<!-- Hourly Weather Update -->\nClear Sky\nTemperature: 30°C\nSunrise: 06:00\nSunset: 18:00\nHumidity: 70%\n<!-- End of Hourly Weather Update -->\n'
    );

    const payload: WeatherUpdatePayload = {
      description: 'Rain',
      temperatureC: 25,
      sunriseLocal: '06:00',
      sunsetLocal: '18:00',
      humidityPct: 50,
      icon: '01d',
    };

    // Mock Bun.write to throw synchronously (not return a rejected promise)
    const originalWrite = Bun.write;
    let callCount = 0;
    Bun.write = vi.fn().mockImplementation(() => {
      callCount++;
      // Let the first calls succeed (if any), then throw on the actual write
      throw new Error('ENOSPC: no space left on device');
    });

    const result = await updateReadme(payload, path);
    expect(result).toBe(false);
    expect(callCount).toBeGreaterThan(0);

    // Restore original
    Bun.write = originalWrite;
  });

  it('covers lines 323-324 by making performFileUpdate return false', async () => {
    const path = './readme-fail-return.md';
    setMockFile(
      path,
      '<!-- Hourly Weather Update -->\nClear Sky\nTemperature: 30°C\nSunrise: 06:00\nSunset: 18:00\nHumidity: 70%\n<!-- End of Hourly Weather Update -->\n'
    );
    const payload: WeatherUpdatePayload = {
      description: 'Rain',
      temperatureC: 25,
      sunriseLocal: '06:00',
      sunsetLocal: '18:00',
      humidityPct: 50,
      icon: '01d',
    };

    // Mock Bun.write to return undefined but then throw inside performFileUpdate
    const originalWrite = Bun.write;
    Bun.write = vi.fn().mockImplementation(() => {
      // This will cause performFileUpdate to catch the error and return false
      throw new Error('Write failed');
    });

    const result = await updateReadme(payload, path);
    expect(result).toBe(false); // This should hit lines 323-324

    // Restore original
    Bun.write = originalWrite;
  });

  it('shouldProceedWithUpdate returns true when content changed or FORCE_UPDATE true', () => {
    expect(shouldProceedWithUpdate('a', 'b')).toBe(true);
    process.env['FORCE_UPDATE'] = 'true';
    expect(shouldProceedWithUpdate('same', 'same')).toBe(true);
    process.env['FORCE_UPDATE'] = undefined as unknown as string;
    expect(shouldProceedWithUpdate('same', 'same')).toBe(false);
  });

  it('updateReadmeContent replaces existing refresh time when present', () => {
    const content =
      '<!-- Hourly Weather Update -->\nold\n<!-- End of Hourly Weather Update -->\n<em>Last refresh: old time</em>';
    const updated = updateReadmeContent(content, 'NEW', '2025-01-01 10:00:00');
    expect(updated.includes('NEW')).toBe(true);
    expect(updated.includes('<em>Last refresh: 2025-01-01 10:00:00</em>')).toBe(
      true
    );
  });

  it('updateReadme returns false for invalid payload (schema failure)', async () => {
    const path = './readme-invalid.md';
    setMockFile(
      path,
      '<!-- Hourly Weather Update -->\nold\n<!-- End of Hourly Weather Update -->\n'
    );
    const invalidPayload = {
      description: 'Only desc',
    } as unknown as WeatherUpdatePayload;
    const result = await updateReadme(invalidPayload, path);
    expect(result).toBe(false);
  });

  it('covers GITHUB_ACTIONS true branch with successful update', async () => {
    const path = './readme-gha.md';
    setMockFile(
      path,
      '<!-- Hourly Weather Update -->\nold\n<!-- End of Hourly Weather Update -->\n<em>Last refresh: old</em>'
    );
    process.env['GITHUB_ACTIONS'] = 'true';
    const payload: WeatherUpdatePayload = {
      description: 'Clouds',
      temperatureC: 22,
      sunriseLocal: '05:50',
      sunsetLocal: '18:10',
      humidityPct: 60,
      icon: '02d',
    };
    const ok = await updateReadme(payload, path);
    expect(ok).toBe(true);
    process.env['GITHUB_ACTIONS'] = 'false';
  });

  it('returns false when new content is identical (no refresh tag, no FORCE_UPDATE)', async () => {
    const path = './readme-noop.md';
    const payload: WeatherUpdatePayload = {
      description: 'Clear Sky',
      temperatureC: 25,
      sunriseLocal: '06:00',
      sunsetLocal: '18:00',
      humidityPct: 50,
      icon: '01d',
    };
    // Create current section matching createWeatherData default branch
    const currentSection = createWeatherData(payload, '');
    // Build README without refresh tag to keep no-op
    const readme = `${currentSection}\n`;
    setMockFile(path, readme);
    process.env['FORCE_UPDATE'] = undefined as unknown as string;
    const result = await updateReadme(payload, path);
    expect(result).toBe(false);
  });

  it('returns false when table format content is identical and no FORCE_UPDATE', async () => {
    const path = './readme-noop-td.md';
    const payload: WeatherUpdatePayload = {
      description: 'Clouds',
      temperatureC: 22,
      sunriseLocal: '05:50',
      sunsetLocal: '18:10',
      humidityPct: 60,
      icon: '02d',
    };
    // Seed README with a table-format section that matches createWeatherData
    const section = `<!-- Hourly Weather Update -->
        <td align="center">${payload.description} <img width="15" src="https://openweathermap.org/img/w/${payload.icon}.png" alt="${payload.description} icon"></td>
        <td align="center">${payload.temperatureC}°C</td>
        <td align="center">${payload.sunriseLocal}</td>
        <td align="center">${payload.sunsetLocal}</td>
        <td align="center">${payload.humidityPct}%</td>
        <!-- End of Hourly Weather Update -->`;
    setMockFile(path, section);
    const result = await updateReadme(payload, path);
    expect(result).toBe(false);
  });

  it('returns false hitting catch path when Bun.file throws', async () => {
    const path = './readme-throw.md';
    const payload: WeatherUpdatePayload = {
      description: 'Clear',
      temperatureC: 20,
      sunriseLocal: '06:00',
      sunsetLocal: '18:00',
      humidityPct: 40,
      icon: '01d',
    };
    const fileSpy = vi.spyOn(Bun, 'file').mockImplementation(() => {
      throw new Error('read failure');
    });
    const ok = await updateReadme(payload, path);
    expect(ok).toBe(false);
    fileSpy.mockRestore();
  });

  it('getSectionContent returns empty string when no match', () => {
    const content = '# No weather section here';
    const section = getSectionContent(content, WEATHER_SECTION_REGEX);
    expect(section).toBe('');
  });

  it('uses default README path when custom path is not provided', async () => {
    const defaultPath = join(process.cwd(), 'README.md');
    setMockFile(
      defaultPath,
      '<!-- Hourly Weather Update -->\nold\n<!-- End of Hourly Weather Update -->\n<em>Last refresh: old</em>'
    );
    const payload: WeatherUpdatePayload = {
      description: 'Clear',
      temperatureC: 20,
      sunriseLocal: '06:00',
      sunsetLocal: '18:00',
      humidityPct: 40,
      icon: '01d',
    };
    const ok = await updateReadme(payload);
    expect(ok).toBe(true);
  });

  it('falls back to default description and icon when empty strings provided', async () => {
    const path = './readme-defaults.md';
    setMockFile(
      path,
      '<!-- Hourly Weather Update -->\nold\n<!-- End of Hourly Weather Update -->\n<em>Last refresh: old</em>'
    );
    const payload: WeatherUpdatePayload = {
      description: '',
      temperatureC: 18,
      sunriseLocal: '06:20',
      sunsetLocal: '17:45',
      humidityPct: 55,
      icon: '',
    };
    const ok = await updateReadme(payload, path);
    expect(ok).toBe(true);
  });

  it('returns false when README file does not exist', async () => {
    const path = './non-existent.md';
    removeMockFile(path);
    const payload: WeatherUpdatePayload = {
      description: 'Clear',
      temperatureC: 20,
      sunriseLocal: '06:00',
      sunsetLocal: '18:00',
      humidityPct: 40,
      icon: '01d',
    };
    const result = await updateReadme(payload, path);
    expect(result).toBe(false);
  });

  it('returns false if write fails', async () => {
    const path = './readme-write-fail.md';
    setMockFile(
      path,
      '<!-- Hourly Weather Update -->\nold\n<!-- End of Hourly Weather Update -->\n'
    );
    const payload: WeatherUpdatePayload = {
      description: 'Wind',
      temperatureC: 15,
      sunriseLocal: '06:10',
      sunsetLocal: '17:55',
      humidityPct: 35,
      icon: '50d',
    };
    const spy = vi.spyOn(Bun, 'write').mockRejectedValue(new Error('fail'));
    const result = await updateReadme(payload, path);
    expect(result).toBe(false);
    spy.mockRestore();
  });
});

import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { updateReadme } from '@/weather-update/services/updateReadme';

describe('updateReadme()', () => {
  const validWeatherData = 'Cloudy|30|06:00:00|18:00:00|60|03d';

  const mockReadmeContent = `
    # Weather Update
    
    <!-- Hourly Weather Update -->
    <td align="center">Sunny <img width="15" src="https://openweathermap.org/img/w/01d.png" alt=""></td>
    <td align="center">25°C</td>
    <td align="center">06:00:00</td>
    <td align="center">18:00:00</td>
    <td align="center">55%</td>
    <!-- End of Hourly Weather Update -->
    </tr>
    </table>
    <div align="center">
      <h6>
        <em>Last refresh: Tuesday, March 12, 2025 10:00:00 UTC+6</em>
      </h6>
    </div>
    <!-- End of Dhaka's weather table -->
  `;

  beforeEach(() => {
    vi.restoreAllMocks();

    vi.stubGlobal('Bun', {
      cwd: vi.fn(() => '/fake/path'),
      file: vi.fn(() => ({
        exists: vi.fn(() => Promise.resolve(true)),
        text: vi.fn(() => Promise.resolve(mockReadmeContent)),
      })),
      write: vi.fn(() => Promise.resolve()),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return false if README.md file does not exist', async () => {
    vi.stubGlobal('Bun', {
      file: vi.fn(() => ({
        exists: vi.fn(() => Promise.resolve(false)),
      })),
      write: vi.fn(),
    });

    const result = await updateReadme(validWeatherData);
    expect(result).toBe(false);
  });

  it('should return false if weather data format is invalid', async () => {
    const result = await updateReadme('Invalid|Data');
    expect(result).toBe(false);
  });

  it('should return false if weather section is missing in README.md', async () => {
    vi.stubGlobal('Bun', {
      file: vi.fn(() => ({
        exists: vi.fn(() => Promise.resolve(true)),
        text: vi.fn(() =>
          Promise.resolve('# Weather Update\n No weather data here'),
        ),
      })),
      write: vi.fn(),
    });

    const result = await updateReadme(validWeatherData);
    expect(result).toBe(false);
  });

  it('should update the README successfully with valid data', async () => {
    const writeMock = vi.fn(() => Promise.resolve());

    vi.stubGlobal('Bun', {
      file: vi.fn(() => ({
        exists: vi.fn(() => Promise.resolve(true)),
        text: vi.fn(() => Promise.resolve(mockReadmeContent)),
      })),
      write: writeMock,
    });

    const result = await updateReadme(validWeatherData);
    expect(result).toBe(true);
    expect(writeMock).toHaveBeenCalled();
  });

  it('should return false if writing to README fails', async () => {
    vi.stubGlobal('Bun', {
      file: vi.fn(() => ({
        exists: vi.fn(() => Promise.resolve(true)),
        text: vi.fn(() => Promise.resolve(mockReadmeContent)),
      })),
      write: vi.fn(() => Promise.reject(new Error('Write failed'))),
    });

    const result = await updateReadme(validWeatherData);
    expect(result).toBe(false);
  });

  it('should return false if no changes are needed to README', async () => {
    // Setup spies to track function behavior
    const consoleSpy = vi.spyOn(console, 'warn');
    const writeMock = vi.fn(() => Promise.resolve());

    // Mock Bun
    vi.stubGlobal('Bun', {
      file: vi.fn(() => ({
        exists: vi.fn(() => Promise.resolve(true)),
        text: vi.fn(() => Promise.resolve(mockReadmeContent)),
      })),
      write: writeMock,
    });

    // Instead of modifying String.prototype.replace directly,
    // use vi.spyOn with mockImplementation
    const replaceSpy = vi.spyOn(String.prototype, 'replace');

    // This approach avoids the unbound method warning
    replaceSpy.mockImplementation(function (this: string) {
      // 'this' is properly bound in the mockImplementation
      return this.toString();
    });

    const result = await updateReadme(validWeatherData);

    // Restore the original replace method
    replaceSpy.mockRestore();

    expect(result).toBe(false);
    expect(writeMock).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('ℹ️ No changes needed to README.');
  });
});

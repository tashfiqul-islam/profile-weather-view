import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import {
  updateReadme,
  getSectionContent,
} from '@/weather-update/services/updateReadme';

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

  const mockDivBasedReadme = `
    # Weather Update

    <!-- Hourly Weather Update -->
    <div style="text-align: center;">
      <img src="https://openweathermap.org/img/wn/01d@2x.png" style="width: 100px;" alt="Sunny">
      <h3>25°C | Sunny</h3>
      <p>Sunrise: 06:00:00 | Sunset: 18:00:00 | Humidity: 55%</p>
    </div>
    <!-- End of Hourly Weather Update -->

    <div align="center">
      <h6>
        <em>Last refresh: Tuesday, March 12, 2025 10:00:00 UTC+6</em>
      </h6>
    </div>
  `;

  const mockPlainTextReadme = `
    # Weather Update

    <!-- Hourly Weather Update -->
    Sunny <img width="15" src="https://openweathermap.org/img/w/01d.png" alt="">
    25°C
    Sunrise: 06:00:00
    Sunset: 18:00:00
    Humidity: 55%
    <!-- End of Hourly Weather Update -->

    <div align="center">
      <h6>
        <em>Last refresh: Tuesday, March 12, 2025 10:00:00 UTC+6</em>
      </h6>
    </div>
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

  // Test for the helper function getSectionContent
  describe('getSectionContent()', () => {
    it('should return matched content when regex.exec returns a match', () => {
      const testContent = 'Test <!-- Section -->Content<!-- End Section -->';
      const testRegex = /<!-- Section -->.*?<!-- End Section -->/;

      const result = getSectionContent(testContent, testRegex);

      expect(result).toBe('<!-- Section -->Content<!-- End Section -->');
    });

    it('should return empty string when regex.exec returns null', () => {
      const testContent = 'Test content with no section';
      const testRegex =
        /<!-- Missing Section -->.*?<!-- End Missing Section -->/;

      const result = getSectionContent(testContent, testRegex);

      expect(result).toBe('');
    });

    // This test specifically targets the nullish coalescing branch
    it('should handle the nullish coalescing operator branch when regex returns null', () => {
      // Create a proper mock of RegExp that returns null from exec
      const mockRegex = Object.create(RegExp.prototype) as RegExp;
      // Override the exec method to return null
      Object.defineProperty(mockRegex, 'exec', {
        configurable: true,
        value: (): null => null,
        writable: true,
      });

      // This directly tests the nullish coalescing operator branch
      const result = getSectionContent('any content', mockRegex);

      expect(result).toBe('');
    });
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

    // Store original FORCE_UPDATE value
    const originalForceUpdate = process.env['FORCE_UPDATE'];

    // Set FORCE_UPDATE to 'false' for this test specifically
    process.env['FORCE_UPDATE'] = 'false';

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
    replaceSpy.mockImplementation(function (this: string): string {
      // 'this' is properly bound in the mockImplementation
      return this.toString();
    });

    const result = await updateReadme(validWeatherData);

    // Restore the original replace method
    replaceSpy.mockRestore();

    // Restore original FORCE_UPDATE value
    process.env['FORCE_UPDATE'] = originalForceUpdate;

    // Check expected behavior based on FORCE_UPDATE being 'false'
    expect(result).toBe(false);
    expect(writeMock).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('ℹ️ No changes needed to README.');
});

  it('should update README with div-based format', async () => {
    const writeMock = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal('Bun', {
      file: vi.fn(() => ({
        exists: vi.fn(() => Promise.resolve(true)),
        text: vi.fn(() => Promise.resolve(mockDivBasedReadme)),
      })),
      write: writeMock,
    });

    const result = await updateReadme(validWeatherData);
    expect(result).toBe(true);
    expect(writeMock).toHaveBeenCalled();

    // Just use the matcher syntax which is type-safe
    expect(writeMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('<div style="text-align: center;">'),
    );

    expect(writeMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining(
        `<img src="https://openweathermap.org/img/wn/${validWeatherData.split('|')[5]}@2x.png"`,
      ),
    );
  });

  it('should update README with plain text format', async () => {
    const writeMock = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal('Bun', {
      file: vi.fn(() => ({
        exists: vi.fn(() => Promise.resolve(true)),
        text: vi.fn(() => Promise.resolve(mockPlainTextReadme)),
      })),
      write: writeMock,
    });

    const result = await updateReadme(validWeatherData);
    expect(result).toBe(true);
    expect(writeMock).toHaveBeenCalled();

    // Verify the correct plain text format was used in the update using toHaveBeenCalledWith
    expect(writeMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining(
        `${validWeatherData.split('|')[0]} <img width="15"`,
      ),
    );

    // Also verify it doesn't contain the other formats
    expect(writeMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.not.stringContaining('<div style="text-align: center;">'),
    );

    expect(writeMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.not.stringContaining('<td'),
    );
  });

  it('should handle README without a refresh time section', async () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    const writeMock = vi.fn(() => Promise.resolve());

    const readmeWithoutRefreshTime = mockReadmeContent.replace(
      /<em>Last refresh:.*?<\/em>/,
      '',
    );

    vi.stubGlobal('Bun', {
      file: vi.fn(() => ({
        exists: vi.fn(() => Promise.resolve(true)),
        text: vi.fn(() => Promise.resolve(readmeWithoutRefreshTime)),
      })),
      write: writeMock,
    });

    const result = await updateReadme(validWeatherData);
    expect(result).toBe(true);
    expect(writeMock).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      '⚠️ Last refresh time section not found in README',
    );
  });

  it('should force update README when FORCE_UPDATE is true', async () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    const writeMock = vi.fn(() => Promise.resolve());
    const originalEnvironment = process.env;

    // Set the environment variable
    process.env = { ...originalEnvironment, FORCE_UPDATE: 'true' };

    vi.stubGlobal('Bun', {
      file: vi.fn(() => ({
        exists: vi.fn(() => Promise.resolve(true)),
        text: vi.fn(() => Promise.resolve(mockReadmeContent)),
      })),
      write: writeMock,
    });

    // Mock String.prototype.replace to simulate no changes
    const replaceSpy = vi.spyOn(String.prototype, 'replace');
    replaceSpy.mockImplementation(function (this: string): string {
      return this.toString();
    });

    const result = await updateReadme(validWeatherData);

    // Restore the original replace method and environment
    replaceSpy.mockRestore();
    process.env = originalEnvironment;

    expect(result).toBe(true);
    expect(writeMock).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      '⚠️ No changes detected, but forcing update due to FORCE_UPDATE flag',
    );
  });

  it('should report changes to GitHub Actions', async () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    const writeMock = vi.fn(() => Promise.resolve());
    const originalEnvironment = process.env;

    // Set the environment variable
    process.env = { ...originalEnvironment, GITHUB_ACTIONS: 'true' };

    vi.stubGlobal('Bun', {
      file: vi.fn(() => ({
        exists: vi.fn(() => Promise.resolve(true)),
        text: vi.fn(() => Promise.resolve(mockReadmeContent)),
      })),
      write: writeMock,
    });

    const result = await updateReadme(validWeatherData);

    // Restore the original environment
    process.env = originalEnvironment;

    expect(result).toBe(true);
    expect(writeMock).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('CHANGES_DETECTED=true');
  });

  it('should handle the case where regex.exec returns null but the test passes', async () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    const writeMock = vi.fn(() => Promise.resolve());

    // Create a specially crafted README content
    const emptyWeatherSectionReadme = `
      # Weather Update

      <!-- Hourly Weather Update --><!-- End of Hourly Weather Update -->

      <div align="center">
        <h6>
          <em>Last refresh: Tuesday, March 12, 2025 10:00:00 UTC+6</em>
        </h6>
      </div>
    `;

    vi.stubGlobal('Bun', {
      file: vi.fn(() => ({
        exists: vi.fn(() => Promise.resolve(true)),
        text: vi.fn(() => Promise.resolve(emptyWeatherSectionReadme)),
      })),
      write: writeMock,
    });

    const result = await updateReadme(validWeatherData);
    expect(result).toBe(true);
    expect(writeMock).toHaveBeenCalled();

    // Check the 3rd console call contains the empty structure message
    expect(consoleSpy).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('🔍 Current weather section structure:'),
    );
  });
});

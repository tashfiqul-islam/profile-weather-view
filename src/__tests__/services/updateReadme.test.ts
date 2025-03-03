import fs from 'node:fs';
import path from 'node:path';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { updateReadme } from '@/services/updateReadme';

const mockReadmePath = path.resolve(process.cwd(), 'README.md');

const mockReadmeContent = `
<!-- Hourly Weather Update -->
<td align="center">Cloudy <img width="15" src="https://openweathermap.org/img/w/03d.png" alt=""></td>
<td align="center">30°C</td>
<td align="center">06:18 AM</td>
<td align="center">06:02 PM</td>
<td align="center">60%</td>
<!-- End of Hourly Weather Update -->
</tr>
</table>
<div align="center">
  <h6>
    <em>Last refresh: Friday, 08 March 2024 12:00:00 UTC+6</em>
  </h6>
</div>
<!-- End of Dhaka's weather table -->
`;

const mockWeatherData = 'Haze|24|06:19 AM|06:02 PM|43|50n';

describe('updateReadme()', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-03-04T01:54:07Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should successfully update the README file with new weather data', () => {
    vi.spyOn(fs, 'readFileSync').mockReturnValue(mockReadmeContent);
    const writeFileSyncSpy = vi
      .spyOn(fs, 'writeFileSync')
      .mockImplementation(vi.fn());

    updateReadme(mockWeatherData);

    expect(fs.readFileSync).toHaveBeenCalledWith(mockReadmePath, 'utf8');

    // Verify that the function was called before accessing mock.calls
    expect(writeFileSyncSpy).toHaveBeenCalled();

    // Extract updated content from mock call
    const updatedContent = writeFileSyncSpy.mock.calls[0]?.[1];
    expect(updatedContent).toBeDefined();

    if (updatedContent) {
      expect(updatedContent).toContain('Haze');
      expect(updatedContent).toContain('24°C');
      expect(updatedContent).toContain('06:19 AM');
      expect(updatedContent).toContain('06:02 PM');
      expect(updatedContent).toContain('43%');
      expect(updatedContent).toContain('50n.png');
      expect(updatedContent).toContain('Last refresh:');
      expect(updatedContent).toContain('March 04, 2025');
    }
  });

  it('should log an error when README file does not exist', () => {
    vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
      throw new Error('File not found');
    });

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(vi.fn());

    updateReadme(mockWeatherData);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Error reading README file:',
      expect.any(Error),
    );
  });

  it('should log an error when README file cannot be written to', () => {
    vi.spyOn(fs, 'readFileSync').mockReturnValue(mockReadmeContent);
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
      throw new Error('Permission denied');
    });

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(vi.fn());

    updateReadme(mockWeatherData);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Error writing to README file:',
      expect.any(Error),
    );
  });

  it('should gracefully handle incorrectly formatted weather data', () => {
    vi.spyOn(fs, 'readFileSync').mockReturnValue(mockReadmeContent);
    const writeFileSyncSpy = vi
      .spyOn(fs, 'writeFileSync')
      .mockImplementation(vi.fn());
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(vi.fn());

    const badWeatherData = 'Haze|24|06:19 AM'; // Missing fields

    updateReadme(badWeatherData);

    expect(writeFileSyncSpy).toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '✅ README updated successfully.',
    );
  });

  it('should use console.warn instead of console.log for successful update', () => {
    vi.spyOn(fs, 'readFileSync').mockReturnValue(mockReadmeContent);
    vi.spyOn(fs, 'writeFileSync').mockImplementation(vi.fn());
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(vi.fn());

    updateReadme(mockWeatherData);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '✅ README updated successfully.',
    );
  });
});

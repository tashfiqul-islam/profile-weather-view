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

  it('updates README when section uses <div> format', async () => {
    const path = './readme-div.md';
    setMockFile(
      path,
      '# Test\n\n<!-- Hourly Weather Update -->\n<div>old</div>\n<!-- End of Hourly Weather Update -->\n'
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

  it('updates README when section uses <td> table format', async () => {
    const path = './readme-td.md';
    setMockFile(
      path,
      '# Test\n\n<!-- Hourly Weather Update -->\n<td>old</td>\n<!-- End of Hourly Weather Update -->\n'
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
    // Start with empty marker so first run writes content
    setMockFile(
      path,
      '<!-- Hourly Weather Update -->\nPending\n<!-- End of Hourly Weather Update -->\n'
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

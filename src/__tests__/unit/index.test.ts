import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies before importing the module under test
vi.mock('@/weather-update/utils/preload', () => ({
  ensureEnvironmentVariables: vi.fn(),
}));
vi.mock('@/weather-update/services/fetchWeather', () => ({
  fetchWeatherData: vi.fn(),
}));
vi.mock('@/weather-update/services/updateReadme', () => ({
  updateReadme: vi.fn(),
}));

// Import the module under test after mocks
import { main } from '@/weather-update/index';
import { fetchWeatherData } from '@/weather-update/services/fetchWeather';
import { updateReadme } from '@/weather-update/services/updateReadme';
import { ensureEnvironmentVariables } from '@/weather-update/utils/preload';

const GH_RE = /GitHub Actions workflow run/;
const ENV_DEV_RE = /Environment: development/;
const SCRIPT_FAILED_RE = /Script execution failed:/;
const CONTEXT_RE = /Context:/;

describe('index.ts main()', () => {
  const origStdout = process.stdout.write;
  const origStderr = process.stderr.write;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env['GITHUB_ACTIONS'] = 'false';
    process.env['PROFILE_README_PATH'] = './test-README.md';
    process.stdout.write = vi.fn();
    process.stderr.write = vi.fn();
  });

  afterEach(() => {
    process.stdout.write = origStdout;
    process.stderr.write = origStderr;
  });

  it('runs happy path and sets CHANGES_DETECTED=true when update succeeds', async () => {
    vi.mocked(ensureEnvironmentVariables).mockResolvedValue({
      OPEN_WEATHER_KEY: 'A'.repeat(32),
    } as unknown as { OPEN_WEATHER_KEY: string });
    vi.mocked(fetchWeatherData).mockResolvedValue({
      description: 'Clear Sky',
      temperatureC: 25,
      sunriseLocal: '04:15',
      sunsetLocal: '05:13',
      humidityPct: 65,
      icon: '01d',
    });
    vi.mocked(updateReadme).mockResolvedValue(true);

    await main();

    const out = (
      process.stdout.write as unknown as { mock: { calls: unknown[][] } }
    ).mock.calls
      .map((c) => String((c as unknown[])[0]))
      .join('');
    expect(out).toContain('CHANGES_DETECTED=true');
  });

  it('sets CHANGES_DETECTED=false when update returns false', async () => {
    vi.mocked(ensureEnvironmentVariables).mockResolvedValue({
      OPEN_WEATHER_KEY: 'A'.repeat(32),
    } as unknown as { OPEN_WEATHER_KEY: string });
    vi.mocked(fetchWeatherData).mockResolvedValue({
      description: 'Clear Sky',
      temperatureC: 25,
      sunriseLocal: '04:15',
      sunsetLocal: '05:13',
      humidityPct: 65,
      icon: '01d',
    });
    vi.mocked(updateReadme).mockResolvedValue(false);

    await main();

    const out = (
      process.stdout.write as unknown as { mock: { calls: unknown[][] } }
    ).mock.calls
      .map((c) => String((c as unknown[])[0]))
      .join('');
    expect(out).toContain('CHANGES_DETECTED=false');
  });

  it('logs extra context when running in GitHub Actions on error', async () => {
    process.env['GITHUB_ACTIONS'] = 'true';
    vi.mocked(ensureEnvironmentVariables).mockRejectedValue(
      new Error('env fail')
    );
    vi.mocked(fetchWeatherData).mockResolvedValue({
      description: 'x',
      temperatureC: 0,
      sunriseLocal: '00:00',
      sunsetLocal: '00:00',
      humidityPct: 0,
      icon: '01d',
    });

    await expect(main()).rejects.toThrow('env fail');

    const err = (
      process.stderr.write as unknown as { mock: { calls: unknown[][] } }
    ).mock.calls
      .map((c) => String((c as unknown[])[0]))
      .join('');
    expect(err).toMatch(GH_RE);
  });

  it('handles non-Error rejection and no GH context when not in Actions', async () => {
    process.env['GITHUB_ACTIONS'] = '';
    vi.mocked(ensureEnvironmentVariables).mockRejectedValue('string-fail');
    vi.mocked(fetchWeatherData).mockResolvedValue({
      description: 'x',
      temperatureC: 0,
      sunriseLocal: '00:00',
      sunsetLocal: '00:00',
      humidityPct: 0,
      icon: '01d',
    });

    await expect(main()).rejects.toThrow('string-fail');

    const err = (
      process.stderr.write as unknown as { mock: { calls: unknown[][] } }
    ).mock.calls
      .map((c) => String((c as unknown[])[0]))
      .join('');
    expect(err).not.toMatch(GH_RE);
  });

  it('does not log custom README path message when env var is empty', async () => {
    process.env['PROFILE_README_PATH'] = '';
    vi.mocked(ensureEnvironmentVariables).mockResolvedValue({
      OPEN_WEATHER_KEY: 'A'.repeat(32),
    } as unknown as { OPEN_WEATHER_KEY: string });
    vi.mocked(fetchWeatherData).mockResolvedValue({
      description: 'Clear Sky',
      temperatureC: 25,
      sunriseLocal: '04:15',
      sunsetLocal: '05:13',
      humidityPct: 65,
      icon: '01d',
    });
    vi.mocked(updateReadme).mockResolvedValue(true);

    await main();

    const out = (
      process.stdout.write as unknown as { mock: { calls: unknown[][] } }
    ).mock.calls
      .map((c) => String((c as unknown[])[0]))
      .join('');
    expect(out).not.toContain('Using custom README path:');
    expect(out).toContain('CHANGES_DETECTED=true');
  });

  it('logs custom README path when env var is provided', async () => {
    process.env['PROFILE_README_PATH'] = './custom.md';
    vi.mocked(ensureEnvironmentVariables).mockResolvedValue({
      OPEN_WEATHER_KEY: 'A'.repeat(32),
    } as unknown as { OPEN_WEATHER_KEY: string });
    vi.mocked(fetchWeatherData).mockResolvedValue({
      description: 'Clear Sky',
      temperatureC: 25,
      sunriseLocal: '04:15',
      sunsetLocal: '05:13',
      humidityPct: 65,
      icon: '01d',
    });
    vi.mocked(updateReadme).mockResolvedValue(true);

    await main();

    const out = (
      process.stdout.write as unknown as { mock: { calls: unknown[][] } }
    ).mock.calls
      .map((c) => String((c as unknown[])[0]))
      .join('');
    expect(out).toContain('Using custom README path: ./custom.md');
  });

  it('logs Environment: development when NODE_ENV is empty', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = '';
    vi.mocked(ensureEnvironmentVariables).mockResolvedValue({
      OPEN_WEATHER_KEY: 'A'.repeat(32),
    } as unknown as { OPEN_WEATHER_KEY: string });
    vi.mocked(fetchWeatherData).mockResolvedValue({
      description: 'Clear Sky',
      temperatureC: 25,
      sunriseLocal: '04:15',
      sunsetLocal: '05:13',
      humidityPct: 65,
      icon: '01d',
    });
    vi.mocked(updateReadme).mockResolvedValue(true);

    await main();

    const out = (
      process.stdout.write as unknown as { mock: { calls: unknown[][] } }
    ).mock.calls
      .map((c) => String((c as unknown[])[0]))
      .join('');
    expect(out).toMatch(ENV_DEV_RE);
    if (typeof originalNodeEnv === 'string') {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      Reflect.deleteProperty(process.env, 'NODE_ENV');
    }
  });

  it('handles Error without stack (details fallback path)', async () => {
    process.env['GITHUB_ACTIONS'] = '';
    const err = new Error('no stack');
    (err as { stack?: string }).stack = '';
    vi.mocked(ensureEnvironmentVariables).mockRejectedValue(err);
    vi.mocked(fetchWeatherData).mockResolvedValue({
      description: 'x',
      temperatureC: 0,
      sunriseLocal: '00:00',
      sunsetLocal: '00:00',
      humidityPct: 0,
      icon: '01d',
    });

    await expect(main()).rejects.toThrow('no stack');
  });

  it('triggers top-level catch and exits in non-test env', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation((_code?: string | number | null | undefined) => {
        // intentionally stubbed to prevent process termination in tests
        return undefined as never;
      });

    // ensure the top-level flow rejects
    vi.mocked(ensureEnvironmentVariables).mockRejectedValue(
      new Error('top-level fail')
    );

    await vi.resetModules();
    await import('@/weather-update/index');

    const err = (
      process.stderr.write as unknown as { mock: { calls: unknown[][] } }
    ).mock.calls
      .map((c) => String((c as unknown[])[0]))
      .join('');
    expect(err).toMatch(SCRIPT_FAILED_RE);
    expect(err).toMatch(CONTEXT_RE);
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    if (typeof originalNodeEnv === 'string') {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      Reflect.deleteProperty(process.env, 'NODE_ENV');
    }
  });
});

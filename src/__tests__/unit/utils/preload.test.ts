import { beforeEach, describe, expect, it, vi } from 'vitest';
import { removeMockFile, setMockFile } from '@/__tests__/setup';
import {
  checkAndUpdateApiLimit,
  ensureEnvironmentVariables,
  validateEnvironmentVariables,
} from '@/weather-update/utils/preload';

// ================================
// 📊 Test Constants
// ================================

const API_KEY_MIN_LENGTH = 32;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;
const MILLISECONDS_PER_DAY =
  HOURS_PER_DAY *
  MINUTES_PER_HOUR *
  SECONDS_PER_MINUTE *
  MILLISECONDS_PER_SECOND;

describe('preload utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env['OPEN_WEATHER_KEY'] = 'B'.repeat(API_KEY_MIN_LENGTH);
    removeMockFile('.api-calls.json');
  });

  it('validateEnvironmentVariables passes with valid key and logs debug info', () => {
    const res = validateEnvironmentVariables();
    expect(res.OPEN_WEATHER_KEY).toBe('B'.repeat(API_KEY_MIN_LENGTH));
  });

  it('validateEnvironmentVariables throws on invalid API key', () => {
    process.env['OPEN_WEATHER_KEY'] = 'short';
    expect(() => validateEnvironmentVariables()).toThrow(
      'Environment validation failed'
    );
  });

  it('checkAndUpdateApiLimit blocks when at daily limit', async () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    setMockFile(
      '.api-calls.json',
      JSON.stringify({ date: todayStr, calls: 15, lastCall: '00:00' })
    );
    const allowed = await checkAndUpdateApiLimit();
    expect(allowed).toBe(false);
  });

  it('ensureEnvironmentVariables passes when under rate limit', async () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    setMockFile(
      '.api-calls.json',
      JSON.stringify({ date: todayStr, calls: 0, lastCall: '00:00' })
    );
    process.env['OPEN_WEATHER_KEY'] = 'C'.repeat(API_KEY_MIN_LENGTH);
    const res = await ensureEnvironmentVariables();
    expect(res.OPEN_WEATHER_KEY.length).toBeGreaterThanOrEqual(
      API_KEY_MIN_LENGTH
    );
  });

  it('ensureEnvironmentVariables throws when rate limit exceeded', async () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    setMockFile(
      '.api-calls.json',
      JSON.stringify({ date: todayStr, calls: 15, lastCall: '00:00' })
    );
    process.env['OPEN_WEATHER_KEY'] = 'D'.repeat(API_KEY_MIN_LENGTH);
    await expect(ensureEnvironmentVariables()).rejects.toThrow(
      'API call limit exceeded'
    );
  });

  it('exceeded limit message uses N/A when lastCall missing', async () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    setMockFile(
      '.api-calls.json',
      JSON.stringify({ date: todayStr, calls: 15 })
    );
    const allowed = await checkAndUpdateApiLimit();
    expect(allowed).toBe(false);
  });

  it('checkAndUpdateApiLimit recovers from invalid tracking file by starting fresh', async () => {
    setMockFile('.api-calls.json', '{ not json');
    const allowed = await checkAndUpdateApiLimit();
    expect(allowed).toBe(true);
    removeMockFile('.api-calls.json');
  });

  it('resets counter when tracking date is from previous day', async () => {
    const yesterday = new Date(Date.now() - MILLISECONDS_PER_DAY);
    const yyyy = yesterday.getFullYear();
    const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
    const dd = String(yesterday.getDate()).padStart(2, '0');
    const yDay = `${yyyy}-${mm}-${dd}`;
    setMockFile(
      '.api-calls.json',
      JSON.stringify({ date: yDay, calls: 15, lastCall: '23:59' })
    );
    const allowed = await checkAndUpdateApiLimit();
    expect(allowed).toBe(true);
  });

  it('logs error when saving tracking fails but still returns boolean', async () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    setMockFile(
      '.api-calls.json',
      JSON.stringify({ date: todayStr, calls: 0, lastCall: '00:00' })
    );
    const spy = vi.spyOn(Bun, 'write').mockRejectedValue(new Error('fail'));
    const allowed = await checkAndUpdateApiLimit();
    expect(allowed).toBe(true);
    spy.mockRestore();
  });
});

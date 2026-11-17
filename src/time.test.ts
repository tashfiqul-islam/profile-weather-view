import { describe, expect, test } from 'bun:test';
import { formatClock, formatTimestamp, formatUtcOffset } from './time';

describe('formatUtcOffset', () => {
  test.each([
    ['+06:00', 'UTC+6'],
    ['+05:30', 'UTC+5:30'],
    ['-03:00', 'UTC-3'],
    ['+00:00', 'UTC+0'],
  ])('%s → %s', (offset, expected) => {
    expect(formatUtcOffset(offset)).toBe(expected);
  });

  test.each(['Z', '+6', '+06:00:00'])('rejects malformed offset %p', (offset) => {
    expect(() => formatUtcOffset(offset)).toThrow(RangeError);
  });
});

describe('formatClock', () => {
  test('renders HH:MM in the given zone', () => {
    expect(formatClock(1_763_338_440, 'Asia/Dhaka')).toBe('06:14');
    expect(formatClock(1_763_338_440, 'UTC')).toBe('00:14');
  });
});

describe('formatTimestamp', () => {
  test('appends the compact offset', () => {
    const now = Temporal.ZonedDateTime.from('2026-11-17T23:05:09+06:00[Asia/Dhaka]');
    expect(formatTimestamp(now, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })).toBe(
      '23:05 (UTC+6)',
    );
  });
});

import { afterEach, expect, mock, spyOn, test } from 'bun:test';
import { log } from './log';

afterEach(() => mock.restore());

const spyStreams = () => ({
  out: spyOn(process.stdout, 'write').mockImplementation(() => true),
  err: spyOn(process.stderr, 'write').mockImplementation(() => true),
});

test.each([
  ['info', 'info', 'out'],
  ['success', ' ok ', 'out'],
  ['warning', 'warn', 'err'],
  ['error', 'fail', 'err'],
] as const)('%s → [%s] on std%s', (level, badge, stream) => {
  const streams = spyStreams();
  log('hello', level);
  const line = String(streams[stream].mock.calls[0]?.[0]);
  expect(line).toMatch(/\d{2}:\d{2}:\d{2}/);
  expect(line).toContain(`[${badge}]`);
  expect(line).toEndWith(' hello\n');
});

test('defaults to info', () => {
  const { out } = spyStreams();
  log('plain');
  expect(String(out.mock.calls[0]?.[0])).toContain('[info]');
});

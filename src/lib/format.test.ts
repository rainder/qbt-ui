import { describe, it, expect } from 'vitest';
import { formatBytes, formatSpeed, formatEta, formatRatio, formatRelativeTime } from './format';

describe('formatBytes', () => {
  it('formats zero', () => expect(formatBytes(0)).toBe('0 B'));
  it('formats KB', () => expect(formatBytes(1536)).toBe('1.5 KB'));
  it('formats MB', () => expect(formatBytes(5_242_880)).toBe('5.0 MB'));
  it('formats GB', () => expect(formatBytes(5_368_709_120)).toBe('5.0 GB'));
  it('formats TB', () => expect(formatBytes(1_099_511_627_776)).toBe('1.0 TB'));
  it('handles negative as 0', () => expect(formatBytes(-1)).toBe('0 B'));
});

describe('formatSpeed', () => {
  it('appends /s', () => expect(formatSpeed(1024)).toBe('1.0 KB/s'));
  it('shows dash when zero', () => expect(formatSpeed(0)).toBe('—'));
});

describe('formatEta', () => {
  it('shows ∞ for sentinel', () => expect(formatEta(8_640_000)).toBe('∞'));
  it('shows seconds', () => expect(formatEta(45)).toBe('45s'));
  it('shows minutes', () => expect(formatEta(125)).toBe('2m 5s'));
  it('shows hours', () => expect(formatEta(3725)).toBe('1h 2m'));
  it('shows days', () => expect(formatEta(90061)).toBe('1d 1h'));
});

describe('formatRatio', () => {
  it('two decimals', () => expect(formatRatio(1.234567)).toBe('1.23'));
  it('shows ∞ for -1 sentinel', () => expect(formatRatio(-1)).toBe('∞'));
});

describe('formatRelativeTime', () => {
  const NOW = 1_700_000_000; // unix seconds
  it('dash for zero/missing', () => expect(formatRelativeTime(0, NOW)).toBe('—'));
  it('"just now" under 1 minute', () => expect(formatRelativeTime(NOW - 30, NOW)).toBe('just now'));
  it('minutes', () => expect(formatRelativeTime(NOW - 600, NOW)).toBe('10m ago'));
  it('hours', () => expect(formatRelativeTime(NOW - 7200, NOW)).toBe('2h ago'));
  it('days', () => expect(formatRelativeTime(NOW - 3 * 86_400, NOW)).toBe('3d ago'));
  it('weeks', () => expect(formatRelativeTime(NOW - 14 * 86_400, NOW)).toBe('2w ago'));
  it('months', () => expect(formatRelativeTime(NOW - 90 * 86_400, NOW)).toBe('3mo ago'));
  it('years', () => expect(formatRelativeTime(NOW - 730 * 86_400, NOW)).toBe('2y ago'));
});

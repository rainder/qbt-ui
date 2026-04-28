import { describe, it, expect } from 'vitest';
import { detectCompletions } from './useCompletionNotifications';

describe('detectCompletions', () => {
  it('returns empty when no torrents are complete', () => {
    const prev = new Map([['abc', 0.5]]);
    const current = { abc: { name: 'Torrent A', progress: 0.7 } };
    expect(detectCompletions(prev, current)).toEqual([]);
  });

  it('detects a transition from < 1 to >= 1', () => {
    const prev = new Map([['abc', 0.5]]);
    const current = { abc: { name: 'Torrent A', progress: 1.0 } };
    const result = detectCompletions(prev, current);
    expect(result).toEqual([{ hash: 'abc', name: 'Torrent A' }]);
  });

  it('does not fire for newly-added torrents (hash not in prev)', () => {
    const prev = new Map<string, number>();
    const current = { abc: { name: 'New Torrent', progress: 1.0 } };
    expect(detectCompletions(prev, current)).toEqual([]);
    // But the new torrent should be added to prev
    expect(prev.get('abc')).toBe(1.0);
  });

  it('does not fire again for already-completed torrents (prev >= 1)', () => {
    const prev = new Map([['abc', 1.0]]);
    const current = { abc: { name: 'Torrent A', progress: 1.0 } };
    expect(detectCompletions(prev, current)).toEqual([]);
  });

  it('removes stale hashes from prev map', () => {
    const prev = new Map([['abc', 0.5], ['xyz', 0.3]]);
    const current = { abc: { name: 'Torrent A', progress: 0.6 } };
    detectCompletions(prev, current);
    expect(prev.has('xyz')).toBe(false);
    expect(prev.has('abc')).toBe(true);
  });

  it('updates prev with new progress values', () => {
    const prev = new Map([['abc', 0.3]]);
    const current = { abc: { name: 'Torrent A', progress: 0.8 } };
    detectCompletions(prev, current);
    expect(prev.get('abc')).toBe(0.8);
  });

  it('handles missing progress field (treated as 0)', () => {
    const prev = new Map([['abc', 0.5]]);
    // progress missing — treated as 0, should not complete
    const current = { abc: { name: 'Torrent A' } };
    expect(detectCompletions(prev, current)).toEqual([]);
  });

  it('handles multiple completions in one pass', () => {
    const prev = new Map([['a', 0.5], ['b', 0.9], ['c', 0.2]]);
    const current = {
      a: { name: 'A', progress: 1.0 },
      b: { name: 'B', progress: 1.0 },
      c: { name: 'C', progress: 0.4 },
    };
    const result = detectCompletions(prev, current);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.hash).sort()).toEqual(['a', 'b']);
  });
});

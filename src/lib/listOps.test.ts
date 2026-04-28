import { describe, it, expect } from 'vitest';
import type { Torrent } from '@/api/types';
import { filterTorrents, sortTorrents } from './listOps';

const T = (over: Partial<Torrent>): Partial<Torrent> => ({
  hash: 'h', name: 'x', size: 100, progress: 0.5, dlspeed: 0, upspeed: 0,
  state: 'pausedDL', category: '', tags: '', added_on: 0, ratio: 0, eta: 0, ...over,
});

describe('filterTorrents', () => {
  const data: Record<string, Partial<Torrent>> = {
    a: T({ hash: 'a', name: 'ubuntu', state: 'downloading', category: 'iso', tags: 'linux' }),
    b: T({ hash: 'b', name: 'arch',   state: 'pausedDL',    category: 'iso', tags: 'linux' }),
    c: T({ hash: 'c', name: 'movie',  state: 'uploading',   category: 'films', tags: '' }),
  };

  it('all returns everything', () => {
    expect(filterTorrents(data, { status: 'all', category: null, tag: null, text: '' })).toHaveLength(3);
  });
  it('downloading status', () => {
    expect(filterTorrents(data, { status: 'downloading', category: null, tag: null, text: '' })
      .map((t) => t.hash)).toEqual(['a']);
  });
  it('paused status includes pausedDL and pausedUP', () => {
    expect(filterTorrents(data, { status: 'paused', category: null, tag: null, text: '' })
      .map((t) => t.hash)).toEqual(['b']);
  });
  it('text filter is case-insensitive substring', () => {
    expect(filterTorrents(data, { status: 'all', category: null, tag: null, text: 'BUN' })
      .map((t) => t.hash)).toEqual(['a']);
  });
  it('category filter', () => {
    expect(filterTorrents(data, { status: 'all', category: 'films', tag: null, text: '' })
      .map((t) => t.hash)).toEqual(['c']);
  });
  it('tag filter (substring on comma-separated)', () => {
    expect(filterTorrents(data, { status: 'all', category: null, tag: 'linux', text: '' })
      .map((t) => t.hash).sort()).toEqual(['a', 'b']);
  });
});

describe('sortTorrents', () => {
  const data = [T({ hash: 'a', name: 'b' }), T({ hash: 'b', name: 'a' }), T({ hash: 'c', name: 'c' })];
  it('asc by name', () => {
    expect(sortTorrents(data, 'name', 'asc').map((t) => t.hash)).toEqual(['b', 'a', 'c']);
  });
  it('desc by name', () => {
    expect(sortTorrents(data, 'name', 'desc').map((t) => t.hash)).toEqual(['c', 'a', 'b']);
  });
});

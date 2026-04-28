import { describe, it, expect } from 'vitest';
import type { Torrent } from './types';
import { applyDiff, emptyState, type SyncState } from './sync';

const baseTorrent = (over: Partial<Torrent>): Partial<Torrent> => ({
  name: 'x', size: 100, progress: 0, dlspeed: 0, upspeed: 0, state: 'pausedDL', ...over,
});

describe('applyDiff', () => {
  it('initializes from full snapshot', () => {
    const next = applyDiff(emptyState(), {
      rid: 1,
      full_update: true,
      torrents: { abc: baseTorrent({ name: 'a' }) },
      categories: { movies: { name: 'movies', savePath: '/m' } },
      tags: ['linux'],
      server_state: { dl_info_speed: 100, up_info_speed: 50, free_space_on_disk: 1024,
        dl_info_data: 0, up_info_data: 0, global_ratio: '0', alltime_dl: 0, alltime_ul: 0,
        use_alt_speed_limits: false, connection_status: 'connected' },
    });
    expect(next.rid).toBe(1);
    expect(next.torrents.abc?.name).toBe('a');
    expect(next.torrents.abc?.hash).toBe('abc');
    expect(next.categories.movies?.savePath).toBe('/m');
    expect(next.tags).toEqual(['linux']);
    expect(next.serverState?.dl_info_speed).toBe(100);
  });

  it('merges incremental torrent updates', () => {
    let s: SyncState = applyDiff(emptyState(), {
      rid: 1, full_update: true,
      torrents: { abc: baseTorrent({ name: 'a', dlspeed: 0 }) },
    });
    s = applyDiff(s, { rid: 2, torrents: { abc: { dlspeed: 1024 } } });
    expect(s.torrents.abc?.name).toBe('a');
    expect(s.torrents.abc?.dlspeed).toBe(1024);
    expect(s.rid).toBe(2);
  });

  it('removes torrents listed in torrents_removed', () => {
    let s = applyDiff(emptyState(), {
      rid: 1, full_update: true, torrents: { abc: baseTorrent({}), def: baseTorrent({}) },
    });
    s = applyDiff(s, { rid: 2, torrents_removed: ['abc'] });
    expect(s.torrents.abc).toBeUndefined();
    expect(s.torrents.def).toBeDefined();
  });

  it('full_update wipes prior state', () => {
    let s = applyDiff(emptyState(), {
      rid: 1, full_update: true, torrents: { old: baseTorrent({}) },
    });
    s = applyDiff(s, { rid: 5, full_update: true, torrents: { fresh: baseTorrent({}) } });
    expect(s.torrents.old).toBeUndefined();
    expect(s.torrents.fresh).toBeDefined();
    expect(s.rid).toBe(5);
  });

  it('removes categories and tags', () => {
    let s = applyDiff(emptyState(), {
      rid: 1, full_update: true,
      categories: { a: { name: 'a', savePath: '' }, b: { name: 'b', savePath: '' } },
      tags: ['x', 'y', 'z'],
    });
    s = applyDiff(s, { rid: 2, categories_removed: ['a'], tags_removed: ['y'] });
    expect(Object.keys(s.categories)).toEqual(['b']);
    expect(s.tags).toEqual(['x', 'z']);
  });

  it('shallow-merges server_state', () => {
    let s = applyDiff(emptyState(), {
      rid: 1, full_update: true,
      server_state: { dl_info_speed: 100, up_info_speed: 50, free_space_on_disk: 0,
        dl_info_data: 0, up_info_data: 0, global_ratio: '0', alltime_dl: 0, alltime_ul: 0,
        use_alt_speed_limits: false, connection_status: 'connected' },
    });
    s = applyDiff(s, { rid: 2, server_state: { dl_info_speed: 999 } });
    expect(s.serverState?.dl_info_speed).toBe(999);
    expect(s.serverState?.up_info_speed).toBe(50);
  });
});

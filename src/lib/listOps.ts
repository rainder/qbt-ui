import type { Torrent } from '@/api/types';
import type { SortKey, SortDir, StatusFilter } from '@/stores/ui';

export interface FilterArgs {
  status: StatusFilter;
  category: string | null;
  tag: string | null;
  text: string;
}

const STATUS_GROUPS: Record<Exclude<StatusFilter, 'all'>, Torrent['state'][]> = {
  downloading: ['downloading', 'forcedDL', 'metaDL', 'stalledDL', 'queuedDL', 'checkingDL', 'allocating'],
  seeding:     ['uploading', 'forcedUP', 'stalledUP', 'queuedUP', 'checkingUP'],
  paused:      ['pausedDL', 'pausedUP'],
  completed:   ['uploading', 'forcedUP', 'stalledUP', 'pausedUP', 'queuedUP'],
  active:      ['downloading', 'forcedDL', 'uploading', 'forcedUP', 'metaDL'],
  inactive:    ['pausedDL', 'pausedUP', 'stalledDL', 'stalledUP', 'queuedDL', 'queuedUP'],
  errored:     ['error', 'missingFiles'],
};

export function filterTorrents(
  torrents: Record<string, Partial<Torrent>>,
  f: FilterArgs,
): Partial<Torrent>[] {
  const text = f.text.trim().toLowerCase();
  return Object.values(torrents).filter((t) => {
    if (f.status !== 'all') {
      const states = STATUS_GROUPS[f.status];
      if (!t.state || !states.includes(t.state)) return false;
    }
    if (f.category && t.category !== f.category) return false;
    if (f.tag) {
      const tags = (t.tags ?? '').split(',').map((s) => s.trim());
      if (!tags.includes(f.tag)) return false;
    }
    if (text && !(t.name ?? '').toLowerCase().includes(text)) return false;
    return true;
  });
}

export function sortTorrents(rows: Partial<Torrent>[], key: SortKey, dir: SortDir): Partial<Torrent>[] {
  const factor = dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a[key]; const bv = b[key];
    if (av === undefined && bv === undefined) return 0;
    if (av === undefined) return 1;
    if (bv === undefined) return -1;
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
    return String(av).localeCompare(String(bv)) * factor;
  });
}

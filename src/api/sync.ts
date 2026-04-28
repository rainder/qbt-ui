import type { SyncMainData, Torrent, ServerState } from './types';

export interface SyncState {
  rid: number;
  torrents: Record<string, Partial<Torrent>>;
  categories: Record<string, { name: string; savePath: string }>;
  tags: string[];
  serverState?: ServerState;
}

export function emptyState(): SyncState {
  return { rid: 0, torrents: {}, categories: {}, tags: [] };
}

export function applyDiff(prev: SyncState, diff: SyncMainData): SyncState {
  const start: SyncState = diff.full_update ? emptyState() : prev;

  const torrents = { ...start.torrents };
  if (diff.torrents) {
    for (const [hash, patch] of Object.entries(diff.torrents)) {
      torrents[hash] = { ...torrents[hash], ...patch, hash };
    }
  }
  if (diff.torrents_removed) {
    for (const hash of diff.torrents_removed) delete torrents[hash];
  }

  const categories = { ...start.categories, ...(diff.categories ?? {}) };
  if (diff.categories_removed) {
    for (const c of diff.categories_removed) delete categories[c];
  }

  let tags = start.tags;
  if (diff.tags) tags = Array.from(new Set([...tags, ...diff.tags]));
  if (diff.tags_removed) tags = tags.filter((t) => !diff.tags_removed!.includes(t));

  const serverState = diff.server_state
    ? ({ ...start.serverState, ...diff.server_state } as ServerState)
    : start.serverState;

  return { rid: diff.rid, torrents, categories, tags, serverState };
}

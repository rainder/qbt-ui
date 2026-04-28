import { apiGet, apiPost, ApiError } from './client';
import type { SyncMainData, TorrentFile, TorrentPeer, TorrentTracker } from './types';

export const fetchSync = (rid: number) => apiGet<SyncMainData>('/sync/maindata', { rid });

async function pauseOrStop(hashes: string[]) {
  try {
    await apiPost('/torrents/stop', { hashes: hashes.join('|') });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      await apiPost('/torrents/pause', { hashes: hashes.join('|') });
    } else {
      throw e;
    }
  }
}

async function resumeOrStart(hashes: string[]) {
  try {
    await apiPost('/torrents/start', { hashes: hashes.join('|') });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      await apiPost('/torrents/resume', { hashes: hashes.join('|') });
    } else {
      throw e;
    }
  }
}

export const pause = pauseOrStop;
export const resume = resumeOrStart;
export const recheck = (hashes: string[]) => apiPost('/torrents/recheck', { hashes: hashes.join('|') });
export const reannounce = (hashes: string[]) => apiPost('/torrents/reannounce', { hashes: hashes.join('|') });

export const remove = (hashes: string[], deleteFiles: boolean) =>
  apiPost('/torrents/delete', { hashes: hashes.join('|'), deleteFiles });

export const setCategory = (hashes: string[], category: string) =>
  apiPost('/torrents/setCategory', { hashes: hashes.join('|'), category });

export const addTags = (hashes: string[], tags: string[]) =>
  apiPost('/torrents/addTags', { hashes: hashes.join('|'), tags: tags.join(',') });

export const removeTags = (hashes: string[], tags: string[]) =>
  apiPost('/torrents/removeTags', { hashes: hashes.join('|'), tags: tags.join(',') });

export const createCategory = (name: string, savePath = '') =>
  apiPost('/torrents/createCategory', { category: name, savePath });

export const fetchFiles = (hash: string) => apiGet<TorrentFile[]>('/torrents/files', { hash });
export const fetchPeers = (hash: string) =>
  apiGet<{ peers: Record<string, TorrentPeer> }>('/sync/torrentPeers', { hash, rid: 0 });
export const fetchTrackers = (hash: string) => apiGet<TorrentTracker[]>('/torrents/trackers', { hash });

export interface AddTorrentInput {
  files?: File[];
  urls?: string;          // newline-separated magnet/HTTP URLs
  category?: string;
  tags?: string;
  savepath?: string;
  paused?: boolean;
}

export async function addTorrent(input: AddTorrentInput): Promise<void> {
  const fd = new FormData();
  if (input.files) for (const f of input.files) fd.append('torrents', f, f.name);
  if (input.urls) fd.append('urls', input.urls);
  if (input.category) fd.append('category', input.category);
  if (input.tags) fd.append('tags', input.tags);
  if (input.savepath) fd.append('savepath', input.savepath);
  if (input.paused !== undefined) fd.append('paused', String(input.paused));
  await apiPost('/torrents/add', fd);
}

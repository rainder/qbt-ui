export type TorrentState =
  | 'error' | 'missingFiles' | 'uploading' | 'pausedUP' | 'queuedUP'
  | 'stalledUP' | 'checkingUP' | 'forcedUP' | 'allocating' | 'downloading'
  | 'metaDL' | 'pausedDL' | 'queuedDL' | 'stalledDL' | 'checkingDL'
  | 'forcedDL' | 'checkingResumeData' | 'moving' | 'unknown';

export interface Torrent {
  hash: string;
  name: string;
  size: number;
  progress: number;          // 0..1
  dlspeed: number;           // bytes/s
  upspeed: number;           // bytes/s
  priority: number;
  num_seeds: number;
  num_complete: number;
  num_leechs: number;
  num_incomplete: number;
  ratio: number;
  eta: number;               // seconds (8_640_000 == infinity)
  state: TorrentState;
  category: string;
  tags: string;              // comma-separated
  added_on: number;          // unix s
  completion_on: number;
  save_path: string;
  total_size: number;
  amount_left: number;
  uploaded: number;
  downloaded: number;
}

export interface SyncMainData {
  rid: number;
  full_update?: boolean;
  torrents?: Record<string, Partial<Torrent>>;
  torrents_removed?: string[];
  categories?: Record<string, { name: string; savePath: string }>;
  categories_removed?: string[];
  tags?: string[];
  tags_removed?: string[];
  server_state?: Partial<ServerState>;
}

export interface ServerState {
  dl_info_speed: number;
  up_info_speed: number;
  dl_info_data: number;
  up_info_data: number;
  free_space_on_disk: number;
  global_ratio: string;
  alltime_dl: number;
  alltime_ul: number;
  use_alt_speed_limits: boolean;
  connection_status: 'connected' | 'firewalled' | 'disconnected';
}

export interface TorrentFile {
  index: number;
  name: string;
  size: number;
  progress: number;
  priority: number;
  is_seed?: boolean;
}

export interface TorrentPeer {
  ip: string;
  port: number;
  client: string;
  progress: number;
  dl_speed: number;
  up_speed: number;
  flags: string;
  country?: string;
  connection: string;
}

export interface TorrentTracker {
  url: string;
  status: number;
  num_peers: number;
  num_seeds: number;
  num_leeches: number;
  msg: string;
  tier: number;
}

export interface SearchPlugin {
  name: string;
  fullName: string;
  version: string;
  url: string;
  enabled: boolean;
  supportedCategories: { id: string; name: string }[];
}

export interface SearchResult {
  fileName: string;
  fileSize: number;       // -1 if unknown
  fileUrl: string;
  nbLeechers: number;
  nbSeeders: number;
  siteUrl: string;
  descrLink: string;
  pubDate?: number;
}

export interface SearchStatus {
  id: number;
  status: 'Running' | 'Stopped';
  total: number;
}

export type Preferences = Record<string, unknown>;

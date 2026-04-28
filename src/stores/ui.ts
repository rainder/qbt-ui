import { create } from 'zustand';

export type SortKey = 'name' | 'size' | 'state' | 'progress' | 'dlspeed' | 'upspeed' | 'eta' | 'added_on' | 'ratio' | 'category';
export type SortDir = 'asc' | 'desc';
export type StatusFilter = 'all' | 'downloading' | 'seeding' | 'paused' | 'completed' | 'active' | 'inactive' | 'errored';

interface UiState {
  filterStatus: StatusFilter;
  filterCategory: string | null;
  filterTag: string | null;
  filterText: string;
  sortKey: SortKey;
  sortDir: SortDir;
  detailsOpen: boolean;
  activeHash: string | null;
  activeModal: 'add' | 'delete' | 'category' | 'tags' | 'help' | null;

  setStatus(s: StatusFilter): void;
  setCategory(c: string | null): void;
  setTag(t: string | null): void;
  setFilterText(s: string): void;
  setSort(key: SortKey): void;
  openDetails(hash: string): void;
  closeDetails(): void;
  openModal(m: UiState['activeModal']): void;
}

export const useUi = create<UiState>((set, get) => ({
  filterStatus: 'all',
  filterCategory: null,
  filterTag: null,
  filterText: '',
  sortKey: 'added_on',
  sortDir: 'desc',
  detailsOpen: false,
  activeHash: null,
  activeModal: null,

  setStatus(s) { set({ filterStatus: s }); },
  setCategory(c) { set({ filterCategory: c }); },
  setTag(t) { set({ filterTag: t }); },
  setFilterText(s) { set({ filterText: s }); },
  setSort(key) {
    const { sortKey, sortDir } = get();
    set(sortKey === key
      ? { sortDir: sortDir === 'asc' ? 'desc' : 'asc' }
      : { sortKey: key, sortDir: 'desc' });
  },
  openDetails(hash) { set({ detailsOpen: true, activeHash: hash }); },
  closeDetails() { set({ detailsOpen: false }); },
  openModal(m) { set({ activeModal: m }); },
}));

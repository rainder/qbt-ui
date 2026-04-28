import { create } from 'zustand';

interface SelectionState {
  selected: Set<string>;
  toggle(hash: string): void;
  selectOnly(hash: string): void;
  selectRange(ordered: string[], from: string, to: string): void;
  has(hash: string): boolean;
  hashes(): string[];
  clear(): void;
}

export const useSelection = create<SelectionState>((set, get) => ({
  selected: new Set(),
  toggle(hash) {
    const next = new Set(get().selected);
    if (next.has(hash)) next.delete(hash); else next.add(hash);
    set({ selected: next });
  },
  selectOnly(hash) { set({ selected: new Set([hash]) }); },
  selectRange(ordered, from, to) {
    const i = ordered.indexOf(from);
    const j = ordered.indexOf(to);
    if (i < 0 || j < 0) return;
    const [lo, hi] = i < j ? [i, j] : [j, i];
    set({ selected: new Set(ordered.slice(lo, hi + 1)) });
  },
  has(hash) { return get().selected.has(hash); },
  hashes() { return Array.from(get().selected); },
  clear() { set({ selected: new Set() }); },
}));

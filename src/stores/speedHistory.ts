import { create } from 'zustand';

const MAX_SAMPLES = 60;
const MIN_INTERVAL_MS = 1000;

interface SpeedHistoryState {
  dl: number[];
  up: number[];
  lastPushAt: number;
  push: (dl: number, up: number) => void;
}

export const useSpeedHistoryStore = create<SpeedHistoryState>((set, get) => ({
  dl: [],
  up: [],
  lastPushAt: 0,
  push: (dl, up) => {
    const now = Date.now();
    if (now - get().lastPushAt < MIN_INTERVAL_MS) return;
    set((s) => ({
      dl: [...s.dl.slice(-(MAX_SAMPLES - 1)), dl],
      up: [...s.up.slice(-(MAX_SAMPLES - 1)), up],
      lastPushAt: now,
    }));
  },
}));

import { useSpeedHistoryStore } from '@/stores/speedHistory';

interface SpeedHistory {
  dl: number[];
  up: number[];
}

/** Read the global speed history accumulated by the recorder.
 *  Recording is centralized in MobileBottomBar (always mounted under AuthGate)
 *  so the buffer persists across page navigations. */
export function useSpeedHistory(): SpeedHistory {
  const dl = useSpeedHistoryStore((s) => s.dl);
  const up = useSpeedHistoryStore((s) => s.up);
  return { dl, up };
}

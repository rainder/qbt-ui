import { useEffect, useRef, useState } from 'react';
import { fetchSync } from '@/api/torrents';
import { applyDiff, emptyState, type SyncState } from '@/api/sync';
import { ApiError } from '@/api/client';

const POLL_INTERVAL_MS = 1500;
const BACKOFF_MAX_MS = 10_000;

export function useSync() {
  const [state, setState] = useState<SyncState>(emptyState());
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let cancelled = false;
    let backoff = POLL_INTERVAL_MS;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      if (document.hidden) {
        timer = setTimeout(tick, POLL_INTERVAL_MS);
        return;
      }
      try {
        const diff = await fetchSync(stateRef.current.rid);
        if (cancelled) return;
        setState((prev) => applyDiff(prev, diff));
        setError(null);
        backoff = POLL_INTERVAL_MS;
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          setAuthError(true);
          return;
        }
        setError(err instanceof Error ? err.message : String(err));
        backoff = Math.min(backoff * 2, BACKOFF_MAX_MS);
      }
      timer = setTimeout(tick, backoff);
    };

    void tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return { state, error, authError };
}

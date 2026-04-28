import { useEffect, useRef } from 'react';
import { useSync } from './useSync';

/**
 * Pure helper: given the previous progress map and the current torrent snapshot,
 * return all torrents that transitioned from progress < 1 to progress >= 1.
 * Newly-added torrents (hash not in prev) are skipped.
 * Also mutates `prev` in place to reflect the new state and removes stale hashes.
 */
export function detectCompletions(
  prev: Map<string, number>,
  current: Record<string, { hash?: string; name?: string; progress?: number }>,
): Array<{ hash: string; name: string }> {
  const completed: Array<{ hash: string; name: string }> = [];

  for (const [hash, t] of Object.entries(current)) {
    const newProgress = t.progress ?? 0;
    const prevProgress = prev.get(hash);

    if (prevProgress !== undefined && prevProgress < 1 && newProgress >= 1) {
      completed.push({ hash, name: t.name ?? '' });
    }

    prev.set(hash, newProgress);
  }

  // Remove hashes no longer present
  for (const hash of prev.keys()) {
    if (!(hash in current)) {
      prev.delete(hash);
    }
  }

  return completed;
}

export function useCompletionNotifications(): void {
  const { state } = useSync();
  const prevHashesRef = useRef<Map<string, number>>(new Map());
  const firstSyncRef = useRef(true);

  // Permission flow: on mount, if permission is 'default', attach a one-time
  // click listener (capture phase) that requests permission and removes itself.
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'default') return;

    const handler = () => {
      void Notification.requestPermission();
    };

    document.addEventListener('click', handler, { capture: true, once: true });
    return () => {
      document.removeEventListener('click', handler, { capture: true });
    };
  }, []);

  // Transition detection
  useEffect(() => {
    const torrents = state.torrents;

    // Wait until we have at least some data
    if (Object.keys(torrents).length === 0 && firstSyncRef.current) {
      return;
    }

    if (firstSyncRef.current) {
      // Seed the prev map so already-finished torrents don't fire on load
      for (const [hash, t] of Object.entries(torrents)) {
        prevHashesRef.current.set(hash, t.progress ?? 0);
      }
      firstSyncRef.current = false;
      return;
    }

    const completed = detectCompletions(prevHashesRef.current, torrents);

    for (const { name } of completed) {
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('Torrent complete', { body: name, icon: '/favicon.svg' });
        } catch {
          // Some browsers throw if not user-activated; ignore silently.
        }
      }
    }
  });
}

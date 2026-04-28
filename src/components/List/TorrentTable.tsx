import { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Torrent } from '@/api/types';
import { TorrentRow } from './TorrentRow';
import { ColumnHeader } from './ColumnHeader';
import { useSelection } from '@/stores/selection';
import { useUi } from '@/stores/ui';
import { filterTorrents, sortTorrents } from '@/lib/listOps';

export function TorrentTable({ torrents }: { torrents: Record<string, Partial<Torrent>> }) {
  const { filterStatus, filterCategory, filterTag, filterText, sortKey, sortDir, openDetails, activeHash } = useUi();
  const { has, selectOnly, toggle } = useSelection();

  const rows = useMemo(() => {
    const filtered = filterTorrents(torrents, {
      status: filterStatus, category: filterCategory, tag: filterTag, text: filterText,
    });
    return sortTorrents(filtered, sortKey, sortDir);
  }, [torrents, filterStatus, filterCategory, filterTag, filterText, sortKey, sortDir]);

  const parentRef = useRef<HTMLDivElement>(null);
  const v = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28,
    overscan: 16,
  });

  return (
    <div className="flex flex-col h-full">
      <ColumnHeader />
      <div ref={parentRef} className="flex-1 overflow-auto" data-testid="torrent-list">
        <div style={{ height: v.getTotalSize(), position: 'relative' }}>
          {v.getVirtualItems().map((vi) => {
            const t = rows[vi.index];
            const hash = t.hash!;
            return (
              <div key={hash} style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                transform: `translateY(${vi.start}px)`,
              }}>
                <TorrentRow
                  t={t}
                  selected={has(hash)}
                  active={activeHash === hash}
                  onClick={(e) => (e.metaKey || e.ctrlKey ? toggle(hash) : selectOnly(hash))}
                  onDouble={() => openDetails(hash)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

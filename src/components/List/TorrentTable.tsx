import { useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Torrent } from '@/api/types';
import { TorrentRow } from './TorrentRow';
import { ColumnHeader } from './ColumnHeader';
import { ContextMenu, type ContextMenuItem } from './ContextMenu';
import { useSelection } from '@/stores/selection';
import { useUi } from '@/stores/ui';
import {
  pause, resume, recheck, reannounce,
  toggleSequentialDownload, toggleFirstLastPiecePrio,
} from '@/api/torrents';

export function TorrentTable({ rows }: { rows: Partial<Torrent>[] }) {
  const { openDetails, activeHash, openModal } = useUi();
  const { has, selectOnly, toggle, hashes } = useSelection();

  const parentRef = useRef<HTMLDivElement>(null);
  const v = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 16,
  });

  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  function onContextMenu(e: React.MouseEvent, hash: string) {
    e.preventDefault();
    if (!has(hash)) selectOnly(hash);
    setMenu({ x: e.clientX, y: e.clientY });
  }

  const items: ContextMenuItem[] = (() => {
    const sel = hashes();
    const count = sel.length || 1; // at least the right-clicked row is selected
    const single = count === 1;

    // Look up state across selected torrents.
    const torrentsByHash = new Map(rows.map((r) => [r.hash, r]));
    const allSeq = sel.length > 0 && sel.every((h) => torrentsByHash.get(h)?.seq_dl);
    const allFL = sel.length > 0 && sel.every((h) => torrentsByHash.get(h)?.f_l_piece_prio);

    return [
      {
        label: single ? 'Open details' : `Open first of ${count}`,
        shortcut: '↵',
        onClick: () => { const h = sel[0]; if (h) openDetails(h); },
        disabled: sel.length === 0,
      },
      {
        label: 'Resume',
        shortcut: 'r',
        onClick: () => { void resume(sel); },
        separatorBefore: true,
      },
      {
        label: 'Pause',
        shortcut: 'p',
        onClick: () => { void pause(sel); },
      },
      {
        label: 'Force recheck',
        shortcut: '⇧R',
        onClick: () => { void recheck(sel); },
      },
      {
        label: 'Reannounce',
        onClick: () => { void reannounce(sel); },
      },
      {
        label: allSeq ? '✓ Sequential download' : 'Sequential download',
        onClick: () => { void toggleSequentialDownload(sel); },
        separatorBefore: true,
      },
      {
        label: allFL ? '✓ First && last piece priority' : 'First && last piece priority',
        onClick: () => { void toggleFirstLastPiecePrio(sel); },
      },
      {
        label: 'Set category…',
        shortcut: 'c',
        onClick: () => openModal('category'),
        separatorBefore: true,
      },
      {
        label: 'Edit tags…',
        shortcut: 't',
        onClick: () => openModal('tags'),
      },
      {
        label: 'Delete…',
        shortcut: 'd',
        onClick: () => openModal('delete'),
        danger: true,
        separatorBefore: true,
      },
    ];
  })();

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
                  onContextMenu={(e) => onContextMenu(e, hash)}
                />
              </div>
            );
          })}
        </div>
      </div>
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          items={items}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
}

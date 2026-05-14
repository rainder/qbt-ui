import { useLayoutEffect, useRef, useState } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';
import type { Torrent } from '@/api/types';
import { TorrentRow } from './TorrentRow';
import { TorrentCard } from './TorrentCard';
import { ColumnHeader } from './ColumnHeader';
import { MobileSortBar } from './MobileSortBar';
import { ContextMenu, type ContextMenuItem } from './ContextMenu';
import { useSelection } from '@/stores/selection';
import { useUi } from '@/stores/ui';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  pause, resume, recheck, reannounce,
  toggleSequentialDownload, toggleFirstLastPiecePrio,
  setForceStart, topPrio, bottomPrio, increasePrio, decreasePrio,
} from '@/api/torrents';

export function TorrentTable({ rows }: { rows: Partial<Torrent>[] }) {
  const { openDetails, closeDetails, activeHash, openModal } = useUi();
  const { has, selectOnly, toggle, selectRange, hashes, clear } = useSelection();
  const isMobile = useIsMobile();

  const lastClickedRef = useRef<string | null>(null);

  // The virtualized list is offset from the document top by everything
  // rendered above it (TopBar on desktop, page header/safe-area on mobile).
  // useWindowVirtualizer needs this `scrollMargin` so it knows where the
  // first row lives in document-scroll coordinates.
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const recalc = () => {
      setScrollMargin(el.getBoundingClientRect().top + window.scrollY);
    };
    recalc();
    window.addEventListener('resize', recalc);
    // Catch layout shifts when ancestors change size (TopBar mounting on
    // desktop, sidebar opening, sticky header height changing on rotate).
    const ro = new ResizeObserver(recalc);
    if (el.parentElement) ro.observe(el.parentElement);
    return () => {
      window.removeEventListener('resize', recalc);
      ro.disconnect();
    };
  }, []);

  const v = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => (isMobile ? 52 : 44),
    overscan: 16,
    scrollMargin,
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
    const allForceStart = sel.length > 0 && sel.every((h) => torrentsByHash.get(h)?.force_start);

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
        label: allForceStart ? '✓ Force start' : 'Force start',
        onClick: () => { void setForceStart(sel, !allForceStart); },
      },
      {
        label: 'Move to top',
        onClick: () => { void topPrio(sel); },
        separatorBefore: true,
      },
      {
        label: 'Move up',
        onClick: () => { void increasePrio(sel); },
      },
      {
        label: 'Move down',
        onClick: () => { void decreasePrio(sel); },
      },
      {
        label: 'Move to bottom',
        onClick: () => { void bottomPrio(sel); },
      },
      {
        label: 'Rate limits…',
        onClick: () => openModal('limits'),
        separatorBefore: true,
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
        label: 'Move…',
        onClick: () => openModal('location'),
      },
      {
        label: 'Export .torrent',
        disabled: count !== 1,
        onClick: () => {
          const hash = sel[0];
          if (!hash) return;
          const torrent = torrentsByHash.get(hash);
          const name = torrent?.name;
          void (async () => {
            const res = await fetch(`/api/v2/torrents/export?hash=${hash}`, { credentials: 'include' });
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${name || hash}.torrent`;
            a.click();
            URL.revokeObjectURL(url);
          })();
        },
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
    <div className="pb-mobile-nav" data-testid="torrent-list">
      {/* Desktop: min-width forces horizontal scroll for the table columns.
          Mobile: cards flow naturally, no min-width. */}
      <div className={clsx('flex flex-col', isMobile ? '' : 'min-w-[1100px]')}>
        <div className="sticky top-0 md:top-14 z-10 bg-canvas-subtle">
          {isMobile ? <MobileSortBar /> : <ColumnHeader />}
        </div>
        <div ref={listRef} style={{ height: v.getTotalSize(), position: 'relative' }}>
          {v.getVirtualItems().map((vi) => {
            const t = rows[vi.index];
            const hash = t.hash!;
            return (
              <div
                key={hash}
                ref={isMobile ? v.measureElement : undefined}
                data-index={vi.index}
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  transform: `translateY(${vi.start - scrollMargin}px)`,
                }}
              >
                {isMobile ? (
                  <TorrentCard
                    t={t}
                    selected={has(hash)}
                    active={activeHash === hash}
                    onClick={() => {
                      selectOnly(hash);
                      openDetails(hash);
                    }}
                    onContextMenu={(e) => onContextMenu(e, hash)}
                  />
                ) : (
                  <TorrentRow
                    t={t}
                    selected={has(hash)}
                    active={activeHash === hash}
                    onClick={(e) => {
                      if (e.shiftKey && lastClickedRef.current) {
                        const orderedHashes = rows.map((r) => r.hash!).filter(Boolean);
                        selectRange(orderedHashes, lastClickedRef.current, hash);
                      } else if (e.metaKey || e.ctrlKey) {
                        toggle(hash);
                        lastClickedRef.current = hash;
                      } else if (has(hash) && hashes().length === 1) {
                        // Toggle off: clicking the only selected row deselects + closes details.
                        clear();
                        closeDetails();
                        lastClickedRef.current = null;
                      } else {
                        selectOnly(hash);
                        lastClickedRef.current = hash;
                        openDetails(hash);
                      }
                    }}
                    onDouble={() => openDetails(hash)}
                    onContextMenu={(e) => onContextMenu(e, hash)}
                  />
                )}
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

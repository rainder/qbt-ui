import { useRef, useState } from 'react';
import type { Torrent } from '@/api/types';
import { GeneralTab } from '@/components/Details/GeneralTab';
import { FilesTab } from '@/components/Details/FilesTab';
import { PeersTab } from '@/components/Details/PeersTab';
import { TrackersTab } from '@/components/Details/TrackersTab';
import { ContextMenu, type ContextMenuItem } from '@/components/List/ContextMenu';
import { useUi } from '@/stores/ui';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  pause, resume, recheck, reannounce,
  toggleSequentialDownload, toggleFirstLastPiecePrio, setForceStart,
  topPrio, bottomPrio, increasePrio, decreasePrio,
} from '@/api/torrents';
import clsx from 'clsx';
import { Kbd } from '@/components/ui/Kbd';

type Tab = 'general' | 'files' | 'peers' | 'trackers';
const TABS: Tab[] = ['general', 'files', 'peers', 'trackers'];

export function DetailsPanel({ torrent }: { torrent: Partial<Torrent> }) {
  const isMobile = useIsMobile();
  const close = useUi((s) => s.closeDetails);
  const openModal = useUi((s) => s.openModal);
  const sidebarCollapsed = useUi((s) => s.sidebarCollapsed);
  const [tab, setTab] = useState<Tab>('general');

  if (isMobile) {
    return (
      <MobileDetailsView
        torrent={torrent}
        tab={tab}
        setTab={setTab}
        close={close}
        openModal={openModal}
      />
    );
  }

  // Desktop: fixed bottom panel, pinned to viewport bottom so the document
  // can scroll behind it. Slides over to clear the sidebar when expanded.
  return (
    <div
      className={clsx(
        'fixed bottom-0 right-0 z-20 border-t border-border-default bg-canvas-subtle flex flex-col',
        sidebarCollapsed ? 'left-0' : 'left-0 md:left-60',
      )}
      style={{ height: '40vh' }}
    >
      <div className="px-4 h-10 border-b border-border-default flex items-center gap-1 shrink-0">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'px-3 py-1.5 text-sm transition-colors',
              t === tab
                ? 'text-fg-default font-semibold border-b-2 border-accent-fg rounded-none -mb-[2px]'
                : 'text-fg-muted hover:text-fg-default rounded-md',
            )}
          >
            {t}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={close} className="text-fg-muted hover:text-fg-default">
          <Kbd>esc</Kbd>
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <TabBody tab={tab} torrent={torrent} />
      </div>
    </div>
  );
}

function MobileDetailsView({
  torrent, tab, setTab, close, openModal,
}: {
  torrent: Partial<Torrent>;
  tab: Tab;
  setTab: (t: Tab) => void;
  close: () => void;
  openModal: (m: 'add' | 'delete' | 'category' | 'tags' | 'help' | 'location' | 'limits' | 'log') => void;
}) {
  const hash = torrent.hash;
  const sel = hash ? [hash] : [];
  const isPaused = (torrent.state ?? '').startsWith('paused') || (torrent.state ?? '').startsWith('stopped');

  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);

  function openMore() {
    const r = moreBtnRef.current?.getBoundingClientRect();
    if (!r) return;
    setMenuPos({ x: r.right, y: r.bottom + 4 });
  }

  const moreItems: ContextMenuItem[] = [
    { label: 'Force recheck', onClick: () => { void recheck(sel); } },
    { label: 'Reannounce', onClick: () => { void reannounce(sel); } },
    {
      label: torrent.seq_dl ? '✓ Sequential download' : 'Sequential download',
      onClick: () => { void toggleSequentialDownload(sel); },
      separatorBefore: true,
    },
    {
      label: torrent.f_l_piece_prio ? '✓ First && last piece priority' : 'First && last piece priority',
      onClick: () => { void toggleFirstLastPiecePrio(sel); },
    },
    {
      label: torrent.force_start ? '✓ Force start' : 'Force start',
      onClick: () => { void setForceStart(sel, !torrent.force_start); },
    },
    { label: 'Move to top',    onClick: () => { void topPrio(sel); },      separatorBefore: true },
    { label: 'Move up',        onClick: () => { void increasePrio(sel); } },
    { label: 'Move down',      onClick: () => { void decreasePrio(sel); } },
    { label: 'Move to bottom', onClick: () => { void bottomPrio(sel); } },
    { label: 'Rate limits…',   onClick: () => openModal('limits'), separatorBefore: true },
    { label: 'Set category…',  onClick: () => openModal('category'), separatorBefore: true },
    { label: 'Edit tags…',     onClick: () => openModal('tags') },
    { label: 'Move…',          onClick: () => openModal('location') },
    {
      label: 'Export .torrent',
      onClick: () => {
        if (!hash) return;
        void (async () => {
          const res = await fetch(`/api/v2/torrents/export?hash=${hash}`, { credentials: 'include' });
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${torrent.name || hash}.torrent`;
          a.click();
          URL.revokeObjectURL(url);
        })();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-40 bg-canvas flex flex-col pt-safe pb-safe">
      {/* Header */}
      <div className="h-12 shrink-0 border-b border-border-default flex items-center gap-2 px-2">
        <button
          onClick={close}
          aria-label="Back"
          className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-md text-fg-muted hover:text-fg-default hover:bg-canvas-subtle"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 16l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex-1 min-w-0 text-sm font-medium text-fg-default truncate">
          {torrent.name ?? '—'}
        </div>
        <button
          ref={moreBtnRef}
          onClick={openMore}
          aria-label="More actions"
          className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-md text-fg-muted hover:text-fg-default hover:bg-canvas-subtle"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Action bar */}
      <div className="h-12 shrink-0 border-b border-border-default flex items-center gap-1 px-2 overflow-x-auto">
        <ActionBtn
          onClick={() => { isPaused ? void resume(sel) : void pause(sel); }}
          label={isPaused ? 'Resume' : 'Pause'}
        />
        <ActionBtn onClick={() => { void recheck(sel); }} label="Recheck" />
        <div className="flex-1" />
        <ActionBtn onClick={() => openModal('delete')} label="Delete" danger />
      </div>

      {/* Tabs */}
      <div className="h-10 shrink-0 border-b border-border-default flex items-center gap-1 px-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'shrink-0 px-3 py-1.5 text-sm transition-colors',
              t === tab
                ? 'text-fg-default font-semibold border-b-2 border-accent-fg rounded-none -mb-[2px]'
                : 'text-fg-muted hover:text-fg-default rounded-md',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-auto p-4">
        <TabBody tab={tab} torrent={torrent} />
      </div>

      {menuPos && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          items={moreItems}
          onClose={() => setMenuPos(null)}
        />
      )}
    </div>
  );
}

function ActionBtn({
  label, onClick, danger,
}: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'shrink-0 px-3 h-9 rounded-md text-sm font-medium transition-colors border',
        danger
          ? 'text-danger-fg border-border-default hover:bg-danger-subtle'
          : 'text-fg-default border-border-default hover:bg-canvas-subtle',
      )}
    >
      {label}
    </button>
  );
}

function TabBody({ tab, torrent }: { tab: Tab; torrent: Partial<Torrent> }) {
  if (tab === 'general') return <GeneralTab t={torrent} />;
  if (tab === 'files' && torrent.hash) return <FilesTab hash={torrent.hash} seqDl={torrent.seq_dl} />;
  if (tab === 'peers' && torrent.hash) return <PeersTab hash={torrent.hash} />;
  if (tab === 'trackers' && torrent.hash) return <TrackersTab hash={torrent.hash} />;
  return null;
}

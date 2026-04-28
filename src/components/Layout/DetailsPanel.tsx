import { useState } from 'react';
import type { Torrent } from '@/api/types';
import { GeneralTab } from '@/components/Details/GeneralTab';
import { FilesTab } from '@/components/Details/FilesTab';
import { PeersTab } from '@/components/Details/PeersTab';
import { TrackersTab } from '@/components/Details/TrackersTab';
import { useUi } from '@/stores/ui';
import clsx from 'clsx';

type Tab = 'general' | 'files' | 'peers' | 'trackers';
const TABS: Tab[] = ['general', 'files', 'peers', 'trackers'];

export function DetailsPanel({ torrent }: { torrent: Partial<Torrent> }) {
  const close = useUi((s) => s.closeDetails);
  const [tab, setTab] = useState<Tab>('general');
  return (
    <div className="border-t border-border-default bg-canvas-subtle flex flex-col" style={{ height: '40vh' }}>
      {/* Tab strip */}
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
          <kbd className="bg-canvas border border-border-default rounded px-1.5 py-0.5 text-xs font-mono text-fg-muted">
            esc
          </kbd>
        </button>
      </div>
      {/* Body */}
      <div className="flex-1 overflow-auto p-4">
        {tab === 'general' && <GeneralTab t={torrent} />}
        {tab === 'files' && torrent.hash && <FilesTab hash={torrent.hash} />}
        {tab === 'peers' && torrent.hash && <PeersTab hash={torrent.hash} />}
        {tab === 'trackers' && torrent.hash && <TrackersTab hash={torrent.hash} />}
      </div>
    </div>
  );
}

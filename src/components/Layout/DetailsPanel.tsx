import { useState } from 'react';
import type { Torrent } from '@/api/types';
import { GeneralTab } from '@/components/Details/GeneralTab';
import { FilesTab } from '@/components/Details/FilesTab';
import { PeersTab } from '@/components/Details/PeersTab';
import { TrackersTab } from '@/components/Details/TrackersTab';
import { useUi } from '@/stores/ui';

type Tab = 'general' | 'files' | 'peers' | 'trackers';
const TABS: Tab[] = ['general', 'files', 'peers', 'trackers'];

export function DetailsPanel({ torrent }: { torrent: Partial<Torrent> }) {
  const close = useUi((s) => s.closeDetails);
  const [tab, setTab] = useState<Tab>('general');
  return (
    <div className="border-t border-border bg-bg3 flex flex-col" style={{ height: '40vh' }}>
      <div className="px-3 h-10 border-b border-border flex items-center gap-2 text-xs">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={t === tab
              ? 'bg-accent-bg text-accent rounded px-3 py-1'
              : 'text-muted hover:text-fg2 px-3 py-1 rounded'}>
            {t}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={close} className="text-muted hover:text-fg2">
          <kbd className="text-[10px] text-muted bg-bg2 px-1.5 py-0.5 rounded border border-border">esc</kbd>
        </button>
      </div>
      <div className="flex-1 overflow-auto p-3 text-xs">
        {tab === 'general' && <GeneralTab t={torrent} />}
        {tab === 'files' && torrent.hash && <FilesTab hash={torrent.hash} />}
        {tab === 'peers' && torrent.hash && <PeersTab hash={torrent.hash} />}
        {tab === 'trackers' && torrent.hash && <TrackersTab hash={torrent.hash} />}
      </div>
    </div>
  );
}

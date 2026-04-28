import { useState } from 'react';
import type { Torrent } from '@/api/types';
import { GeneralTab } from '@/components/Details/GeneralTab';
import { useUi } from '@/stores/ui';

type Tab = 'general' | 'files' | 'peers' | 'trackers';
const TABS: Tab[] = ['general', 'files', 'peers', 'trackers'];

export function DetailsPanel({ torrent }: { torrent: Partial<Torrent> }) {
  const close = useUi((s) => s.closeDetails);
  const [tab, setTab] = useState<Tab>('general');
  return (
    <div className="border-t border-border bg-bg2 flex flex-col" style={{ height: '40vh' }}>
      <div className="px-3 h-7 border-b border-border flex items-center gap-3 text-xs">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={t === tab ? 'text-fg2 border-b border-accent' : 'text-muted hover:text-fg2'}>
            {t}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={close} className="text-muted hover:text-fg2">[esc]</button>
      </div>
      <div className="flex-1 overflow-auto p-3 text-xs">
        {tab === 'general' && <GeneralTab t={torrent} />}
        {tab === 'files' && <FilesPlaceholder />}
        {tab === 'peers' && <PeersPlaceholder />}
        {tab === 'trackers' && <TrackersPlaceholder />}
      </div>
    </div>
  );
}

function FilesPlaceholder() { return <div className="text-muted">files (next task)</div>; }
function PeersPlaceholder() { return <div className="text-muted">peers (next task)</div>; }
function TrackersPlaceholder() { return <div className="text-muted">trackers (next task)</div>; }

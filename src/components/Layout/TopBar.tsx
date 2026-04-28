import { Link, useLocation } from 'react-router-dom';
import type { ServerState } from '@/api/types';
import { useStats } from '@/hooks/useStats';
import { useUi } from '@/stores/ui';
import { formatBytes, formatSpeed, formatRatio } from '@/lib/format';

export function TopBar({ serverState }: { serverState?: ServerState }) {
  const stats = useStats(serverState);
  const { openModal, setFilterText, filterText } = useUi();
  const loc = useLocation();
  return (
    <div className="h-11 border-b border-border flex items-center gap-4 px-3 text-fg">
      <div className="text-fg2">qbt</div>
      <div className="text-muted">|</div>
      <Stat label="↓" value={formatSpeed(stats.dlSpeed)} />
      <Stat label="↑" value={formatSpeed(stats.upSpeed)} />
      <Stat label="ratio" value={formatRatio(stats.ratio)} />
      <Stat label="free" value={formatBytes(stats.freeSpace)} />
      <div className="flex-1" />
      <input
        value={filterText} onChange={(e) => setFilterText(e.target.value)}
        placeholder="/ filter"
        className="border border-border bg-bg px-2 py-0.5 text-xs w-48"
      />
      <button onClick={() => openModal('add')}
              className="border border-accent text-accent px-2 py-0.5 text-xs">+ add</button>
      <Link to="/search" className={navCls(loc.pathname === '/search')}>search</Link>
      <Link to="/settings" className={navCls(loc.pathname.startsWith('/settings'))}>settings</Link>
      <button onClick={() => openModal('help')} className="text-muted hover:text-fg2 text-xs">?</button>
    </div>
  );
}

function navCls(active: boolean) {
  return `px-2 py-0.5 text-xs ${active ? 'text-fg2 border-b border-accent' : 'text-muted hover:text-fg2'}`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-xs">
      <span className="text-muted">{label}</span>{' '}
      <span className="text-fg2">{value}</span>
    </div>
  );
}

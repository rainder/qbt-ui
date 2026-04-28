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
    <div className="h-12 border-b border-border bg-bg flex items-center gap-4 px-3 text-fg">
      <div className="flex items-center gap-2 text-fg2 font-semibold">
        <span className="w-2 h-2 rounded-full bg-accent"></span>
        qbt
      </div>
      <Stat label="↓" value={formatSpeed(stats.dlSpeed)} />
      <Stat label="↑" value={formatSpeed(stats.upSpeed)} />
      <Stat label="ratio" value={formatRatio(stats.ratio)} />
      <Stat label="free" value={formatBytes(stats.freeSpace)} />
      <div className="flex-1" />
      <input
        value={filterText} onChange={(e) => setFilterText(e.target.value)}
        placeholder="/ filter"
        className="bg-bg3 border border-border2 text-fg rounded px-3 py-1 placeholder:text-muted focus:outline-none focus:border-accent text-xs w-48"
      />
      <button onClick={() => openModal('add')}
              className="bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1 text-xs font-medium rounded">+ add</button>
      <Link to="/search" className={navCls(loc.pathname === '/search')}>search</Link>
      <Link to="/settings" className={navCls(loc.pathname.startsWith('/settings'))}>settings</Link>
      <button onClick={() => openModal('help')} className="text-muted text-xs hover:text-fg2 px-2 py-1">?</button>
    </div>
  );
}

function navCls(active: boolean) {
  return `px-2 py-1 text-xs rounded ${active ? 'bg-accent-bg text-accent' : 'text-muted hover:text-fg2'}`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-[11px]">
      <span className="text-muted">{label}</span>{' '}
      <span className="text-fg2">{value}</span>
    </div>
  );
}

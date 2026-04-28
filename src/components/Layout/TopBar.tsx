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
    <div className="h-14 bg-canvas border-b border-border-muted flex items-center px-4 gap-4 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 font-semibold text-base text-fg-default shrink-0">
        <span className="w-3 h-3 rounded-full bg-accent-fg shrink-0" />
        qbt
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 shrink-0">
        <Stat label="↓" value={formatSpeed(stats.dlSpeed)} />
        <Stat label="↑" value={formatSpeed(stats.upSpeed)} />
        <Stat label="ratio" value={formatRatio(stats.ratio)} />
        <Stat label="free" value={formatBytes(stats.freeSpace)} />
      </div>

      <div className="flex-1" />

      {/* Filter input */}
      <input
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        placeholder="Filter…"
        className="bg-canvas-inset border border-border-default rounded-md px-3 py-1 text-sm w-56 placeholder:text-fg-subtle focus-accent"
      />

      {/* Nav links */}
      <Link to="/search" className={navCls(loc.pathname === '/search')}>
        search
      </Link>
      <Link to="/settings" className={navCls(loc.pathname.startsWith('/settings'))}>
        settings
      </Link>

      {/* Add button */}
      <button
        onClick={() => openModal('add')}
        className="bg-success-emphasis hover:bg-success-emphasis-h text-fg-on-emphasis border border-subtle rounded-md px-3 py-[5px] text-sm font-medium"
      >
        + Add
      </button>

      {/* Help */}
      <button
        onClick={() => openModal('help')}
        className="bg-canvas-subtle border border-border-default rounded px-1.5 py-0.5 text-xs font-mono text-fg-muted hover:text-fg-default"
        title="Keyboard shortcuts (?)"
      >
        ?
      </button>
    </div>
  );
}

function navCls(active: boolean) {
  return [
    'text-sm px-2 py-1 border-b-2 transition-colors',
    active
      ? 'text-fg-default border-accent-fg'
      : 'text-fg-muted border-transparent hover:text-fg-default',
  ].join(' ');
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-xs flex items-center gap-1">
      <span className="text-fg-muted">{label}</span>
      <span className="font-semibold tabular-nums text-fg-default">{value}</span>
    </div>
  );
}

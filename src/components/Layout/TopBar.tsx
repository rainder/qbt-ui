import { Link, useLocation } from 'react-router-dom';
import type { ServerState } from '@/api/types';
import { useStats } from '@/hooks/useStats';
import { useSpeedHistory } from '@/hooks/useSpeedHistory';
import { useUi } from '@/stores/ui';
import { formatBytes, formatSpeed, formatRatio } from '@/lib/format';
import { toggleSpeedLimitsMode } from '@/api/transfer';
import { SpeedSparkline } from './SpeedSparkline';

export function TopBar({ serverState }: { serverState?: ServerState }) {
  const stats = useStats(serverState);
  const { openModal, setFilterText, filterText } = useUi();
  const loc = useLocation();
  const history = useSpeedHistory({ dl: stats.dlSpeed, up: stats.upSpeed });

  const connectionDotCls = {
    connected: 'bg-success-fg',
    firewalled: 'bg-attention-fg',
    disconnected: 'bg-danger-fg',
  }[stats.connection] ?? 'bg-fg-subtle';

  const altRateActive = serverState?.use_alt_speed_limits ?? false;

  return (
    <div className="h-14 bg-canvas border-b border-border-muted flex items-center px-4 gap-4 shrink-0">
      {/* Brand — clickable home link */}
      <Link
        to="/"
        className="flex items-center gap-2 font-semibold text-base text-fg-default hover:text-fg-default shrink-0"
        title="Home"
      >
        <span
          className={`w-3 h-3 rounded-full shrink-0 ${connectionDotCls}`}
          title={stats.connection}
        />
        qbt
      </Link>

      {/* Stats with sparklines */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <Stat label="↓" value={formatSpeed(stats.dlSpeed)} />
          <SpeedSparkline
            values={history.dl}
            color="var(--color-accent-fg)"
            ariaLabel="Download speed history"
          />
        </div>
        <div className="flex items-center gap-2">
          <Stat label="↑" value={formatSpeed(stats.upSpeed)} />
          <SpeedSparkline
            values={history.up}
            color="var(--color-success-fg)"
            ariaLabel="Upload speed history"
          />
        </div>
        <Stat label="ratio" value={formatRatio(stats.ratio)} />
        <Stat label="free" value={formatBytes(stats.freeSpace)} />
      </div>

      <div className="flex-1" />

      {/* Alt-rate toggle button */}
      <button
        onClick={() => toggleSpeedLimitsMode()}
        title="Toggle alternative speed limits"
        className={[
          'border rounded px-2 py-0.5 text-xs font-medium transition-colors',
          altRateActive
            ? 'bg-accent-emphasis text-fg-on-emphasis border-transparent'
            : 'bg-canvas-subtle border-border-default text-fg-muted hover:text-fg-default',
        ].join(' ')}
      >
        🐢
      </button>

      {/* Filter input */}
      <input
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        placeholder="Filter…"
        className="bg-canvas-inset border border-border-default rounded-md px-3 py-1 text-sm w-56 placeholder:text-fg-subtle focus-accent"
      />

      {/* Nav links */}
      <Link to="/" className={navCls(loc.pathname === '/')}>
        torrents
      </Link>
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

      {/* Log */}
      <button
        onClick={() => openModal('log')}
        className="text-fg-muted hover:text-fg-default text-xs px-2 py-1"
        title="View log"
      >
        Log
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

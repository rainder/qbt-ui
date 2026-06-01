import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { ServerState } from '@/api/types';
import { useStats } from '@/hooks/useStats';
import { useSpeedHistory } from '@/hooks/useSpeedHistory';
import { useUi } from '@/stores/ui';
import { formatBytes, formatSpeed, formatRatio } from '@/lib/format';
import { toggleSpeedLimitsMode } from '@/api/transfer';
import { SpeedSparkline } from './SpeedSparkline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Kbd } from '@/components/ui/Kbd';
import clsx from 'clsx';

export function TopBar({ serverState }: { serverState?: ServerState }) {
  const stats = useStats(serverState);
  const { openModal, setFilterText, filterText } = useUi();
  const loc = useLocation();
  const history = useSpeedHistory();

  const connectionDotCls = {
    connected: 'bg-success-fg',
    firewalled: 'bg-attention-fg',
    disconnected: 'bg-danger-fg',
  }[stats.connection] ?? 'bg-fg-subtle';

  const altRateActive = serverState?.use_alt_speed_limits ?? false;

  const sidebarCollapsed = useUi((s) => s.sidebarCollapsed);
  const toggleSidebar = useUi((s) => s.toggleSidebar);

  return (
    <div className="hidden md:flex sticky top-0 z-20 h-14 bg-canvas border-b border-border-muted items-center px-2 sm:px-3 gap-2 sm:gap-3 shrink-0">
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        title={sidebarCollapsed ? 'Show sidebar ([)' : 'Hide sidebar ([)'}
        aria-label="Toggle sidebar"
        className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md text-fg-muted hover:text-fg-default hover:bg-canvas-subtle transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="12" height="10" rx="1.5" />
          <line x1="6" y1="3" x2="6" y2="13" />
          {!sidebarCollapsed && <line x1="3.5" y1="6" x2="4.5" y2="6" />}
          {!sidebarCollapsed && <line x1="3.5" y1="8" x2="4.5" y2="8" />}
          {!sidebarCollapsed && <line x1="3.5" y1="10" x2="4.5" y2="10" />}
        </svg>
      </button>

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

      {/* Stats — sparklines hidden <lg, ratio/free hidden <md, ↓↑ hidden <sm */}
      <div className="hidden sm:flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <Stat label="↓" value={formatSpeed(stats.dlSpeed)} />
          <span className="hidden lg:inline-flex">
            <SpeedSparkline
              values={history.dl}
              color="var(--color-accent-fg)"
              ariaLabel="Download speed history"
            />
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Stat label="↑" value={formatSpeed(stats.upSpeed)} />
          <span className="hidden lg:inline-flex">
            <SpeedSparkline
              values={history.up}
              color="var(--color-success-fg)"
              ariaLabel="Upload speed history"
            />
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Stat label="ratio" value={formatRatio(stats.ratio)} />
          <Stat label="free" value={formatBytes(stats.freeSpace)} />
        </div>
      </div>

      <div className="flex-1" />

      {/* Alt-rate toggle — desktop only, mobile gets it via overflow menu */}
      <button
        onClick={() => toggleSpeedLimitsMode()}
        title="Toggle alternative speed limits"
        className={clsx(
          'hidden md:inline-flex border rounded px-2 py-0.5 text-xs font-medium transition-colors',
          altRateActive
            ? 'bg-accent-emphasis text-fg-on-emphasis border-transparent'
            : 'bg-canvas-subtle border-border-default text-fg-muted hover:text-fg-default',
        )}
      >
        🐢
      </button>

      {/* Filter input — narrower on small screens, hidden below sm */}
      <Input
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        placeholder="Filter…"
        className="hidden sm:block w-32 md:w-40 lg:w-56"
      />

      {/* Nav links — torrents/search always visible, settings desktop only */}
      <Link to="/" className={navCls(loc.pathname === '/')}>
        torrents
      </Link>
      <Link to="/search" className={navCls(loc.pathname === '/search')}>
        search
      </Link>
      <Link to="/settings" className={clsx('hidden md:inline-block', navCls(loc.pathname.startsWith('/settings')))}>
        settings
      </Link>

      {/* Add — desktop only on toolbar; mobile gets it via overflow menu */}
      <span className="hidden md:inline-flex">
        <Button variant="primary" onClick={() => openModal('add')}>
          + Add
        </Button>
      </span>

      {/* Log — desktop only */}
      <span className="hidden md:inline-flex">
        <Button variant="ghost" density="sm" onClick={() => openModal('log')} title="View log">
          Log
        </Button>
      </span>

      {/* Help — desktop only */}
      <button
        onClick={() => openModal('help')}
        title="Keyboard shortcuts (?)"
        className="hidden md:inline-block whitespace-nowrap"
      >
        <Kbd>?</Kbd>
      </button>

      {/* Mobile overflow menu — replaces hidden items below md */}
      <OverflowMenu
        altRateActive={altRateActive}
        onAdd={() => openModal('add')}
        onAltRate={() => toggleSpeedLimitsMode()}
        onLog={() => openModal('log')}
        onHelp={() => openModal('help')}
      />
    </div>
  );
}

function OverflowMenu({
  altRateActive, onAdd, onAltRate, onLog, onHelp,
}: {
  altRateActive: boolean;
  onAdd: () => void;
  onAltRate: () => void;
  onLog: () => void;
  onHelp: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function close<T extends () => void>(fn: T) {
    return () => { fn(); setOpen(false); };
  }

  return (
    <div ref={ref} className="md:hidden relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="More"
        aria-expanded={open}
        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-fg-muted hover:text-fg-default hover:bg-canvas-subtle transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <circle cx="3" cy="8" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="13" cy="8" r="1.5" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 min-w-44 rounded-md border border-border-default bg-canvas shadow-lg p-1 z-50"
        >
          <MenuItem onClick={close(onAdd)}>+ Add torrent</MenuItem>
          <div className="my-1 h-px bg-border-muted" />
          <MenuLink to="/settings" onClick={() => setOpen(false)}>Settings</MenuLink>
          <MenuItem onClick={close(onLog)}>Log</MenuItem>
          <MenuItem onClick={close(onAltRate)}>
            <span className="mr-2">🐢</span>
            Alt-rate{altRateActive ? ' (on)' : ''}
          </MenuItem>
          <MenuItem onClick={close(onHelp)}>Shortcuts</MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      role="menuitem"
      className="block px-3 py-1.5 text-sm rounded-md text-fg-default hover:bg-canvas-subtle"
    >
      {children}
    </Link>
  );
}

function MenuItem({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      role="menuitem"
      className="w-full text-left block px-3 py-1.5 text-sm rounded-md text-fg-default hover:bg-canvas-subtle"
    >
      {children}
    </button>
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

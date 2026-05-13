import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useUi } from '@/stores/ui';
import { useSync } from '@/hooks/useSync';
import { useStats } from '@/hooks/useStats';
import { formatSpeed, formatBytes, formatRatio } from '@/lib/format';
import { toggleSpeedLimitsMode } from '@/api/transfer';

/**
 * Floating bottom pill bar shown only on mobile-sized viewports.
 * Sits above page content with backdrop blur; safe-area aware.
 * Page scroll containers should use `.pb-mobile-nav` so the last
 * item can clear the bar.
 */
export function MobileBottomBar() {
  const loc = useLocation();
  const { openModal, toggleSidebar } = useUi();
  const { state } = useSync();
  const stats = useStats(state.serverState);

  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    function down(e: MouseEvent | TouchEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    }
    document.addEventListener('mousedown', down);
    document.addEventListener('touchstart', down);
    return () => {
      document.removeEventListener('mousedown', down);
      document.removeEventListener('touchstart', down);
    };
  }, [moreOpen]);

  const isHome = loc.pathname === '/';
  const isSearch = loc.pathname === '/search';
  const altRate = state.serverState?.use_alt_speed_limits ?? false;

  const connDot = {
    connected: 'bg-success-fg',
    firewalled: 'bg-attention-fg',
    disconnected: 'bg-danger-fg',
  }[stats.connection] ?? 'bg-fg-subtle';

  return (
    <div
      className="md:hidden fixed left-3.5 right-3.5 z-30 pointer-events-none"
      style={{ bottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div
        className={clsx(
          'pointer-events-auto flex items-center justify-around gap-1 px-2 h-[62px]',
          'rounded-[28px] border border-border-muted bg-canvas-subtle/80 backdrop-blur-xl backdrop-saturate-150',
          'shadow-[0_10px_40px_rgba(0,0,0,0.45),0_2px_6px_rgba(0,0,0,0.25)]',
        )}
      >
        <NavTab to="/" active={isHome} label="Torrents">
          <span className="relative inline-flex">
            <HomeIcon />
            <span
              className={clsx(
                'absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-canvas',
                connDot,
              )}
              aria-label={`Connection: ${stats.connection}`}
            />
          </span>
        </NavTab>

        <NavTab to="/search" active={isSearch} label="Search">
          <SearchIcon />
        </NavTab>

        <ActionTab
          label="Add"
          emphasized
          onClick={() => openModal('add')}
        >
          <PlusIcon />
        </ActionTab>

        <ActionTab
          label="Filters"
          onClick={toggleSidebar}
        >
          <FiltersIcon />
        </ActionTab>

        <div ref={moreRef} className="relative flex-1 max-w-[64px] flex justify-center">
          <ActionTab
            label="More"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
          >
            <MoreIcon />
          </ActionTab>
          {moreOpen && (
            <div
              role="menu"
              className={clsx(
                'absolute right-0 bottom-full mb-3 min-w-56',
                'rounded-xl border border-border-default bg-canvas shadow-lg p-1',
                'pointer-events-auto',
              )}
            >
              <div className="px-3 py-2 border-b border-border-muted">
                <div className="flex items-center gap-2 mb-1">
                  <span className={clsx('w-2 h-2 rounded-full', connDot)} />
                  <span className="text-xs text-fg-muted capitalize">{stats.connection}</span>
                </div>
                <div className="grid grid-cols-2 gap-y-0.5 text-xs">
                  <StatRow label="↓" value={formatSpeed(stats.dlSpeed)} />
                  <StatRow label="↑" value={formatSpeed(stats.upSpeed)} />
                  <StatRow label="ratio" value={formatRatio(stats.ratio)} />
                  <StatRow label="free" value={formatBytes(stats.freeSpace)} />
                </div>
              </div>
              <MenuLink to="/settings" onClick={() => setMoreOpen(false)}>
                Settings
              </MenuLink>
              <MenuItem onClick={() => { openModal('log'); setMoreOpen(false); }}>
                Log
              </MenuItem>
              <MenuItem onClick={() => { void toggleSpeedLimitsMode(); setMoreOpen(false); }}>
                <span className="mr-2">🐢</span>
                Alt-rate{altRate ? ' (on)' : ''}
              </MenuItem>
              <MenuItem onClick={() => { openModal('help'); setMoreOpen(false); }}>
                Shortcuts
              </MenuItem>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NavTab({
  to, active, label, children,
}: {
  to: string;
  active: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={clsx(
        'inline-flex items-center justify-center flex-1 h-11 max-w-[64px] rounded-full transition-colors',
        active ? 'text-fg-default bg-accent-subtle' : 'text-fg-muted hover:text-fg-default',
      )}
    >
      {children}
    </Link>
  );
}

function ActionTab({
  label, onClick, emphasized, children, 'aria-expanded': ariaExpanded,
}: {
  label: string;
  onClick: () => void;
  emphasized?: boolean;
  children: React.ReactNode;
  'aria-expanded'?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={ariaExpanded}
      onClick={onClick}
      className={clsx(
        'inline-flex items-center justify-center flex-1 h-11 max-w-[64px] rounded-full transition-colors',
        emphasized
          ? 'bg-accent-emphasis text-fg-on-emphasis'
          : 'text-fg-muted hover:text-fg-default',
      )}
    >
      {children}
    </button>
  );
}

function MenuLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      role="menuitem"
      className="block px-3 py-2 text-sm rounded-md text-fg-default hover:bg-canvas-subtle"
    >
      {children}
    </Link>
  );
}

function MenuItem({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="menuitem"
      className="w-full text-left block px-3 py-2 text-sm rounded-md text-fg-default hover:bg-canvas-subtle"
    >
      {children}
    </button>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-fg-muted">{label}</span>
      <span className="font-semibold tabular-nums text-fg-default text-right">{value}</span>
    </>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function FiltersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

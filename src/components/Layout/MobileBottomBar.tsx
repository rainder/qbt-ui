import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useUi } from '@/stores/ui';
import { useSync } from '@/hooks/useSync';
import { useStats } from '@/hooks/useStats';
import { useSpeedHistoryStore } from '@/stores/speedHistory';

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

  // Record speed samples globally so the chart on /more (and the desktop
  // sparklines) keep accumulating data across page navigations. This bar is
  // mounted under AuthGate at all viewport sizes (just visually `md:hidden`
  // on desktop), so it's a stable place to record from. Depend on `rid`
  // (increments every successful poll) so we record even when speeds stay
  // at 0 across ticks.
  useEffect(() => {
    useSpeedHistoryStore.getState().push(stats.dlSpeed, stats.upSpeed);
  }, [state.rid, stats.dlSpeed, stats.upSpeed]);

  const isHome = loc.pathname === '/';
  const isSearch = loc.pathname === '/search';
  const isMore = loc.pathname === '/more';

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

        <NavTab to="/more" active={isMore} label="More">
          <MoreIcon />
        </NavTab>
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
  label, onClick, emphasized, children,
}: {
  label: string;
  onClick: () => void;
  emphasized?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
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

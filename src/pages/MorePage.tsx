import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { useSync } from '@/hooks/useSync';
import { useStats } from '@/hooks/useStats';
import { useSpeedHistory } from '@/hooks/useSpeedHistory';
import { useUi } from '@/stores/ui';
import { formatSpeed, formatBytes, formatRatio } from '@/lib/format';
import { toggleSpeedLimitsMode } from '@/api/transfer';

export default function MorePage() {
  const { state } = useSync();
  const stats = useStats(state.serverState);
  const history = useSpeedHistory();
  const { openModal } = useUi();
  const altRate = state.serverState?.use_alt_speed_limits ?? false;

  const connDot = {
    connected: 'bg-success-fg',
    firewalled: 'bg-attention-fg',
    disconnected: 'bg-danger-fg',
  }[stats.connection] ?? 'bg-fg-subtle';

  return (
    <div className="min-h-screen flex flex-col bg-canvas pb-mobile-nav">
      <div className="h-12 sticky top-0 z-10 bg-canvas border-b border-border-default flex items-center px-4">
        <div className="text-base font-semibold text-fg-default">More</div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <section className="rounded-xl border border-border-muted bg-canvas-subtle p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className={clsx('w-2 h-2 rounded-full', connDot)} aria-hidden />
              <span className="text-sm text-fg-muted capitalize">{stats.connection}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-fg-muted">
              <LegendDot color="var(--color-accent-fg)" label="↓" />
              <LegendDot color="var(--color-success-fg)" label="↑" />
            </div>
          </div>
          <SpeedChart dl={history.dl} up={history.up} />
          <div className="grid grid-cols-2 gap-y-1.5 text-sm mt-3">
            <Stat label="↓ Down"     value={formatSpeed(stats.dlSpeed)} />
            <Stat label="↑ Up"       value={formatSpeed(stats.upSpeed)} />
            <Stat label="Ratio"      value={formatRatio(stats.ratio)} />
            <Stat label="Free space" value={formatBytes(stats.freeSpace)} />
          </div>
        </section>

        <nav className="rounded-xl border border-border-muted bg-canvas-subtle overflow-hidden flex flex-col">
          <NavLink to="/settings">Settings</NavLink>
          <NavButton onClick={() => openModal('log')}>Log</NavButton>
          <NavButton onClick={() => void toggleSpeedLimitsMode()}>
            <span className="flex-1 text-left">Alt rate</span>
            {altRate && <span className="text-fg-muted text-xs">on</span>}
          </NavButton>
        </nav>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-fg-muted">{label}</span>
      <span className="font-semibold tabular-nums text-fg-default text-right">{value}</span>
    </>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 px-4 py-3 text-sm text-fg-default border-b border-border-muted last:border-b-0 active:bg-canvas-inset"
    >
      <span className="flex-1">{children}</span>
      <Chevron />
    </Link>
  );
}

function NavButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-3 text-sm text-fg-default border-b border-border-muted last:border-b-0 active:bg-canvas-inset text-left"
    >
      {children}
    </button>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} aria-hidden />
      <span className="tabular-nums">{label}</span>
    </span>
  );
}

function SpeedChart({ dl, up }: { dl: number[]; up: number[] }) {
  const W = 200;
  const H = 80;
  const max = Math.max(...dl, ...up, 1);

  if (dl.length < 2 && up.length < 2) {
    return (
      <div className="w-full flex items-center justify-center text-xs text-fg-subtle" style={{ height: H }}>
        collecting data…
      </div>
    );
  }

  const linePath = (values: number[]) => {
    if (values.length < 2) return '';
    return values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * W;
        const y = H - (v / max) * H;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };
  const areaPath = (values: number[]) => {
    const line = linePath(values);
    if (!line) return '';
    return `${line} L${W},${H} L0,${H} Z`;
  };

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-label="Speed history"
      className="block"
    >
      <path d={areaPath(dl)} fill="var(--color-accent-fg)" fillOpacity={0.18} />
      <path d={areaPath(up)} fill="var(--color-success-fg)" fillOpacity={0.18} />
      <path d={linePath(dl)} stroke="var(--color-accent-fg)" strokeWidth={1.5} fill="none" vectorEffect="non-scaling-stroke" />
      <path d={linePath(up)} stroke="var(--color-success-fg)" strokeWidth={1.5} fill="none" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-fg-muted">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

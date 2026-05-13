import type { Torrent } from '@/api/types';
import { ProgressBar } from './ProgressBar';
import { StatusPill } from './StatusPill';
import { formatBytes, formatSpeed, formatEta } from '@/lib/format';
import clsx from 'clsx';

export function TorrentCard({
  t, selected, active, onClick, onContextMenu,
}: {
  t: Partial<Torrent>;
  selected: boolean;
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}) {
  const progress = t.progress ?? 0;
  const pct = Math.round(progress * 100);
  const complete = progress >= 1;
  const dl = t.dlspeed ?? 0;
  const up = t.upspeed ?? 0;

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={clsx(
        'flex flex-col gap-1.5 px-3 py-2 border-b border-border-muted cursor-default',
        selected ? 'bg-accent-subtle' : 'active:bg-canvas-subtle',
        active && 'ring-1 ring-inset ring-accent-fg',
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex-1 truncate text-sm font-medium text-fg-default">{t.name}</div>
        <div className="shrink-0 tabular-nums text-xs text-fg-muted">{formatBytes(t.size ?? 0)}</div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1"><ProgressBar value={progress} complete={complete} /></div>
        <div className="shrink-0 tabular-nums text-xs text-fg-muted w-9 text-right">{pct}%</div>
      </div>
      <div className="flex items-center gap-2 text-xs text-fg-muted min-w-0">
        <StatusPill state={t.state ?? 'unknown'} />
        {dl > 0 && <span className="tabular-nums whitespace-nowrap">↓ {formatSpeed(dl)}</span>}
        {up > 0 && <span className="tabular-nums whitespace-nowrap">↑ {formatSpeed(up)}</span>}
        {!complete && (t.eta ?? -1) >= 0 && (
          <span className="tabular-nums whitespace-nowrap">· {formatEta(t.eta ?? -1)}</span>
        )}
        {t.category && <span className="ml-auto truncate">{t.category}</span>}
      </div>
    </div>
  );
}

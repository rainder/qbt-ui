import type { Torrent } from '@/api/types';
import { StatusPill } from './StatusPill';
import { ProgressBar } from './ProgressBar';
import { formatBytes, formatSpeed, formatEta, formatRatio, formatRelativeTime } from '@/lib/format';
import clsx from 'clsx';

export function TorrentRow({
  t, selected, active, onClick, onDouble,
}: {
  t: Partial<Torrent>;
  selected: boolean;
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDouble: () => void;
}) {
  return (
    <div
      onClick={onClick}
      onDoubleClick={onDouble}
      className={clsx(
        'flex items-center gap-3 px-4 h-11 border-b border-border-muted transition-colors cursor-default',
        selected ? 'bg-accent-subtle' : 'hover:bg-canvas-subtle',
        active && 'ring-1 ring-inset ring-accent-fg',
      )}
    >
      <div className="flex-1 truncate font-medium text-fg-default text-sm">{t.name}</div>
      <div className="w-20 text-right tabular-nums text-sm text-fg-default">{formatBytes(t.size ?? 0)}</div>
      <div className="w-20"><StatusPill state={t.state ?? 'unknown'} /></div>
      <div className="w-28">
        <ProgressBar value={t.progress ?? 0} complete={(t.progress ?? 0) >= 1} />
      </div>
      <div className="w-20 text-right tabular-nums text-sm text-fg-default">{formatSpeed(t.dlspeed ?? 0)}</div>
      <div className="w-20 text-right tabular-nums text-sm text-fg-default">{formatSpeed(t.upspeed ?? 0)}</div>
      <div className="w-16 text-right tabular-nums text-sm text-fg-default">{formatEta(t.eta ?? -1)}</div>
      <div className="w-14 text-right tabular-nums text-sm text-fg-default">{formatRatio(t.ratio ?? 0)}</div>
      <div className="w-20 text-right tabular-nums text-sm text-fg-muted">{formatRelativeTime(t.added_on ?? 0)}</div>
    </div>
  );
}

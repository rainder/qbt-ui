import type { Torrent } from '@/api/types';
import { StatusPill } from './StatusPill';
import { ProgressBar } from './ProgressBar';
import { formatBytes, formatSpeed, formatEta, formatRatio } from '@/lib/format';
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
        'flex items-center gap-3 px-3 h-9 border-b border-border',
        selected
          ? 'bg-accent-bg text-fg2 border-l-2 border-l-accent pl-[10px]'
          : 'hover:bg-bg3 border-l-2 border-l-transparent pl-[10px]',
        active && 'outline outline-1 -outline-offset-1 outline-accent',
      )}
    >
      <StatusPill state={t.state ?? 'unknown'} />
      <div className="flex-1 truncate font-medium text-fg2">{t.name}</div>
      <div className="w-20 text-right tabular-nums">{formatBytes(t.size ?? 0)}</div>
      <div className="w-28"><ProgressBar value={t.progress ?? 0} complete={(t.progress ?? 0) >= 1} /></div>
      <div className="w-20 text-right tabular-nums">{formatSpeed(t.dlspeed ?? 0)}</div>
      <div className="w-20 text-right tabular-nums">{formatSpeed(t.upspeed ?? 0)}</div>
      <div className="w-16 text-right tabular-nums">{formatEta(t.eta ?? -1)}</div>
      <div className="w-14 text-right tabular-nums">{formatRatio(t.ratio ?? 0)}</div>
    </div>
  );
}

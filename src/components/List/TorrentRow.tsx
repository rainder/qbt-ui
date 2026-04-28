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
        'flex items-center gap-3 px-3 h-7 border-b border-dotted border-border cursor-default',
        selected ? 'bg-bg2 text-fg2' : 'hover:bg-bg2',
        active && 'outline outline-1 -outline-offset-1 outline-accent',
      )}
    >
      <StatusPill state={t.state ?? 'unknown'} />
      <div className="flex-1 truncate">{t.name}</div>
      <div className="w-20 text-right">{formatBytes(t.size ?? 0)}</div>
      <div className="w-28"><ProgressBar value={t.progress ?? 0} complete={(t.progress ?? 0) >= 1} /></div>
      <div className="w-20 text-right">{formatSpeed(t.dlspeed ?? 0)}</div>
      <div className="w-20 text-right">{formatSpeed(t.upspeed ?? 0)}</div>
      <div className="w-16 text-right">{formatEta(t.eta ?? -1)}</div>
      <div className="w-14 text-right">{formatRatio(t.ratio ?? 0)}</div>
    </div>
  );
}

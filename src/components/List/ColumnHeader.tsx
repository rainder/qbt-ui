import { useUi, type SortKey } from '@/stores/ui';
import clsx from 'clsx';

const COLS: { key: SortKey; label: string; width: string; align?: string }[] = [
  { key: 'name',     label: 'Name',     width: 'flex-1' },
  { key: 'size',     label: 'Size',     width: 'w-20', align: 'text-right' },
  { key: 'progress', label: 'Progress', width: 'w-28' },
  { key: 'dlspeed',  label: '↓',        width: 'w-20', align: 'text-right' },
  { key: 'upspeed',  label: '↑',        width: 'w-20', align: 'text-right' },
  { key: 'eta',      label: 'Eta',      width: 'w-16', align: 'text-right' },
  { key: 'ratio',    label: 'Ratio',    width: 'w-14', align: 'text-right' },
];

export function ColumnHeader() {
  const { sortKey, sortDir, setSort } = useUi();
  return (
    <div className="bg-canvas-subtle border-b border-border-default flex items-center gap-3 px-4 h-9 text-xs font-semibold uppercase tracking-wider text-fg-muted">
      {/* Status pill placeholder — matches TorrentRow layout */}
      <div className="w-14 shrink-0" />
      {COLS.map((c) => (
        <button
          key={c.key}
          onClick={() => setSort(c.key)}
          className={clsx(
            c.width, c.align,
            'truncate text-left transition-colors',
            sortKey === c.key ? 'text-fg-default' : 'hover:text-fg-default',
          )}
        >
          {c.label}
          {sortKey === c.key && (sortDir === 'asc' ? ' ↑' : ' ↓')}
        </button>
      ))}
    </div>
  );
}

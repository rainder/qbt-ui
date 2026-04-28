import { useUi, type SortKey } from '@/stores/ui';
import clsx from 'clsx';

const COLS: { key: SortKey; label: string; width: string; align?: string }[] = [
  { key: 'name',     label: 'name',     width: 'flex-1' },
  { key: 'size',     label: 'size',     width: 'w-20', align: 'text-right' },
  { key: 'progress', label: 'progress', width: 'w-28' },
  { key: 'dlspeed',  label: '↓',        width: 'w-20', align: 'text-right' },
  { key: 'upspeed',  label: '↑',        width: 'w-20', align: 'text-right' },
  { key: 'eta',      label: 'eta',      width: 'w-16', align: 'text-right' },
  { key: 'ratio',    label: 'ratio',    width: 'w-14', align: 'text-right' },
];

export function ColumnHeader() {
  const { sortKey, sortDir, setSort } = useUi();
  return (
    <div className="flex items-center gap-3 px-3 h-7 border-b border-border text-xs uppercase tracking-wide text-muted">
      <div className="w-8" />
      {COLS.map((c) => (
        <button
          key={c.key} onClick={() => setSort(c.key)}
          className={clsx(c.width, c.align, 'truncate text-left hover:text-fg2',
            sortKey === c.key && 'text-fg2')}
        >
          {c.label}{sortKey === c.key && (sortDir === 'asc' ? ' ▲' : ' ▼')}
        </button>
      ))}
    </div>
  );
}

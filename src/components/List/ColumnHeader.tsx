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
    <div className="flex items-center gap-3 px-3 h-9 border-b border-border bg-bg2 text-muted text-[11px] font-medium pl-[10px] border-l-2 border-l-transparent">
      <div className="w-8" />
      {COLS.map((c) => (
        <button
          key={c.key} onClick={() => setSort(c.key)}
          className={clsx(c.width, c.align, 'truncate text-left hover:text-fg2',
            sortKey === c.key ? 'text-accent' : 'text-muted')}
        >
          {c.label}{sortKey === c.key && (sortDir === 'asc' ? ' ↑' : ' ↓')}
        </button>
      ))}
    </div>
  );
}

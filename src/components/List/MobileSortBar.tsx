import { useUi, type SortKey } from '@/stores/ui';

const OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'added_on', label: 'Added' },
  { key: 'name',     label: 'Name' },
  { key: 'size',     label: 'Size' },
  { key: 'progress', label: 'Progress' },
  { key: 'state',    label: 'State' },
  { key: 'dlspeed',  label: '↓' },
  { key: 'upspeed',  label: '↑' },
  { key: 'eta',      label: 'ETA' },
  { key: 'ratio',    label: 'Ratio' },
  { key: 'category', label: 'Category' },
];

export function MobileSortBar() {
  const { sortKey, sortDir, setSort } = useUi();
  return (
    <div
      className="flex items-center gap-1 px-2 pb-1.5 text-xs text-fg-muted border-b border-border-default overflow-x-auto bg-canvas-subtle"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 6px)' }}
    >
      <span className="shrink-0 mr-1 uppercase tracking-wider font-semibold">Sort</span>
      {OPTIONS.map((o) => {
        const active = sortKey === o.key;
        return (
          <button
            key={o.key}
            onClick={() => setSort(o.key)}
            className={[
              'shrink-0 px-2 py-0.5 rounded transition-colors whitespace-nowrap',
              active ? 'bg-accent-subtle text-fg-default' : 'hover:text-fg-default',
            ].join(' ')}
          >
            {o.label}
            {active && <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>}
          </button>
        );
      })}
    </div>
  );
}

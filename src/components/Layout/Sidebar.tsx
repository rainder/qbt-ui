import { useMemo } from 'react';
import type { Torrent } from '@/api/types';
import { useUi, type StatusFilter } from '@/stores/ui';
import clsx from 'clsx';
import { filterTorrents } from '@/lib/listOps';

const STATUSES: { key: StatusFilter; label: string }[] = [
  { key: 'all',         label: 'all' },
  { key: 'downloading', label: 'downloading' },
  { key: 'seeding',     label: 'seeding' },
  { key: 'completed',   label: 'completed' },
  { key: 'paused',      label: 'paused' },
  { key: 'active',      label: 'active' },
  { key: 'inactive',    label: 'inactive' },
  { key: 'errored',     label: 'errored' },
];

export function Sidebar({
  torrents, categories, tags,
}: {
  torrents: Record<string, Partial<Torrent>>;
  categories: Record<string, { name: string; savePath: string }>;
  tags: string[];
}) {
  const { filterStatus, setStatus, filterCategory, setCategory, filterTag, setTag } = useUi();

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: 0, downloading: 0, seeding: 0, completed: 0,
      paused: 0, active: 0, inactive: 0, errored: 0,
    };
    for (const k of Object.keys(c) as StatusFilter[]) {
      c[k] = filterTorrents(torrents, { status: k, category: null, tag: null, text: '' }).length;
    }
    return c;
  }, [torrents]);

  return (
    <div className="w-48 bg-bg2 border-r border-border h-full overflow-auto py-3 text-xs">
      <Section label="STATUS">
        {STATUSES.map((s) => (
          <Row key={s.key} active={filterStatus === s.key}
               onClick={() => setStatus(s.key)} count={counts[s.key]}>
            {s.label}
          </Row>
        ))}
      </Section>

      <Section label="CATEGORIES">
        <Row active={filterCategory === null} onClick={() => setCategory(null)}>(none)</Row>
        {Object.values(categories).map((c) => (
          <Row key={c.name} active={filterCategory === c.name} onClick={() => setCategory(c.name)}>
            {c.name || '(uncategorized)'}
          </Row>
        ))}
      </Section>

      <Section label="TAGS">
        <Row active={filterTag === null} onClick={() => setTag(null)}>(none)</Row>
        {tags.map((t) => (
          <Row key={t} active={filterTag === t} onClick={() => setTag(t)}>#{t}</Row>
        ))}
      </Section>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="px-3 mb-2 text-muted text-[10px] font-semibold uppercase tracking-[0.08em]">{label}</div>
      <div className="px-2 flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function Row({ children, active, onClick, count }: {
  children: React.ReactNode; active: boolean; onClick: () => void; count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left flex items-center justify-between gap-2 rounded px-2.5 py-1.5 text-[12px] transition-colors',
        active
          ? 'bg-accent-bg text-fg2 font-medium ring-1 ring-inset ring-accent/40'
          : 'text-fg hover:bg-bg3 hover:text-fg2',
      )}
    >
      <span className="truncate">{children}</span>
      {count !== undefined && (
        <span
          className={clsx(
            'shrink-0 rounded-full px-1.5 py-0 text-[10px] font-medium tabular-nums',
            active ? 'bg-accent text-bg' : 'bg-bg3 text-muted',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

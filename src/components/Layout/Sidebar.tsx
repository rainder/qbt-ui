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
    <div className="w-48 border-r border-border h-full overflow-auto py-2 text-xs">
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
    <div className="mb-4">
      <div className="px-3 mb-1 text-muted text-[10px] uppercase tracking-wide">{label}</div>
      {children}
    </div>
  );
}

function Row({ children, active, onClick, count }: {
  children: React.ReactNode; active: boolean; onClick: () => void; count?: number;
}) {
  return (
    <button onClick={onClick}
      className={clsx('w-full text-left py-1 flex justify-between gap-2 border-l-2',
        active
          ? 'bg-accent-bg text-accent border-l-accent pl-2.5 pr-3'
          : 'text-fg hover:bg-bg3 border-l-transparent pl-2.5 pr-3')}>
      <span className="truncate">{children}</span>
      {count !== undefined && <span className="text-muted">{count}</span>}
    </button>
  );
}

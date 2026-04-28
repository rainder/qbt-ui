import { useMemo } from 'react';
import type { Torrent } from '@/api/types';
import { useUi, type StatusFilter } from '@/stores/ui';
import clsx from 'clsx';
import { filterTorrents } from '@/lib/listOps';

const STATUSES: { key: StatusFilter; label: string }[] = [
  { key: 'all',         label: 'All' },
  { key: 'downloading', label: 'Downloading' },
  { key: 'seeding',     label: 'Seeding' },
  { key: 'completed',   label: 'Completed' },
  { key: 'paused',      label: 'Paused' },
  { key: 'active',      label: 'Active' },
  { key: 'inactive',    label: 'Inactive' },
  { key: 'errored',     label: 'Errored' },
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
    <div className="w-60 bg-canvas border-r border-border-muted overflow-auto py-4 px-3 text-sm shrink-0">
      <Section label="Status" first>
        {STATUSES.map((s) => (
          <Row
            key={s.key}
            active={filterStatus === s.key}
            onClick={() => setStatus(s.key)}
            count={counts[s.key]}
          >
            {s.label}
          </Row>
        ))}
      </Section>

      <Section label="Categories">
        <Row active={filterCategory === null} onClick={() => setCategory(null)}>
          All categories
        </Row>
        {Object.values(categories).map((c) => (
          <Row key={c.name} active={filterCategory === c.name} onClick={() => setCategory(c.name)}>
            {c.name || '(uncategorized)'}
          </Row>
        ))}
      </Section>

      <Section label="Tags">
        <Row active={filterTag === null} onClick={() => setTag(null)}>
          All tags
        </Row>
        {tags.map((t) => (
          <Row key={t} active={filterTag === t} onClick={() => setTag(t)}>
            #{t}
          </Row>
        ))}
      </Section>
    </div>
  );
}

function Section({
  label, children, first,
}: {
  label: string; children: React.ReactNode; first?: boolean;
}) {
  return (
    <div className={first ? '' : 'mt-4'}>
      <div className="text-fg-muted text-xs font-semibold uppercase tracking-wider px-3 mb-1">
        {label}
      </div>
      <div className="flex flex-col gap-px">{children}</div>
    </div>
  );
}

function Row({
  children, active, onClick, count,
}: {
  children: React.ReactNode; active: boolean; onClick: () => void; count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
        active
          ? 'bg-accent-subtle text-fg-default font-semibold'
          : 'text-fg-default hover:bg-canvas-subtle',
      )}
    >
      <span className="truncate">{children}</span>
      {count !== undefined && (
        <span
          className={clsx(
            'shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium tabular-nums',
            active
              ? 'bg-accent-fg text-fg-on-emphasis'
              : 'bg-canvas-subtle text-fg-muted',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

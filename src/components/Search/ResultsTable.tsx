import { useMemo, useState } from 'react';
import type { SearchResult } from '@/api/types';
import { formatBytes } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { useIsMobile } from '@/hooks/useIsMobile';

type SortKey = 'fileName' | 'fileSize' | 'nbSeeders' | 'nbLeechers' | 'siteUrl';
type SortDir = 'asc' | 'desc';

const COLS: { key: SortKey; label: string; align: 'left' | 'right'; width?: string }[] = [
  { key: 'fileName',   label: 'Name',  align: 'left' },
  { key: 'fileSize',   label: 'Size',  align: 'right', width: 'w-20' },
  { key: 'nbSeeders',  label: 'S',     align: 'right', width: 'w-12' },
  { key: 'nbLeechers', label: 'L',     align: 'right', width: 'w-12' },
  { key: 'siteUrl',    label: 'Site',  align: 'left',  width: 'w-32' },
];

export function ResultsTable({
  results, onAdd,
}: {
  results: SearchResult[];
  onAdd: (url: string) => void;
}) {
  const isMobile = useIsMobile();
  const [sortKey, setSortKey] = useState<SortKey>('nbSeeders');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  const sorted = useMemo(() => {
    const factor = sortDir === 'asc' ? 1 : -1;
    return [...results].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
      return String(av).localeCompare(String(bv)) * factor;
    });
  }, [results, sortKey, sortDir]);

  if (isMobile) {
    return (
      <div className="flex flex-col">
        <div className="sticky top-0 z-10 bg-canvas-subtle border-b border-border-default flex items-center gap-1 px-2 py-1.5 text-xs text-fg-muted overflow-x-auto">
          <span className="shrink-0 mr-1">Sort:</span>
          {COLS.map((c) => (
            <button
              key={c.key}
              onClick={() => toggleSort(c.key)}
              className={[
                'shrink-0 px-2 py-0.5 rounded transition-colors',
                sortKey === c.key
                  ? 'bg-accent-subtle text-fg-default'
                  : 'hover:text-fg-default',
              ].join(' ')}
            >
              {c.label}
              {sortKey === c.key && <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>}
            </button>
          ))}
        </div>
        {sorted.map((r, i) => (
          <ResultCard key={i} r={r} onAdd={onAdd} />
        ))}
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-canvas-subtle border-b border-border-default text-fg-muted text-xs font-semibold uppercase tracking-wider">
          {COLS.map((c) => (
            <th
              key={c.key}
              className={[
                'py-2 px-3',
                c.width ?? '',
                c.align === 'right' ? 'text-right' : 'text-left',
              ].join(' ')}
            >
              <button
                onClick={() => toggleSort(c.key)}
                className={[
                  'transition-colors',
                  sortKey === c.key ? 'text-fg-default' : 'hover:text-fg-default',
                ].join(' ')}
              >
                {c.label}
                {sortKey === c.key && <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>}
              </button>
            </th>
          ))}
          <th className="w-16 px-3" />
        </tr>
      </thead>
      <tbody>
        {sorted.map((r, i) => (
          <tr key={i} className="border-b border-border-muted hover:bg-canvas-subtle">
            <td className="px-3 py-2 truncate text-fg-default max-w-2xl">{r.fileName}</td>
            <td className="text-right px-3 tabular-nums text-fg-default whitespace-nowrap">
              {r.fileSize > 0 ? formatBytes(r.fileSize) : '—'}
            </td>
            <td className="text-right px-3 tabular-nums text-success-fg font-semibold">{r.nbSeeders}</td>
            <td className="text-right px-3 tabular-nums text-attention-fg font-semibold">{r.nbLeechers}</td>
            <td className="px-3 truncate">
              <a
                href={r.descrLink}
                target="_blank"
                rel="noreferrer"
                className="text-fg-muted hover:text-fg-default"
              >
                {new URL(r.siteUrl).hostname}
              </a>
            </td>
            <td className="text-right pr-3">
              <Button
                variant="ghost"
                density="sm"
                className="text-accent-fg hover:bg-accent-subtle"
                onClick={() => onAdd(r.fileUrl)}
              >
                + Add
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ResultCard({ r, onAdd }: { r: SearchResult; onAdd: (url: string) => void }) {
  let host = '';
  try { host = new URL(r.siteUrl).hostname; } catch { host = r.siteUrl; }
  return (
    <div className="flex flex-col gap-1.5 px-3 py-2 border-b border-border-muted">
      <div className="flex items-start gap-2 min-w-0">
        <div className="flex-1 text-sm font-medium text-fg-default break-words">{r.fileName}</div>
        <div className="shrink-0 tabular-nums text-xs text-fg-muted whitespace-nowrap">
          {r.fileSize > 0 ? formatBytes(r.fileSize) : '—'}
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs min-w-0">
        <span className="tabular-nums text-success-fg font-semibold whitespace-nowrap">S {r.nbSeeders}</span>
        <span className="tabular-nums text-attention-fg font-semibold whitespace-nowrap">L {r.nbLeechers}</span>
        <a
          href={r.descrLink}
          target="_blank"
          rel="noreferrer"
          className="truncate text-fg-muted hover:text-fg-default"
        >
          {host}
        </a>
        <span className="ml-auto shrink-0">
          <Button
            variant="ghost"
            density="sm"
            className="text-accent-fg hover:bg-accent-subtle"
            onClick={() => onAdd(r.fileUrl)}
          >
            + Add
          </Button>
        </span>
      </div>
    </div>
  );
}

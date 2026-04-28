import { useMemo, useState } from 'react';
import type { SearchResult } from '@/api/types';
import { formatBytes } from '@/lib/format';

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
              <button
                onClick={() => onAdd(r.fileUrl)}
                className="bg-canvas-subtle hover:bg-accent-subtle text-accent-fg border border-border-default rounded-md px-2 py-1 text-xs"
              >
                + Add
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

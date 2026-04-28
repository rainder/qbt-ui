import type { SearchResult } from '@/api/types';
import { formatBytes } from '@/lib/format';

export function ResultsTable({
  results, onAdd,
}: {
  results: SearchResult[];
  onAdd: (url: string) => void;
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-canvas-subtle border-b border-border-default text-fg-muted text-xs font-semibold uppercase tracking-wider">
          <th className="text-left py-2 px-3">Name</th>
          <th className="text-right w-20 px-3">Size</th>
          <th className="text-right w-12 px-3">S</th>
          <th className="text-right w-12 px-3">L</th>
          <th className="text-left w-32 px-3">Site</th>
          <th className="w-16 px-3" />
        </tr>
      </thead>
      <tbody>
        {results.map((r, i) => (
          <tr key={i} className="border-b border-border-muted hover:bg-canvas-subtle">
            <td className="px-3 py-2 truncate text-fg-default max-w-2xl">{r.fileName}</td>
            <td className="text-right px-3 tabular-nums text-fg-default">
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

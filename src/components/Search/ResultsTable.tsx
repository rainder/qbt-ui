import type { SearchResult } from '@/api/types';
import { formatBytes } from '@/lib/format';

export function ResultsTable({
  results, onAdd,
}: {
  results: SearchResult[];
  onAdd: (url: string) => void;
}) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-muted uppercase tracking-wide text-[10px]">
          <th className="text-left py-1 px-2">name</th>
          <th className="text-right w-20">size</th>
          <th className="text-right w-12">S</th>
          <th className="text-right w-12">L</th>
          <th className="text-left w-32">site</th>
          <th className="w-16"></th>
        </tr>
      </thead>
      <tbody>
        {results.map((r, i) => (
          <tr key={i} className="border-b border-dotted border-border hover:bg-bg2">
            <td className="px-2 py-0.5 truncate text-fg2 max-w-2xl">{r.fileName}</td>
            <td className="text-right">{r.fileSize > 0 ? formatBytes(r.fileSize) : '—'}</td>
            <td className="text-right text-ok">{r.nbSeeders}</td>
            <td className="text-right text-warn">{r.nbLeechers}</td>
            <td className="truncate"><a href={r.descrLink} target="_blank" rel="noreferrer" className="text-muted hover:text-fg2">{new URL(r.siteUrl).hostname}</a></td>
            <td className="text-right pr-2">
              <button onClick={() => onAdd(r.fileUrl)} className="border border-accent text-accent px-2">+</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

import { useQuery } from '@tanstack/react-query';
import { fetchFiles } from '@/api/torrents';
import { formatBytes } from '@/lib/format';
import { ProgressBar } from '@/components/List/ProgressBar';

export function FilesTab({ hash }: { hash: string }) {
  const q = useQuery({
    queryKey: ['files', hash],
    queryFn: () => fetchFiles(hash),
    refetchInterval: 3000,
  });
  if (q.isLoading) return <div className="text-fg-muted text-sm">Loading files…</div>;
  if (q.error) return <div className="text-danger-fg text-sm">{(q.error as Error).message}</div>;
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-canvas-subtle border-b border-border-default text-fg-muted text-xs font-semibold uppercase tracking-wider">
          <th className="text-left py-2 px-3">Name</th>
          <th className="text-right w-20 px-3">Size</th>
          <th className="w-28 px-3">Progress</th>
          <th className="text-right w-12 px-3">Prio</th>
        </tr>
      </thead>
      <tbody>
        {(q.data ?? []).map((f) => (
          <tr key={f.index} className="border-b border-border-muted hover:bg-canvas-subtle text-sm">
            <td className="py-2 px-3 truncate text-fg-default">{f.name}</td>
            <td className="text-right px-3 tabular-nums text-fg-default">{formatBytes(f.size)}</td>
            <td className="px-3"><ProgressBar value={f.progress} complete={f.progress >= 1} /></td>
            <td className="text-right px-3 tabular-nums text-fg-default">{f.priority}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

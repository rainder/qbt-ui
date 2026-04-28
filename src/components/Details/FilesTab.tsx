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
  if (q.isLoading) return <div className="text-muted">loading files...</div>;
  if (q.error) return <div className="text-danger">{(q.error as Error).message}</div>;
  return (
    <table className="w-full">
      <thead>
        <tr className="text-muted text-[11px] font-medium border-b border-border">
          <th className="text-left py-1">Name</th>
          <th className="text-right w-20">Size</th>
          <th className="w-28">Progress</th>
          <th className="text-right w-12">Prio</th>
        </tr>
      </thead>
      <tbody>
        {(q.data ?? []).map((f) => (
          <tr key={f.index} className="border-b border-border">
            <td className="py-0.5 truncate text-fg2">{f.name}</td>
            <td className="text-right">{formatBytes(f.size)}</td>
            <td><ProgressBar value={f.progress} complete={f.progress >= 1} /></td>
            <td className="text-right">{f.priority}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

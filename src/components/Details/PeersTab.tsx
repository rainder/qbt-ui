import { useQuery } from '@tanstack/react-query';
import { fetchPeers } from '@/api/torrents';
import { formatSpeed } from '@/lib/format';

export function PeersTab({ hash }: { hash: string }) {
  const q = useQuery({
    queryKey: ['peers', hash],
    queryFn: () => fetchPeers(hash),
    refetchInterval: 2000,
  });
  if (q.isLoading) return <div className="text-fg-muted text-sm">Loading peers…</div>;
  if (q.error) return <div className="text-danger-fg text-sm">{(q.error as Error).message}</div>;
  const peers = Object.values(q.data?.peers ?? {});
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-canvas-subtle border-b border-border-default text-fg-muted text-xs font-semibold uppercase tracking-wider">
          <th className="text-left py-2 px-3 w-44">IP</th>
          <th className="text-left px-3">Client</th>
          <th className="text-right w-20 px-3">↓</th>
          <th className="text-right w-20 px-3">↑</th>
          <th className="text-right w-16 px-3">Progress</th>
          <th className="text-left w-20 px-3">Flags</th>
        </tr>
      </thead>
      <tbody>
        {peers.map((p, i) => (
          <tr key={i} className="border-b border-border-muted hover:bg-canvas-subtle text-sm">
            <td className="py-2 px-3 text-fg-default tabular-nums">{p.ip}:{p.port}</td>
            <td className="px-3 truncate text-fg-default">{p.client}</td>
            <td className="text-right px-3 tabular-nums text-fg-default">{formatSpeed(p.dl_speed)}</td>
            <td className="text-right px-3 tabular-nums text-fg-default">{formatSpeed(p.up_speed)}</td>
            <td className="text-right px-3 tabular-nums text-fg-default">{(p.progress * 100).toFixed(0)}%</td>
            <td className="px-3 text-fg-muted">{p.flags}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

import { useQuery } from '@tanstack/react-query';
import { fetchPeers } from '@/api/torrents';
import { formatSpeed } from '@/lib/format';

export function PeersTab({ hash }: { hash: string }) {
  const q = useQuery({
    queryKey: ['peers', hash],
    queryFn: () => fetchPeers(hash),
    refetchInterval: 2000,
  });
  if (q.isLoading) return <div className="text-muted">loading peers...</div>;
  if (q.error) return <div className="text-danger">{(q.error as Error).message}</div>;
  const peers = Object.values(q.data?.peers ?? {});
  return (
    <table className="w-full">
      <thead>
        <tr className="text-muted text-[11px] font-medium border-b border-border">
          <th className="text-left py-1 w-44">IP</th>
          <th className="text-left">Client</th>
          <th className="text-right w-20">↓</th>
          <th className="text-right w-20">↑</th>
          <th className="text-right w-16">Progress</th>
          <th className="text-left w-20">Flags</th>
        </tr>
      </thead>
      <tbody>
        {peers.map((p, i) => (
          <tr key={i} className="border-b border-border">
            <td className="py-0.5 text-fg2 font-mono">{p.ip}:{p.port}</td>
            <td className="truncate">{p.client}</td>
            <td className="text-right">{formatSpeed(p.dl_speed)}</td>
            <td className="text-right">{formatSpeed(p.up_speed)}</td>
            <td className="text-right">{(p.progress * 100).toFixed(0)}%</td>
            <td>{p.flags}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

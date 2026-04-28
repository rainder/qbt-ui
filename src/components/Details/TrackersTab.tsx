import { useQuery } from '@tanstack/react-query';
import { fetchTrackers, reannounce } from '@/api/torrents';

const STATUS: Record<number, string> = {
  0: 'disabled', 1: 'not contacted', 2: 'working', 3: 'updating', 4: 'not working',
};

export function TrackersTab({ hash }: { hash: string }) {
  const q = useQuery({
    queryKey: ['trackers', hash],
    queryFn: () => fetchTrackers(hash),
    refetchInterval: 5000,
  });
  if (q.isLoading) return <div className="text-muted">loading trackers...</div>;
  if (q.error) return <div className="text-danger">{(q.error as Error).message}</div>;
  return (
    <div>
      <button onClick={() => reannounce([hash])} className="mb-2 border border-border2 text-fg hover:bg-bg3 px-3 py-1 rounded text-xs">
        reannounce
      </button>
      <table className="w-full">
        <thead>
          <tr className="text-muted text-[11px] font-medium border-b border-border">
            <th className="text-left py-1">URL</th>
            <th className="text-left w-28">Status</th>
            <th className="text-right w-16">Tier</th>
            <th className="text-right w-16">Peers</th>
            <th className="text-right w-16">Seeds</th>
            <th className="text-left">Message</th>
          </tr>
        </thead>
        <tbody>
          {(q.data ?? []).map((t, i) => (
            <tr key={i} className="border-b border-border">
              <td className="py-0.5 truncate text-fg2 max-w-md">{t.url}</td>
              <td>{STATUS[t.status] ?? t.status}</td>
              <td className="text-right">{t.tier}</td>
              <td className="text-right">{t.num_peers}</td>
              <td className="text-right">{t.num_seeds}</td>
              <td className="truncate text-muted">{t.msg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

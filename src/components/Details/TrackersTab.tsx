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
      <button onClick={() => reannounce([hash])} className="mb-2 px-2 py-0.5 text-xs border border-accent text-accent">
        reannounce
      </button>
      <table className="w-full">
        <thead>
          <tr className="text-muted uppercase tracking-wide text-[10px]">
            <th className="text-left py-1">url</th>
            <th className="text-left w-28">status</th>
            <th className="text-right w-16">tier</th>
            <th className="text-right w-16">peers</th>
            <th className="text-right w-16">seeds</th>
            <th className="text-left">message</th>
          </tr>
        </thead>
        <tbody>
          {(q.data ?? []).map((t, i) => (
            <tr key={i} className="border-b border-dotted border-border">
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

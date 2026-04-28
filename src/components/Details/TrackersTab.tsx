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
  if (q.isLoading) return <div className="text-fg-muted text-sm">Loading trackers…</div>;
  if (q.error) return <div className="text-danger-fg text-sm">{(q.error as Error).message}</div>;
  return (
    <div>
      <button
        onClick={() => reannounce([hash])}
        className="mb-3 bg-canvas-subtle hover:bg-border-default text-fg-default border border-border-default rounded-md px-3 py-[5px] text-sm font-medium"
      >
        Reannounce
      </button>
      <table className="w-full">
        <thead>
          <tr className="bg-canvas-subtle border-b border-border-default text-fg-muted text-xs font-semibold uppercase tracking-wider">
            <th className="text-left py-2 px-3">URL</th>
            <th className="text-left w-28 px-3">Status</th>
            <th className="text-right w-16 px-3">Tier</th>
            <th className="text-right w-16 px-3">Peers</th>
            <th className="text-right w-16 px-3">Seeds</th>
            <th className="text-left px-3">Message</th>
          </tr>
        </thead>
        <tbody>
          {(q.data ?? []).map((t, i) => (
            <tr key={i} className="border-b border-border-muted hover:bg-canvas-subtle text-sm">
              <td className="py-2 px-3 truncate text-fg-default max-w-md">{t.url}</td>
              <td className="px-3 text-fg-default">{STATUS[t.status] ?? t.status}</td>
              <td className="text-right px-3 tabular-nums text-fg-default">{t.tier}</td>
              <td className="text-right px-3 tabular-nums text-fg-default">{t.num_peers}</td>
              <td className="text-right px-3 tabular-nums text-fg-default">{t.num_seeds}</td>
              <td className="px-3 truncate text-fg-muted">{t.msg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import type { Torrent } from '@/api/types';
import { formatBytes, formatRatio, formatEta, formatSpeed } from '@/lib/format';

export function GeneralTab({ t }: { t: Partial<Torrent> }) {
  const rows: [string, string][] = [
    ['hash', t.hash ?? ''],
    ['name', t.name ?? ''],
    ['state', t.state ?? ''],
    ['size', formatBytes(t.size ?? 0)],
    ['progress', `${((t.progress ?? 0) * 100).toFixed(1)}%`],
    ['downloaded', formatBytes(t.downloaded ?? 0)],
    ['uploaded', formatBytes(t.uploaded ?? 0)],
    ['ratio', formatRatio(t.ratio ?? 0)],
    ['↓ speed', formatSpeed(t.dlspeed ?? 0)],
    ['↑ speed', formatSpeed(t.upspeed ?? 0)],
    ['eta', formatEta(t.eta ?? -1)],
    ['save path', t.save_path ?? ''],
    ['category', t.category ?? ''],
    ['tags', t.tags ?? ''],
    ['added', t.added_on ? new Date(t.added_on * 1000).toISOString() : ''],
  ];
  return (
    <table className="w-full">
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k} className="border-b border-dotted border-border">
            <td className="text-muted py-0.5 pr-3 w-32">{k}</td>
            <td className="text-fg2 break-all">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchFiles, setFilePriority, FilePriority, type FilePriorityValue } from '@/api/torrents';
import { formatBytes } from '@/lib/format';
import { ProgressBar } from '@/components/List/ProgressBar';
import { Select } from '@/components/ui/Select';

const PRIORITY_OPTIONS: { value: FilePriorityValue; label: string }[] = [
  { value: FilePriority.Skip,    label: 'Skip' },
  { value: FilePriority.Normal,  label: 'Normal' },
  { value: FilePriority.High,    label: 'High' },
  { value: FilePriority.Maximum, label: 'Max' },
];

const KNOWN_PRIORITIES = new Set<number>(PRIORITY_OPTIONS.map((p) => p.value));

export function FilesTab({ hash }: { hash: string }) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['files', hash],
    queryFn: () => fetchFiles(hash),
    refetchInterval: 3000,
  });

  async function changePriority(fileIndex: number, priority: FilePriorityValue) {
    await setFilePriority(hash, [fileIndex], priority);
    qc.invalidateQueries({ queryKey: ['files', hash] });
  }

  if (q.isLoading) return <div className="text-fg-muted text-sm">Loading files…</div>;
  if (q.error) return <div className="text-danger-fg text-sm">{(q.error as Error).message}</div>;

  return (
    <table className="w-full">
      <thead>
        <tr className="bg-canvas-subtle border-b border-border-default text-fg-muted text-xs font-semibold uppercase tracking-wider">
          <th className="text-left py-2 px-3">Name</th>
          <th className="text-right w-20 px-3">Size</th>
          <th className="w-28 px-3">Progress</th>
          <th className="w-24 px-3">Priority</th>
        </tr>
      </thead>
      <tbody>
        {(q.data ?? []).map((f) => {
          const value: FilePriorityValue = KNOWN_PRIORITIES.has(f.priority)
            ? (f.priority as FilePriorityValue)
            : FilePriority.Normal;
          return (
            <tr key={f.index} className="border-b border-border-muted hover:bg-canvas-subtle text-sm">
              <td className="py-2 px-3 truncate text-fg-default">{f.name}</td>
              <td className="text-right px-3 tabular-nums text-fg-default whitespace-nowrap">{formatBytes(f.size)}</td>
              <td className="px-3"><ProgressBar value={f.progress} complete={f.progress >= 1} /></td>
              <td className="px-3">
                <Select
                  density="sm"
                  value={value}
                  onChange={(e) => {
                    const next = Number(e.target.value) as FilePriorityValue;
                    void changePriority(f.index, next);
                  }}
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Select>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

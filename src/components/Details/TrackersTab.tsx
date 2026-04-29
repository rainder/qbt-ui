import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchTrackers, reannounce, addTrackers, removeTrackers, editTracker } from '@/api/torrents';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const STATUS: Record<number, string> = {
  0: 'disabled', 1: 'not contacted', 2: 'working', 3: 'updating', 4: 'not working',
};

export function TrackersTab({ hash }: { hash: string }) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['trackers', hash],
    queryFn: () => fetchTrackers(hash),
    refetchInterval: 5000,
  });

  const [addUrl, setAddUrl] = useState('');
  // editingUrl: the original URL of the row being edited (null = none)
  const [editingUrl, setEditingUrl] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  function startEdit(url: string) {
    setEditingUrl(url);
    setEditingValue(url);
  }

  function cancelEdit() {
    setEditingUrl(null);
    setEditingValue('');
  }

  async function confirmEdit() {
    if (editingUrl === null) return;
    if (editingValue.trim() !== '' && editingValue !== editingUrl) {
      await editTracker(hash, editingUrl, editingValue);
      qc.invalidateQueries({ queryKey: ['trackers', hash] });
    }
    cancelEdit();
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const url = addUrl.trim();
    if (!url) return;
    await addTrackers(hash, [url]);
    setAddUrl('');
    qc.invalidateQueries({ queryKey: ['trackers', hash] });
  }

  async function handleRemove(url: string) {
    if (!confirm('Remove tracker?')) return;
    await removeTrackers(hash, [url]);
    qc.invalidateQueries({ queryKey: ['trackers', hash] });
  }

  if (q.isLoading) return <div className="text-fg-muted text-sm">Loading trackers…</div>;
  if (q.error) return <div className="text-danger-fg text-sm">{(q.error as Error).message}</div>;

  return (
    <div>
      {/* Add tracker form */}
      <form onSubmit={(e) => void handleAdd(e)} className="flex gap-2 mb-3">
        <Input
          density="sm"
          className="flex-1"
          placeholder="Add tracker URL…"
          value={addUrl}
          onChange={(e) => setAddUrl(e.target.value)}
        />
        <Button type="submit" variant="primary" density="sm">Add</Button>
      </form>

      <Button
        variant="default"
        density="sm"
        className="mb-3"
        onClick={() => reannounce([hash])}
      >
        Reannounce
      </Button>

      <table className="w-full">
        <thead>
          <tr className="bg-canvas-subtle border-b border-border-default text-fg-muted text-xs font-semibold uppercase tracking-wider">
            <th className="text-left py-2 px-3">URL</th>
            <th className="text-left w-28 px-3">Status</th>
            <th className="text-right w-16 px-3">Tier</th>
            <th className="text-right w-16 px-3">Peers</th>
            <th className="text-right w-16 px-3">Seeds</th>
            <th className="text-left px-3">Message</th>
            <th className="w-28 px-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(q.data ?? []).map((t, i) => {
            const isEditing = editingUrl === t.url;
            const isBuiltIn = t.tier === -1;
            return (
              <tr key={i} className="border-b border-border-muted hover:bg-canvas-subtle text-sm">
                <td className="py-2 px-3 truncate text-fg-default max-w-md">
                  {isEditing ? (
                    <Input
                      density="sm"
                      fullWidth
                      autoFocus
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); void confirmEdit(); }
                        if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
                      }}
                      onBlur={() => cancelEdit()}
                    />
                  ) : (
                    t.url
                  )}
                </td>
                <td className="px-3 text-fg-default">{STATUS[t.status] ?? t.status}</td>
                <td className="text-right px-3 tabular-nums text-fg-default">{t.tier}</td>
                <td className="text-right px-3 tabular-nums text-fg-default">{t.num_peers}</td>
                <td className="text-right px-3 tabular-nums text-fg-default">{t.num_seeds}</td>
                <td className="px-3 truncate text-fg-muted">{t.msg}</td>
                <td className="px-3">
                  {!isBuiltIn && !isEditing && (
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="default"
                        density="sm"
                        onClick={() => startEdit(t.url)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        density="sm"
                        onClick={() => void handleRemove(t.url)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

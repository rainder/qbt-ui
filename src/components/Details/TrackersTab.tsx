import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchTrackers, reannounce, addTrackers, removeTrackers, editTracker } from '@/api/torrents';

const STATUS: Record<number, string> = {
  0: 'disabled', 1: 'not contacted', 2: 'working', 3: 'updating', 4: 'not working',
};

const inputCls =
  'bg-canvas-inset border border-border-default rounded-md px-2 py-0.5 text-sm focus-accent w-full outline-none';

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
        <input
          className={`${inputCls} flex-1`}
          placeholder="Add tracker URL…"
          value={addUrl}
          onChange={(e) => setAddUrl(e.target.value)}
        />
        <button
          type="submit"
          className="bg-success-emphasis hover:bg-success-emphasis-h text-fg-on-emphasis border border-subtle rounded-md px-3 py-1 text-xs font-medium"
        >
          Add
        </button>
      </form>

      <button
        onClick={() => reannounce([hash])}
        className="mb-3 bg-canvas-subtle hover:bg-border-default text-fg-default border border-border-default rounded-md px-3 py-1 text-xs font-medium"
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
                    <input
                      className={inputCls}
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
                      <button
                        className="bg-canvas-subtle hover:bg-border-default text-fg-default border border-border-default rounded-md px-2 py-0.5 text-xs font-medium"
                        onClick={() => startEdit(t.url)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-canvas-subtle hover:bg-danger-emphasis hover:text-fg-on-emphasis text-danger-fg border border-border-default hover:border-danger-emphasis rounded-md px-2 py-0.5 text-xs font-medium"
                        onClick={() => void handleRemove(t.url)}
                      >
                        Remove
                      </button>
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

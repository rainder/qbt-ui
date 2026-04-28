import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPlugins, installPlugin, uninstallPlugin, enablePlugin, updatePlugins } from '@/api/search';

export function PluginsTab() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['plugins'], queryFn: fetchPlugins });
  const [source, setSource] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const install = useMutation({
    mutationFn: () => installPlugin(source),
    onSuccess: async () => { setSource(''); await qc.invalidateQueries({ queryKey: ['plugins'] }); },
    onError: (e) => setErr(e instanceof Error ? e.message : String(e)),
  });
  const update = useMutation({
    mutationFn: () => updatePlugins(),
    onSuccess: async () => qc.invalidateQueries({ queryKey: ['plugins'] }),
  });

  async function toggle(name: string, enable: boolean) {
    await enablePlugin([name], enable);
    qc.invalidateQueries({ queryKey: ['plugins'] });
  }
  async function uninstall(name: string) {
    if (!confirm(`Uninstall ${name}?`)) return;
    await uninstallPlugin([name]);
    qc.invalidateQueries({ queryKey: ['plugins'] });
  }

  if (q.isLoading) return <div className="text-fg-muted text-sm">Loading plugins…</div>;
  if (q.error) return <div className="text-danger-fg text-sm">{(q.error as Error).message}</div>;

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Install row */}
      <div className="flex gap-2 items-center">
        <input
          placeholder="Install URL or local path (.py / .zip)"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="flex-1 bg-canvas-inset border border-border-default rounded-md px-3 py-[5px] text-sm text-fg-default focus-accent"
        />
        <button
          disabled={!source.trim() || install.isPending}
          onClick={() => install.mutate()}
          className="bg-success-emphasis hover:bg-success-emphasis-h text-fg-on-emphasis border border-subtle rounded-md px-3 py-[5px] text-sm font-medium disabled:opacity-50"
        >
          Install
        </button>
        <button
          onClick={() => update.mutate()}
          disabled={update.isPending}
          className="bg-canvas-subtle hover:bg-border-default text-fg-default border border-border-default rounded-md px-3 py-[5px] text-sm font-medium disabled:opacity-50"
        >
          Update all
        </button>
      </div>
      {err && <div className="text-danger-fg text-sm">{err}</div>}

      {/* Plugin table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-canvas-subtle border-b border-border-default text-fg-muted text-xs font-semibold uppercase tracking-wider">
            <th className="text-left py-2 px-3">Name</th>
            <th className="text-left px-3">Version</th>
            <th className="text-left px-3">URL</th>
            <th className="text-center w-16 px-3">Enabled</th>
            <th className="text-right w-24 px-3" />
          </tr>
        </thead>
        <tbody>
          {(q.data ?? []).map((p) => (
            <tr key={p.name} className="border-b border-border-muted hover:bg-canvas-subtle">
              <td className="py-2 px-3 font-medium text-fg-default">{p.fullName}</td>
              <td className="px-3 text-fg-muted text-xs">{p.version}</td>
              <td className="px-3 truncate text-fg-muted max-w-xs">{p.url}</td>
              <td className="text-center px-3">
                <input
                  type="checkbox"
                  checked={p.enabled}
                  onChange={(e) => toggle(p.name, e.target.checked)}
                />
              </td>
              <td className="text-right px-3">
                <button
                  onClick={() => uninstall(p.name)}
                  className="bg-canvas-subtle hover:bg-danger-emphasis hover:text-fg-on-emphasis text-danger-fg border border-border-default hover:border-danger-emphasis rounded-md px-2 py-1 text-xs font-medium"
                >
                  Uninstall
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

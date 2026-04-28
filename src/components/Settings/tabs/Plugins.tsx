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

  if (q.isLoading) return <div className="text-muted">loading plugins...</div>;
  if (q.error) return <div className="text-danger">{(q.error as Error).message}</div>;

  return (
    <div className="space-y-4 text-xs max-w-3xl">
      <div className="flex gap-2 items-center">
        <input
          placeholder="install URL or local path (.py / .zip)"
          value={source} onChange={(e) => setSource(e.target.value)}
          className="flex-1 border border-border bg-bg px-2 py-1 text-fg2"
        />
        <button disabled={!source.trim() || install.isPending}
                onClick={() => install.mutate()}
                className="px-3 py-1 border border-accent text-accent disabled:opacity-50">install</button>
        <button onClick={() => update.mutate()} disabled={update.isPending}
                className="px-3 py-1 border border-border disabled:opacity-50">update all</button>
      </div>
      {err && <div className="text-danger">{err}</div>}

      <table className="w-full">
        <thead>
          <tr className="text-muted uppercase tracking-wide text-[10px]">
            <th className="text-left py-1">name</th>
            <th className="text-left">version</th>
            <th className="text-left">url</th>
            <th className="text-center w-16">enabled</th>
            <th className="text-right w-24"></th>
          </tr>
        </thead>
        <tbody>
          {(q.data ?? []).map((p) => (
            <tr key={p.name} className="border-b border-dotted border-border">
              <td className="py-0.5 text-fg2">{p.fullName}</td>
              <td>{p.version}</td>
              <td className="truncate text-muted max-w-xs">{p.url}</td>
              <td className="text-center">
                <input type="checkbox" checked={p.enabled}
                       onChange={(e) => toggle(p.name, e.target.checked)} />
              </td>
              <td className="text-right">
                <button onClick={() => uninstall(p.name)}
                        className="px-2 border border-danger text-danger">uninstall</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

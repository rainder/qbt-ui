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
          className="flex-1 bg-bg3 border border-border2 rounded px-3 py-1.5 text-fg2 focus:outline-none focus:border-accent"
        />
        <button disabled={!source.trim() || install.isPending}
                onClick={() => install.mutate()}
                className="bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded font-medium disabled:opacity-50">install</button>
        <button onClick={() => update.mutate()} disabled={update.isPending}
                className="border border-border2 text-fg hover:bg-bg2 px-3 py-1.5 rounded disabled:opacity-50">update all</button>
      </div>
      {err && <div className="text-danger">{err}</div>}

      <table className="w-full">
        <thead>
          <tr className="text-muted text-[11px] font-medium border-b border-border">
            <th className="text-left py-1">Name</th>
            <th className="text-left">Version</th>
            <th className="text-left">URL</th>
            <th className="text-center w-16">Enabled</th>
            <th className="text-right w-24"></th>
          </tr>
        </thead>
        <tbody>
          {(q.data ?? []).map((p) => (
            <tr key={p.name} className="border-b border-border">
              <td className="py-0.5 text-fg2">{p.fullName}</td>
              <td>{p.version}</td>
              <td className="truncate text-muted max-w-xs">{p.url}</td>
              <td className="text-center">
                <input type="checkbox" checked={p.enabled}
                       onChange={(e) => toggle(p.name, e.target.checked)} />
              </td>
              <td className="text-right">
                <button onClick={() => uninstall(p.name)}
                        className="bg-danger-bg text-danger hover:bg-danger hover:text-white border border-danger-soft px-3 py-1 rounded text-xs">uninstall</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

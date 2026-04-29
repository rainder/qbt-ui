import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPlugins, installPlugin, uninstallPlugin, enablePlugin, updatePlugins } from '@/api/search';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
        <Input
          placeholder="Install URL or local path (.py / .zip)"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="flex-1"
        />
        <Button
          density="sm"
          variant="primary"
          disabled={!source.trim() || install.isPending}
          onClick={() => install.mutate()}
        >
          Install
        </Button>
        <Button
          density="sm"
          variant="default"
          onClick={() => update.mutate()}
          disabled={update.isPending}
        >
          Update all
        </Button>
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
                <Button
                  density="sm"
                  variant="danger"
                  onClick={() => uninstall(p.name)}
                >
                  Uninstall
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

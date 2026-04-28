import { useEffect, useState } from 'react';
import { fetchPrefs, setPrefs } from '@/api/prefs';
import type { Preferences } from '@/api/types';

export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'bool';
  unit?: string;
  divisor?: number;        // for kilobytes/sec etc.
}

export function PrefsTab({ fields }: { fields: FieldDef[] }) {
  const [prefs, setLocal] = useState<Preferences | null>(null);
  const [dirty, setDirty] = useState<Preferences>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { fetchPrefs().then(setLocal).catch((e) => setErr(e.message)); }, []);
  if (!prefs) return <div className="text-muted">loading…</div>;

  function update(k: string, v: unknown) { setDirty((d) => ({ ...d, [k]: v })); }
  function get(k: string): unknown { return k in dirty ? dirty[k] : prefs![k]; }

  async function save() {
    setBusy(true); setErr(null);
    try {
      await setPrefs(dirty);
      setLocal({ ...prefs, ...dirty });
      setDirty({});
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-3 text-xs max-w-xl">
      {fields.map((f) => {
        const v = get(f.key);
        if (f.type === 'bool') {
          return (
            <label key={f.key} className="flex items-center gap-2 text-muted">
              <input type="checkbox" checked={!!v}
                     onChange={(e) => update(f.key, e.target.checked)} />
              <span>{f.label}</span>
            </label>
          );
        }
        const display = f.divisor && typeof v === 'number' ? v / f.divisor : v;
        return (
          <label key={f.key} className="flex items-center gap-3">
            <span className="w-56 text-muted">{f.label}</span>
            <input
              type={f.type === 'number' ? 'number' : 'text'}
              value={String(display ?? '')}
              onChange={(e) => {
                let next: unknown = e.target.value;
                if (f.type === 'number') {
                  const n = Number(e.target.value);
                  next = f.divisor ? n * f.divisor : n;
                }
                update(f.key, next);
              }}
              className="bg-bg3 border border-border2 rounded px-3 py-1.5 text-fg2 focus:outline-none focus:border-accent w-48"
            />
            {f.unit && <span className="text-muted">{f.unit}</span>}
          </label>
        );
      })}
      {err && <div className="text-danger">{err}</div>}
      <div className="flex gap-2 pt-2">
        <button onClick={save} disabled={busy || Object.keys(dirty).length === 0}
                className="bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded font-medium disabled:opacity-50">
          {busy ? '...' : 'save'}
        </button>
        <button onClick={() => setDirty({})} disabled={Object.keys(dirty).length === 0}
                className="border border-border2 text-fg hover:bg-bg2 px-3 py-1.5 rounded disabled:opacity-50">revert</button>
      </div>
    </div>
  );
}

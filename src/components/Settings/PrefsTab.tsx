import { useEffect, useState } from 'react';
import { fetchPrefs, setPrefs } from '@/api/prefs';
import type { Preferences } from '@/api/types';

export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'bool';
  unit?: string;
  divisor?: number;
}

const inputCls =
  'bg-canvas-inset border border-border-default rounded-md px-3 py-[5px] text-sm text-fg-default focus-accent w-48';

export function PrefsTab({ fields }: { fields: FieldDef[] }) {
  const [prefs, setLocal] = useState<Preferences | null>(null);
  const [dirty, setDirty] = useState<Preferences>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { fetchPrefs().then(setLocal).catch((e) => setErr(e.message)); }, []);
  if (err && !prefs) {
    return (
      <div className="border border-danger-muted bg-danger-subtle rounded-md p-3 text-sm text-danger-fg">
        Failed to load preferences: {err}
      </div>
    );
  }
  if (!prefs) return <div className="text-fg-muted text-sm">Loading…</div>;

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
    <div className="space-y-4 max-w-xl">
      {fields.map((f) => {
        const v = get(f.key);
        if (f.type === 'bool') {
          return (
            <label key={f.key} className="flex items-center gap-2 text-fg-default text-sm">
              <input
                type="checkbox"
                checked={!!v}
                onChange={(e) => update(f.key, e.target.checked)}
              />
              <span>{f.label}</span>
            </label>
          );
        }
        const display = f.divisor && typeof v === 'number' ? v / f.divisor : v;
        return (
          <div key={f.key} className="flex items-center gap-4">
            <label className="w-64 text-sm font-medium text-fg-default">{f.label}</label>
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
              className={inputCls}
            />
            {f.unit && <span className="text-fg-muted text-sm">{f.unit}</span>}
          </div>
        );
      })}
      {err && <div className="text-danger-fg text-sm">{err}</div>}
      <div className="flex gap-2 pt-4 border-t border-border-default">
        <button
          onClick={save}
          disabled={busy || Object.keys(dirty).length === 0}
          className="bg-success-emphasis hover:bg-success-emphasis-h text-fg-on-emphasis border border-subtle rounded-md px-3 py-[5px] text-sm font-medium disabled:opacity-50"
        >
          {busy ? '…' : 'Save'}
        </button>
        <button
          onClick={() => setDirty({})}
          disabled={Object.keys(dirty).length === 0}
          className="bg-canvas-subtle hover:bg-border-default text-fg-default border border-border-default rounded-md px-3 py-[5px] text-sm font-medium disabled:opacity-50"
        >
          Revert
        </button>
      </div>
    </div>
  );
}

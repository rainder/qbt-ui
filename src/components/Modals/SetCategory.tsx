import { useState } from 'react';
import { Modal, useCloseModal } from './Modal';
import { setCategory } from '@/api/torrents';
import { useSelection } from '@/stores/selection';

export function SetCategory({ categories }: { categories: string[] }) {
  const close = useCloseModal();
  const hashes = useSelection((s) => s.hashes());
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      await setCategory(hashes, value);
      close();
    } finally { setBusy(false); }
  }

  return (
    <Modal title="set category" onClose={close}>
      <div className="space-y-3 text-xs w-72">
        <label className="block text-muted">CATEGORY
          <input list="cats" value={value} onChange={(e) => setValue(e.target.value)} autoFocus
                 className="mt-1 block w-full border border-border bg-bg px-2 py-1 text-fg2" />
          <datalist id="cats">
            {categories.map((c) => <option key={c} value={c} />)}
          </datalist>
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={close} className="px-3 py-1 border border-border">cancel</button>
          <button onClick={submit} disabled={busy}
                  className="px-3 py-1 border border-accent text-accent disabled:opacity-50">apply</button>
        </div>
      </div>
    </Modal>
  );
}

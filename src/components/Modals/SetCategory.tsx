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
        <label className="block text-muted text-[10px] font-medium uppercase">Category
          <input list="cats" value={value} onChange={(e) => setValue(e.target.value)} autoFocus
                 className="mt-1 block w-full bg-bg3 border border-border2 rounded px-3 py-1.5 text-fg2 focus:outline-none focus:border-accent" />
          <datalist id="cats">
            {categories.map((c) => <option key={c} value={c} />)}
          </datalist>
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={close} className="border border-border2 text-fg hover:bg-bg2 px-3 py-1.5 rounded">cancel</button>
          <button onClick={submit} disabled={busy}
                  className="bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded font-medium disabled:opacity-50">apply</button>
        </div>
      </div>
    </Modal>
  );
}

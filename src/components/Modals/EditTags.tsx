import { useState } from 'react';
import { Modal, useCloseModal } from './Modal';
import { addTags, removeTags } from '@/api/torrents';
import { useSelection } from '@/stores/selection';

export function EditTags({ allTags }: { allTags: string[] }) {
  const close = useCloseModal();
  const hashes = useSelection((s) => s.hashes());
  const [add, setAdd] = useState('');
  const [rm, setRm] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const adds = add.split(',').map((s) => s.trim()).filter(Boolean);
      const rms = rm.split(',').map((s) => s.trim()).filter(Boolean);
      if (adds.length) await addTags(hashes, adds);
      if (rms.length) await removeTags(hashes, rms);
      close();
    } finally { setBusy(false); }
  }

  return (
    <Modal title="edit tags" onClose={close}>
      <div className="space-y-3 text-xs w-80">
        <label className="block text-muted text-[10px] font-medium uppercase">Add (comma)
          <input value={add} onChange={(e) => setAdd(e.target.value)} list="tags-add"
                 className="mt-1 block w-full bg-bg3 border border-border2 rounded px-3 py-1.5 text-fg2 focus:outline-none focus:border-accent" />
          <datalist id="tags-add">
            {allTags.map((t) => <option key={t} value={t} />)}
          </datalist>
        </label>
        <label className="block text-muted text-[10px] font-medium uppercase">Remove (comma)
          <input value={rm} onChange={(e) => setRm(e.target.value)}
                 className="mt-1 block w-full bg-bg3 border border-border2 rounded px-3 py-1.5 text-fg2 focus:outline-none focus:border-accent" />
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

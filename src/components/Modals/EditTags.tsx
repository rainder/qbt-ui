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
        <label className="block text-muted">ADD (comma)
          <input value={add} onChange={(e) => setAdd(e.target.value)} list="tags-add"
                 className="mt-1 block w-full border border-border bg-bg px-2 py-1 text-fg2" />
          <datalist id="tags-add">
            {allTags.map((t) => <option key={t} value={t} />)}
          </datalist>
        </label>
        <label className="block text-muted">REMOVE (comma)
          <input value={rm} onChange={(e) => setRm(e.target.value)}
                 className="mt-1 block w-full border border-border bg-bg px-2 py-1 text-fg2" />
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

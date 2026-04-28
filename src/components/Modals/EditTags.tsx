import { useState } from 'react';
import { Modal, useCloseModal } from './Modal';
import { addTags, removeTags } from '@/api/torrents';
import { useSelection } from '@/stores/selection';

const inputCls =
  'block w-full bg-canvas-inset border border-border-default rounded-md px-3 py-[5px] text-sm text-fg-default focus-accent';

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
    <Modal title="Edit tags" onClose={close}>
      <div className="space-y-4 w-80">
        <div>
          <label className="block text-sm font-medium text-fg-default mb-1">
            Add <span className="text-fg-muted font-normal">(comma separated)</span>
          </label>
          <input
            value={add}
            onChange={(e) => setAdd(e.target.value)}
            list="tags-add"
            className={inputCls}
          />
          <datalist id="tags-add">
            {allTags.map((t) => <option key={t} value={t} />)}
          </datalist>
        </div>
        <div>
          <label className="block text-sm font-medium text-fg-default mb-1">
            Remove <span className="text-fg-muted font-normal">(comma separated)</span>
          </label>
          <input
            value={rm}
            onChange={(e) => setRm(e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={close}
            className="bg-canvas-subtle hover:bg-border-default text-fg-default border border-border-default rounded-md px-3 py-[5px] text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="bg-success-emphasis hover:bg-success-emphasis-h text-fg-on-emphasis border border-subtle rounded-md px-3 py-[5px] text-sm font-medium disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </div>
    </Modal>
  );
}

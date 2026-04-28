import { useState } from 'react';
import { Modal, useCloseModal } from './Modal';
import { setCategory } from '@/api/torrents';
import { useSelection } from '@/stores/selection';

const inputCls =
  'block w-full bg-canvas-inset border border-border-default rounded-md px-3 py-[5px] text-sm text-fg-default focus-accent';

export function SetCategory({ categories }: { categories: string[] }) {
  const close = useCloseModal();
  const selected = useSelection((s) => s.selected);
  const hashes = Array.from(selected);
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
    <Modal title="Set category" onClose={close}>
      <div className="space-y-4 w-72">
        <div>
          <label className="block text-sm font-medium text-fg-default mb-1">Category</label>
          <input
            list="cats"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            className={inputCls}
          />
          <datalist id="cats">
            {categories.map((c) => <option key={c} value={c} />)}
          </datalist>
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

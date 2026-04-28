import { useState } from 'react';
import { Modal, useCloseModal } from './Modal';
import { setLocation } from '@/api/torrents';
import { useSelection } from '@/stores/selection';

const inputCls =
  'block w-full bg-canvas-inset border border-border-default rounded-md px-3 py-[5px] text-sm text-fg-default focus-accent';

export function MoveLocation({ savePath }: {
  /** Shared save path across selection. `undefined` means selection has mixed paths. */
  savePath?: string;
}) {
  const close = useCloseModal();
  const selected = useSelection((s) => s.selected);
  const hashes = Array.from(selected);
  const [value, setValue] = useState(savePath ?? '');
  const [busy, setBusy] = useState(false);

  const mixed = savePath === undefined && hashes.length > 1;

  async function submit() {
    setBusy(true);
    try {
      await setLocation(hashes, value);
      close();
    } finally { setBusy(false); }
  }

  return (
    <Modal title="Move…" onClose={close}>
      <div className="space-y-4 w-96">
        <div>
          <label className="block text-sm font-medium text-fg-default mb-1">Save path</label>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={mixed ? '' : ''}
            autoFocus
            className={inputCls}
          />
          {mixed && (
            <p className="mt-1 text-xs text-fg-muted">
              Selection has multiple save paths — applying will move all of them.
            </p>
          )}
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

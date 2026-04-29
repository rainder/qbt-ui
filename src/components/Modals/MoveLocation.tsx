import { useState } from 'react';
import { Modal, useCloseModal } from './Modal';
import { setLocation } from '@/api/torrents';
import { useSelection } from '@/stores/selection';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
          <Input
            fullWidth
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
          {mixed && (
            <p className="mt-1 text-xs text-fg-muted">
              Selection has multiple save paths — applying will move all of them.
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="default" onClick={close}>Cancel</Button>
          <Button variant="primary" disabled={busy} onClick={submit}>Apply</Button>
        </div>
      </div>
    </Modal>
  );
}

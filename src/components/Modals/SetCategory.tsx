import { useState } from 'react';
import { Modal, useCloseModal } from './Modal';
import { setCategory } from '@/api/torrents';
import { useSelection } from '@/stores/selection';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function SetCategory({ categories, currentCategory }: {
  categories: string[];
  /** Shared category across selection. `undefined` means selection has mixed categories. */
  currentCategory?: string;
}) {
  const close = useCloseModal();
  const selected = useSelection((s) => s.selected);
  const hashes = Array.from(selected);
  const [value, setValue] = useState(currentCategory ?? '');
  const [busy, setBusy] = useState(false);

  const mixed = currentCategory === undefined && hashes.length > 1;

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
          <Input
            list="cats"
            fullWidth
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={mixed ? '— mixed —' : 'No category'}
            autoFocus
          />
          <datalist id="cats">
            {categories.map((c) => <option key={c} value={c} />)}
          </datalist>
          {mixed && (
            <p className="mt-1 text-xs text-fg-muted">
              Selection has mixed categories — applying will overwrite all of them.
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

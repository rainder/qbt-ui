import { useState } from 'react';
import { Modal, useCloseModal } from './Modal';
import { addTags, removeTags } from '@/api/torrents';
import { useSelection } from '@/stores/selection';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function EditTags({ allTags }: { allTags: string[] }) {
  const close = useCloseModal();
  const selected = useSelection((s) => s.selected);
  const hashes = Array.from(selected);
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
          <Input
            fullWidth
            value={add}
            onChange={(e) => setAdd(e.target.value)}
            list="tags-add"
          />
          <datalist id="tags-add">
            {allTags.map((t) => <option key={t} value={t} />)}
          </datalist>
        </div>
        <div>
          <label className="block text-sm font-medium text-fg-default mb-1">
            Remove <span className="text-fg-muted font-normal">(comma separated)</span>
          </label>
          <Input
            fullWidth
            value={rm}
            onChange={(e) => setRm(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="default" onClick={close}>Cancel</Button>
          <Button variant="primary" disabled={busy} onClick={submit}>Apply</Button>
        </div>
      </div>
    </Modal>
  );
}

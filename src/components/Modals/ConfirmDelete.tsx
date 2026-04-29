import { useState } from 'react';
import { Modal, useCloseModal } from './Modal';
import { remove } from '@/api/torrents';
import { useSelection } from '@/stores/selection';
import { Button } from '@/components/ui/Button';

export function ConfirmDelete() {
  const close = useCloseModal();
  const selected = useSelection((s) => s.selected);
  const clear = useSelection((s) => s.clear);
  const hashes = Array.from(selected);
  const [files, setFiles] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      await remove(hashes, files);
      clear();
      close();
    } finally { setBusy(false); }
  }

  return (
    <Modal title={`Delete ${hashes.length} torrent(s)`} onClose={close}>
      <div className="space-y-4 w-80">
        <p className="text-fg-default text-sm">
          This action <span className="font-semibold">cannot be undone</span>.
        </p>
        <label className="flex items-center gap-2 text-fg-default text-sm">
          <input
            type="checkbox"
            checked={files}
            onChange={(e) => setFiles(e.target.checked)}
          />
          Also delete files on disk
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="default" onClick={close}>Cancel</Button>
          <Button variant="danger" disabled={busy} onClick={submit}>
            {busy ? '…' : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

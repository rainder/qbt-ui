import { useState } from 'react';
import { Modal, useCloseModal } from './Modal';
import { remove } from '@/api/torrents';
import { useSelection } from '@/stores/selection';

export function ConfirmDelete() {
  const close = useCloseModal();
  const hashes = useSelection((s) => s.hashes());
  const clear = useSelection((s) => s.clear);
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
    <Modal title={`delete ${hashes.length} torrent(s)`} onClose={close}>
      <div className="space-y-3 text-xs w-80">
        <p>this action cannot be undone.</p>
        <label className="flex items-center gap-2 text-danger">
          <input type="checkbox" checked={files} onChange={(e) => setFiles(e.target.checked)} />
          also delete files on disk
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={close} className="px-3 py-1 border border-border">cancel</button>
          <button onClick={submit} disabled={busy}
                  className="px-3 py-1 border border-danger text-danger disabled:opacity-50">
            {busy ? '...' : 'delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

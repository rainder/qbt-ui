import { useState } from 'react';
import { Modal, useCloseModal } from './Modal';
import { addTorrent } from '@/api/torrents';
import { Select } from '@/components/ui/Select';

const inputCls =
  'block w-full bg-canvas-inset border border-border-default rounded-md px-3 py-[5px] text-sm text-fg-default focus-accent';

export function AddTorrent({ initialUrl = '', initialFiles, categories, onClose }: {
  initialUrl?: string;
  initialFiles?: File[];
  categories: string[];
  onClose?: () => void;
}) {
  const closeModal = useCloseModal();
  function close() {
    onClose?.();
    closeModal();
  }
  const [urls, setUrls] = useState(initialUrl);
  const [files, setFiles] = useState<File[]>(initialFiles ?? []);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [paused, setPaused] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await addTorrent({
        urls: urls.trim() || undefined,
        files: files.length ? files : undefined,
        category: category || undefined,
        tags: tags || undefined,
        paused,
      });
      close();
    } catch (x) {
      setErr(x instanceof Error ? x.message : String(x));
    } finally { setBusy(false); }
  }

  return (
    <Modal title="Add torrent" onClose={close}>
      <form onSubmit={submit} className="space-y-4 w-[28rem]">
        <div>
          <label className="block text-sm font-medium text-fg-default mb-1">
            URLs / Magnets <span className="text-fg-muted font-normal">(one per line)</span>
          </label>
          <textarea
            className={`${inputCls} h-24`}
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="magnet:?xt=urn:btih:..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-fg-default mb-1">Files</label>
          <input
            type="file"
            multiple
            accept=".torrent"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="block w-full text-sm text-fg-default"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-fg-default mb-1">Category</label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full"
            >
              <option value="">(none)</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-fg-default mb-1">Tags (comma)</label>
            <input
              className={inputCls}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-fg-default text-sm">
          <input
            type="checkbox"
            checked={paused}
            onChange={(e) => setPaused(e.target.checked)}
          />
          Start paused
        </label>

        {err && <div className="text-danger-fg text-sm">{err}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={close}
            className="bg-canvas-subtle hover:bg-border-default text-fg-default border border-border-default rounded-md px-3 py-[5px] text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="bg-success-emphasis hover:bg-success-emphasis-h text-fg-on-emphasis border border-subtle rounded-md px-3 py-[5px] text-sm font-medium disabled:opacity-50"
          >
            {busy ? '…' : 'Add'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

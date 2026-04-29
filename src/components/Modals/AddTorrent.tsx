import { useState } from 'react';
import { Modal, useCloseModal } from './Modal';
import { addTorrent } from '@/api/torrents';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

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
          <Textarea
            fullWidth
            className="h-24"
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
            <Input
              fullWidth
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
          <Button variant="default" onClick={close}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? '…' : 'Add'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

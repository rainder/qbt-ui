import { useState } from 'react';
import { Modal, useCloseModal } from './Modal';
import { addTorrent } from '@/api/torrents';

export function AddTorrent({ initialUrl = '', categories }: {
  initialUrl?: string;
  categories: string[];
}) {
  const close = useCloseModal();
  const [urls, setUrls] = useState(initialUrl);
  const [files, setFiles] = useState<File[]>([]);
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
    <Modal title="add torrent" onClose={close}>
      <form onSubmit={submit} className="space-y-3 text-xs w-[28rem]">
        <label className="block text-muted text-[10px] font-medium uppercase">URLs / Magnets (one per line)
          <textarea
            className="mt-1 block w-full h-24 bg-bg3 border border-border2 rounded px-3 py-1.5 text-fg2 focus:outline-none focus:border-accent"
            value={urls} onChange={(e) => setUrls(e.target.value)}
            placeholder="magnet:?xt=urn:btih:..."
          />
        </label>
        <label className="block text-muted text-[10px] font-medium uppercase">Files
          <input
            type="file" multiple accept=".torrent"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="mt-1 block w-full text-fg2"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-muted text-[10px] font-medium uppercase">Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 block w-full bg-bg3 border border-border2 rounded px-3 py-1.5 text-fg2 focus:outline-none focus:border-accent">
              <option value="">(none)</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="block text-muted text-[10px] font-medium uppercase">Tags (comma)
            <input className="mt-1 block w-full bg-bg3 border border-border2 rounded px-3 py-1.5 text-fg2 focus:outline-none focus:border-accent"
                   value={tags} onChange={(e) => setTags(e.target.value)} />
          </label>
        </div>
        <label className="flex items-center gap-2 text-muted">
          <input type="checkbox" checked={paused} onChange={(e) => setPaused(e.target.checked)} />
          start paused
        </label>
        {err && <div className="text-danger">{err}</div>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={close} className="border border-border2 text-fg hover:bg-bg2 px-3 py-1.5 rounded">cancel</button>
          <button type="submit" disabled={busy}
                  className="bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded font-medium disabled:opacity-50">
            {busy ? '...' : 'add'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

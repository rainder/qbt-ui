import { useEffect } from 'react';
import clsx from 'clsx';
import type { SearchResult } from '@/api/types';
import { formatBytes, formatRelativeTime } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Kbd } from '@/components/ui/Kbd';
import { useIsMobile } from '@/hooks/useIsMobile';

export function ResultDetails({
  result, onClose, onAdd,
}: {
  result: SearchResult;
  onClose: () => void;
  onAdd: (url: string) => void;
}) {
  const isMobile = useIsMobile();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const host = safeHost(result.siteUrl);
  const isMagnet = result.fileUrl.startsWith('magnet:');
  const linkKind = isMagnet ? 'magnet' : 'torrent url';

  if (isMobile) return <MobileView result={result} host={host} linkKind={linkKind} onClose={onClose} onAdd={onAdd} />;

  // Desktop: fixed bottom panel pinned to the viewport so the document
  // scrolls behind it.
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-border-default bg-canvas-subtle flex flex-col"
      style={{ height: '40vh' }}
    >
      <div className="px-4 h-10 border-b border-border-default flex items-center gap-3 shrink-0">
        <div className="text-sm font-semibold text-fg-default truncate">{result.fileName}</div>
        <div className="flex-1" />
        <Button
          variant="primary"
          density="sm"
          onClick={() => onAdd(result.fileUrl)}
        >
          + Add
        </Button>
        <button onClick={onClose} className="text-fg-muted hover:text-fg-default" aria-label="Close">
          <Kbd>esc</Kbd>
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <DetailsTable result={result} host={host} linkKind={linkKind} />
      </div>
    </div>
  );
}

function MobileView({
  result, host, linkKind, onClose, onAdd,
}: {
  result: SearchResult;
  host: string;
  linkKind: string;
  onClose: () => void;
  onAdd: (url: string) => void;
}) {
  // Lock body scroll while overlay is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="fixed inset-0 z-40 bg-canvas flex flex-col pt-safe pb-safe">
      <div className="h-12 shrink-0 border-b border-border-default flex items-center gap-2 px-2">
        <button
          onClick={onClose}
          aria-label="Back"
          className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-md text-fg-muted hover:text-fg-default hover:bg-canvas-subtle"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 16l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex-1 min-w-0 text-sm font-medium text-fg-default truncate">
          {result.fileName}
        </div>
      </div>

      <div className="h-12 shrink-0 border-b border-border-default flex items-center gap-2 px-2">
        <Button
          variant="primary"
          density="sm"
          className="flex-1"
          onClick={() => onAdd(result.fileUrl)}
        >
          + Add to qBit
        </Button>
        {result.descrLink && (
          <a
            href={result.descrLink}
            target="_blank"
            rel="noreferrer"
            className={clsx(
              'shrink-0 px-3 h-8 inline-flex items-center justify-center rounded-md text-sm font-medium',
              'border border-border-default text-fg-default hover:bg-canvas-subtle',
            )}
          >
            Open page ↗
          </a>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-4">
        <DetailsTable result={result} host={host} linkKind={linkKind} />
      </div>
    </div>
  );
}

function DetailsTable({
  result, host, linkKind,
}: {
  result: SearchResult;
  host: string;
  linkKind: string;
}) {
  const rows: { k: string; node: React.ReactNode; mono?: boolean }[] = [
    { k: 'name', node: result.fileName },
    { k: 'size', node: result.fileSize > 0 ? formatBytes(result.fileSize) : '—' },
    { k: 'seeders', node: <span className="text-success-fg font-semibold">{result.nbSeeders}</span> },
    { k: 'leechers', node: <span className="text-attention-fg font-semibold">{result.nbLeechers}</span> },
    {
      k: 'site',
      node: (
        <a href={result.siteUrl} target="_blank" rel="noreferrer" className="text-accent-fg hover:underline break-all">
          {host}
        </a>
      ),
    },
    {
      k: 'description',
      node: result.descrLink ? (
        <a href={result.descrLink} target="_blank" rel="noreferrer" className="text-accent-fg hover:underline break-all">
          {result.descrLink}
        </a>
      ) : '—',
    },
    {
      k: linkKind,
      node: <span className="break-all">{result.fileUrl}</span>,
      mono: true,
    },
    ...(result.pubDate
      ? [{
          k: 'published',
          node: `${formatRelativeTime(result.pubDate)} (${new Date(result.pubDate * 1000).toISOString().slice(0, 10)})`,
        }]
      : []),
  ];

  return (
    <table className="w-full">
      <tbody>
        {rows.map(({ k, node, mono }) => (
          <tr key={k} className="border-b border-border-muted">
            <td className="text-fg-muted text-xs uppercase tracking-wider font-semibold py-1.5 pr-4 w-32 align-top">
              {k}
            </td>
            <td className={clsx('text-fg-default text-sm py-1.5 break-all', mono && 'font-mono')}>
              {node}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function safeHost(url: string): string {
  try { return new URL(url).hostname; } catch { return url; }
}

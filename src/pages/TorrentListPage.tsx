import { useEffect, useMemo, useRef, useState } from 'react';
import type { Torrent } from '@/api/types';
import { useSync } from '@/hooks/useSync';
import { TorrentTable } from '@/components/List/TorrentTable';
import { TopBar } from '@/components/Layout/TopBar';
import { Sidebar } from '@/components/Layout/Sidebar';
import { AddTorrent } from '@/components/Modals/AddTorrent';
import { ConfirmDelete } from '@/components/Modals/ConfirmDelete';
import { SetCategory } from '@/components/Modals/SetCategory';
import { EditTags } from '@/components/Modals/EditTags';
import { Help } from '@/components/Modals/Help';
import { MoveLocation } from '@/components/Modals/MoveLocation';
import { SetRateLimits } from '@/components/Modals/SetRateLimits';
import { LogViewer } from '@/components/Modals/LogViewer';
import { DetailsPanel } from '@/components/Layout/DetailsPanel';
import { useUi } from '@/stores/ui';
import { useSelection } from '@/stores/selection';
import { useKeybinds } from '@/hooks/useKeybinds';
import { pause, resume, recheck } from '@/api/torrents';
import { Navigate } from 'react-router-dom';
import { filterTorrents, sortTorrents } from '@/lib/listOps';

export default function TorrentListPage() {
  const { state, error, authError } = useSync();
  const ui = useUi();
  const sel = useSelection() as SelMethods;

  // Drag-drop state
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);
  const [dropFiles, setDropFiles] = useState<File[] | undefined>(undefined);
  const [dropUrl, setDropUrl] = useState<string | undefined>(undefined);

  const displayedRows = useMemo(() => {
    const filtered = filterTorrents(state.torrents, {
      status: ui.filterStatus,
      category: ui.filterCategory,
      tag: ui.filterTag,
      text: ui.filterText,
    });
    return sortTorrents(filtered, ui.sortKey, ui.sortDir);
  }, [state.torrents, ui.filterStatus, ui.filterCategory, ui.filterTag, ui.filterText, ui.sortKey, ui.sortDir]);

  const displayedHashes = useMemo(
    () => displayedRows.map((t) => t.hash!).filter(Boolean),
    [displayedRows],
  );

  useKeybinds([
    { context: 'list', keys: 'j', label: 'next',
      action: () => moveCursor(displayedHashes, sel, 1) },
    { context: 'list', keys: 'k', label: 'prev',
      action: () => moveCursor(displayedHashes, sel, -1) },
    { context: 'list', keys: 'p', label: 'pause',
      action: () => { void pause(sel.hashes()); } },
    { context: 'list', keys: 'r', label: 'resume',
      action: () => { void resume(sel.hashes()); } },
    { context: 'list', keys: 'd', label: 'delete',
      action: () => ui.openModal('delete') },
    { context: 'list', keys: 'R', label: 'recheck',
      action: () => { void recheck(sel.hashes()); } },
    { context: 'list', keys: 'c', label: 'set category',
      action: () => ui.openModal('category') },
    { context: 'list', keys: 't', label: 'edit tags',
      action: () => ui.openModal('tags') },
    { context: 'list', keys: 'enter', label: 'open details',
      action: () => { const h = sel.hashes()[0]; if (h) ui.openDetails(h); } },
    { context: 'list', keys: 'esc', label: 'close details or clear selection',
      action: () => {
        if (ui.detailsOpen) {
          ui.closeDetails();
        } else {
          useSelection.getState().clear();
        }
      } },
  ]);

  // cmd/ctrl+a — select all displayed
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        const { selectRange } = useSelection.getState();
        if (displayedHashes.length > 0) {
          selectRange(displayedHashes, displayedHashes[0], displayedHashes[displayedHashes.length - 1]);
        }
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [displayedHashes]);

  // Drag-drop handlers
  function onDragEnter(e: React.DragEvent) {
    e.preventDefault();
    dragCounterRef.current += 1;
    setIsDragging(true);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);

    // Check for files
    const torrentFiles = Array.from(e.dataTransfer.files).filter((f) =>
      f.name.endsWith('.torrent'),
    );
    if (torrentFiles.length > 0) {
      setDropFiles(torrentFiles);
      setDropUrl(undefined);
      ui.openModal('add');
      return;
    }

    // Check for dragged text (magnet / http URL)
    const text = e.dataTransfer.getData('text/plain').trim();
    if (text && (text.startsWith('magnet:') || text.startsWith('http://') || text.startsWith('https://'))) {
      setDropUrl(text);
      setDropFiles(undefined);
      ui.openModal('add');
    }
  }

  function onAddModalClose() {
    setDropFiles(undefined);
    setDropUrl(undefined);
  }

  if (authError) return <Navigate to="/login" replace />;

  return (
    <div
      className="h-screen flex flex-col bg-canvas relative"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div className="absolute inset-4 border-2 border-dashed border-accent-muted rounded-lg bg-accent-subtle/20" />
          <span className="relative text-accent-fg text-lg font-medium">Drop to add torrents</span>
        </div>
      )}
      <TopBar serverState={state.serverState} />
      <div className="flex-1 min-h-0 flex">
        <Sidebar torrents={state.torrents} categories={state.categories} tags={state.tags} />
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 min-h-0">
            <TorrentTable rows={displayedRows} />
          </div>
          {ui.detailsOpen && ui.activeHash && state.torrents[ui.activeHash] &&
            <DetailsPanel torrent={state.torrents[ui.activeHash]!} />}
        </div>
      </div>
      {error && <div className="border-t border-danger-fg text-danger-fg px-4 py-2 text-sm">{error}</div>}
      {ui.activeModal === 'add' && (
        <AddTorrent
          categories={Object.keys(state.categories)}
          initialUrl={dropUrl}
          initialFiles={dropFiles}
          onClose={onAddModalClose}
        />
      )}
      {ui.activeModal === 'delete' && <ConfirmDelete />}
      {ui.activeModal === 'category' && (
        <SetCategory
          categories={Object.keys(state.categories)}
          currentCategory={sharedCategory(sel.hashes(), state.torrents)}
        />
      )}
      {ui.activeModal === 'tags' && <EditTags allTags={state.tags} />}
      {ui.activeModal === 'help' && <Help />}
      {ui.activeModal === 'location' && (
        <MoveLocation
          savePath={sharedSavePath(sel.hashes(), state.torrents)}
        />
      )}
      {ui.activeModal === 'limits' && <SetRateLimits hashes={sel.hashes()} />}
      {ui.activeModal === 'log' && <LogViewer />}
    </div>
  );
}

interface SelMethods { hashes(): string[]; selectOnly(hash: string): void; }

function moveCursor(ordered: string[], sel: SelMethods, dir: 1 | -1) {
  const cur = sel.hashes()[0];
  const i = cur ? ordered.indexOf(cur) : -1;
  const next = ordered[Math.max(0, Math.min(ordered.length - 1, i + dir))];
  if (next) sel.selectOnly(next);
}

/** Return the shared category if all selected torrents have the same one,
 *  or `undefined` if they differ. */
function sharedCategory(
  hashes: string[],
  torrents: Record<string, Partial<Torrent>>,
): string | undefined {
  if (hashes.length === 0) return '';
  const first = torrents[hashes[0]]?.category ?? '';
  for (let i = 1; i < hashes.length; i++) {
    if ((torrents[hashes[i]]?.category ?? '') !== first) return undefined;
  }
  return first;
}

/** Return the shared save_path if all selected torrents have the same one,
 *  or `undefined` if they differ. */
function sharedSavePath(
  hashes: string[],
  torrents: Record<string, Partial<Torrent>>,
): string | undefined {
  if (hashes.length === 0) return '';
  const first = torrents[hashes[0]]?.save_path ?? '';
  for (let i = 1; i < hashes.length; i++) {
    if ((torrents[hashes[i]]?.save_path ?? '') !== first) return undefined;
  }
  return first;
}

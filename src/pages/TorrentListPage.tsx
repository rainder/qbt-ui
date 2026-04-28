import { useMemo } from 'react';
import { useSync } from '@/hooks/useSync';
import { TorrentTable } from '@/components/List/TorrentTable';
import { TopBar } from '@/components/Layout/TopBar';
import { Sidebar } from '@/components/Layout/Sidebar';
import { AddTorrent } from '@/components/Modals/AddTorrent';
import { ConfirmDelete } from '@/components/Modals/ConfirmDelete';
import { SetCategory } from '@/components/Modals/SetCategory';
import { EditTags } from '@/components/Modals/EditTags';
import { Help } from '@/components/Modals/Help';
import { useUi } from '@/stores/ui';
import { useSelection } from '@/stores/selection';
import { useKeybinds } from '@/hooks/useKeybinds';
import { pause, resume, recheck } from '@/api/torrents';
import { Navigate } from 'react-router-dom';

export default function TorrentListPage() {
  const { state, error, authError } = useSync();
  const ui = useUi();
  const sel = useSelection() as SelMethods;
  const ordered = useMemo(
    () => Object.values(state.torrents).map((t) => t.hash!).filter(Boolean),
    [state.torrents],
  );

  useKeybinds([
    { context: 'list', keys: 'j', label: 'next',
      action: () => moveCursor(ordered, sel, 1) },
    { context: 'list', keys: 'k', label: 'prev',
      action: () => moveCursor(ordered, sel, -1) },
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
    { context: 'list', keys: 'esc', label: 'close details',
      action: () => ui.closeDetails() },
  ]);

  if (authError) return <Navigate to="/login" replace />;

  return (
    <div className="h-screen flex flex-col">
      <TopBar serverState={state.serverState} />
      <div className="flex-1 min-h-0 flex">
        <Sidebar torrents={state.torrents} categories={state.categories} tags={state.tags} />
        <div className="flex-1 min-w-0">
          <TorrentTable torrents={state.torrents} />
        </div>
      </div>
      {error && <div className="border-t border-danger text-danger px-3 py-1 text-xs">{error}</div>}
      {ui.activeModal === 'add' && <AddTorrent categories={Object.keys(state.categories)} />}
      {ui.activeModal === 'delete' && <ConfirmDelete />}
      {ui.activeModal === 'category' && <SetCategory categories={Object.keys(state.categories)} />}
      {ui.activeModal === 'tags' && <EditTags allTags={state.tags} />}
      {ui.activeModal === 'help' && <Help />}
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

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
import { Navigate } from 'react-router-dom';

export default function TorrentListPage() {
  const { state, error, authError } = useSync();
  const activeModal = useUi((s) => s.activeModal);
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
      {activeModal === 'add' && <AddTorrent categories={Object.keys(state.categories)} />}
      {activeModal === 'delete' && <ConfirmDelete />}
      {activeModal === 'category' && <SetCategory categories={Object.keys(state.categories)} />}
      {activeModal === 'tags' && <EditTags allTags={state.tags} />}
      {activeModal === 'help' && <Help />}
    </div>
  );
}

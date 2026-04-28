import { useSync } from '@/hooks/useSync';
import { TorrentTable } from '@/components/List/TorrentTable';
import { TopBar } from '@/components/Layout/TopBar';
import { Sidebar } from '@/components/Layout/Sidebar';
import { Navigate } from 'react-router-dom';

export default function TorrentListPage() {
  const { state, error, authError } = useSync();
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
    </div>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthGate } from './components/AuthGate';
import { useUi } from './stores/ui';
import { useKeyboardHandler, useKeybinds } from './hooks/useKeybinds';
import LoginPage from './pages/LoginPage';
import TorrentListPage from './pages/TorrentListPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 5_000, retry: false } } });

function GlobalKeybinds() {
  const { activeModal, openModal } = useUi();
  useKeyboardHandler(() => (activeModal ? 'modal' : 'list'));
  useKeybinds([
    { context: 'global', keys: '?', label: 'help', action: () => openModal('help') },
    { context: 'global', keys: 'a', label: 'add torrent', action: () => openModal('add') },
    { context: 'global', keys: 'gs', label: 'go search', action: () => { window.location.href = '/search'; } },
    { context: 'global', keys: 'gh', label: 'go home', action: () => { window.location.href = '/'; } },
    { context: 'global', keys: 'gp', label: 'go plugins',
      action: () => { window.location.href = '/settings/plugins'; } },
    { context: 'modal',  keys: 'esc', label: 'close', action: () => openModal(null) },
  ]);
  return null;
}

export function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <GlobalKeybinds />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AuthGate />}>
            <Route path="/" element={<TorrentListPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/settings/*" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

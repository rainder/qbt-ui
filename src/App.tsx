import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthGate } from './components/AuthGate';
import LoginPage from './pages/LoginPage';
import TorrentListPage from './pages/TorrentListPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 5_000, retry: false } },
});

export function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
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

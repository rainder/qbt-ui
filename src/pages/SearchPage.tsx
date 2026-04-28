import { useEffect, useRef, useState } from 'react';
import { useSync } from '@/hooks/useSync';
import { TopBar } from '@/components/Layout/TopBar';
import { SearchBar } from '@/components/Search/SearchBar';
import { ResultsTable } from '@/components/Search/ResultsTable';
import { startSearch, stopSearch, deleteSearch, fetchSearchResults } from '@/api/search';
import { AddTorrent } from '@/components/Modals/AddTorrent';
import type { SearchResult } from '@/api/types';
import { useUi } from '@/stores/ui';

export default function SearchPage() {
  const { state } = useSync();
  const ui = useUi();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefill, setPrefill] = useState('');
  const pollRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => {
    if (pollRef.current) clearTimeout(pollRef.current);
    if (sessionId !== null) { void stopSearch(sessionId).catch(() => {}); void deleteSearch(sessionId).catch(() => {}); }
  }, [sessionId]);

  async function start(pattern: string, plugins: 'enabled' | string[], category: string) {
    setError(null); setResults([]);
    if (sessionId !== null) { await stopSearch(sessionId).catch(() => {}); await deleteSearch(sessionId).catch(() => {}); }
    try {
      const { id } = await startSearch(pattern, plugins, category);
      setSessionId(id); setRunning(true); poll(id);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  function poll(id: number) {
    if (pollRef.current) clearTimeout(pollRef.current);
    fetchSearchResults(id).then((res) => {
      setResults(res.results);
      if (res.status === 'Stopped') { setRunning(false); return; }
      pollRef.current = setTimeout(() => poll(id), 1500);
    }).catch((e) => setError(e.message));
  }

  function add(url: string) {
    setPrefill(url);
    ui.openModal('add');
  }

  return (
    <div className="h-screen flex flex-col">
      <TopBar serverState={state.serverState} />
      <SearchBar onStart={start} />
      {error && <div className="text-danger-fg px-4 py-2 text-sm">{error}</div>}
      <div className="px-4 py-2 text-fg-muted text-xs">
        {running ? `Searching… ${results.length} results so far` : results.length ? `${results.length} results` : 'Enter a query above'}
      </div>
      <div className="flex-1 overflow-auto">
        <ResultsTable results={results} onAdd={add} />
      </div>
      {ui.activeModal === 'add' &&
        <AddTorrent initialUrl={prefill} categories={Object.keys(state.categories)} />}
    </div>
  );
}

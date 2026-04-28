import { useQuery } from '@tanstack/react-query';
import { fetchMainLog } from '@/api/log';
import { Modal, useCloseModal } from '@/components/Modals/Modal';

function formatTime(ms: number) {
  const d = new Date(ms);
  return d.toTimeString().slice(0, 8); // "HH:MM:SS"
}

const TYPE_COLOR: Record<number, string> = {
  1: 'text-fg-muted',
  2: 'text-accent-fg',
  4: 'text-attention-fg',
  8: 'text-danger-fg',
};

export function LogViewer() {
  const close = useCloseModal();

  const { data, isLoading, error } = useQuery({
    queryKey: ['log'],
    queryFn: () => fetchMainLog(),
    refetchInterval: 2000,
  });

  // qB returns oldest-first; show newest-first, capped at 200
  const entries = data ? [...data].slice(-200).reverse() : [];

  return (
    <Modal title="Log" onClose={close}>
      <div className="font-mono text-xs max-h-[60vh] min-w-[640px] max-w-[80vw] overflow-auto -m-4 p-4">
        {isLoading && (
          <p className="text-fg-muted text-center py-4">Loading log…</p>
        )}
        {error && (
          <div className="bg-danger-subtle border border-danger-muted text-danger-fg rounded px-3 py-2 mb-2">
            {error instanceof Error ? error.message : String(error)}
          </div>
        )}
        {!isLoading && !error && entries.length === 0 && (
          <p className="text-fg-muted text-center py-4">No log entries yet</p>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className={TYPE_COLOR[entry.type] ?? 'text-fg-muted'}>
            <span className="tabular-nums">[{formatTime(entry.timestamp)}]</span>
            {' '}
            {entry.message}
          </div>
        ))}
      </div>
    </Modal>
  );
}

import type { TorrentState } from '@/api/types';

const MAP: Record<TorrentState, { label: string; cls: string }> = {
  downloading:        { label: 'Down',  cls: 'bg-accent-bg text-accent border border-accent-soft' },
  forcedDL:           { label: 'Down',  cls: 'bg-accent-bg text-accent border border-accent-soft' },
  metaDL:             { label: 'MD',    cls: 'bg-accent-bg text-accent border border-accent-soft' },
  stalledDL:          { label: 'Down',  cls: 'bg-muted-soft text-muted border border-muted-soft' },
  queuedDL:           { label: 'Queue', cls: 'bg-muted-soft text-muted border border-muted-soft' },
  checkingDL:         { label: 'Check', cls: 'bg-warn-bg text-warn border border-warn-soft' },
  uploading:          { label: 'Seed',  cls: 'bg-ok-bg text-ok border border-ok-soft' },
  forcedUP:           { label: 'Seed',  cls: 'bg-ok-bg text-ok border border-ok-soft' },
  stalledUP:          { label: 'Seed',  cls: 'bg-muted-soft text-muted border border-muted-soft' },
  queuedUP:           { label: 'Queue', cls: 'bg-muted-soft text-muted border border-muted-soft' },
  checkingUP:         { label: 'Check', cls: 'bg-warn-bg text-warn border border-warn-soft' },
  pausedDL:           { label: 'Pause', cls: 'bg-bg3 text-muted border border-border2' },
  pausedUP:           { label: 'Pause', cls: 'bg-bg3 text-muted border border-border2' },
  allocating:         { label: 'Alloc', cls: 'bg-warn-bg text-warn border border-warn-soft' },
  moving:             { label: 'Move',  cls: 'bg-warn-bg text-warn border border-warn-soft' },
  checkingResumeData: { label: 'Check', cls: 'bg-warn-bg text-warn border border-warn-soft' },
  missingFiles:       { label: 'Miss',  cls: 'bg-danger-bg text-danger border border-danger-soft' },
  error:              { label: 'Error', cls: 'bg-danger-bg text-danger border border-danger-soft' },
  unknown:            { label: '—',     cls: 'bg-muted-soft text-muted border border-muted-soft' },
};

export function StatusPill({ state }: { state: TorrentState }) {
  const { label, cls } = MAP[state] ?? MAP.unknown;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
}

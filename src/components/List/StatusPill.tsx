import type { TorrentState } from '@/api/types';

const MAP: Record<TorrentState, { label: string; cls: string }> = {
  downloading:        { label: 'Down',  cls: 'bg-accent-subtle text-accent-fg border-accent-muted' },
  forcedDL:           { label: 'Down',  cls: 'bg-accent-subtle text-accent-fg border-accent-muted' },
  metaDL:             { label: 'Down',  cls: 'bg-accent-subtle text-accent-fg border-accent-muted' },
  stalledDL:          { label: 'Down',  cls: 'bg-accent-subtle text-accent-fg border-accent-muted' },
  queuedDL:           { label: 'Queue', cls: 'bg-accent-subtle text-accent-fg border-accent-muted' },
  checkingDL:         { label: 'Check', cls: 'bg-accent-subtle text-accent-fg border-accent-muted' },
  uploading:          { label: 'Seed',  cls: 'bg-success-subtle text-success-fg border-success-muted' },
  forcedUP:           { label: 'Seed',  cls: 'bg-success-subtle text-success-fg border-success-muted' },
  stalledUP:          { label: 'Seed',  cls: 'bg-canvas-subtle text-fg-muted border-border-default' },
  queuedUP:           { label: 'Queue', cls: 'bg-canvas-subtle text-fg-muted border-border-default' },
  checkingUP:         { label: 'Check', cls: 'bg-attention-subtle text-attention-fg border-attention-muted' },
  pausedDL:           { label: 'Pause', cls: 'bg-canvas-subtle text-fg-muted border-border-default' },
  pausedUP:           { label: 'Pause', cls: 'bg-canvas-subtle text-fg-muted border-border-default' },
  allocating:         { label: 'Alloc', cls: 'bg-attention-subtle text-attention-fg border-attention-muted' },
  moving:             { label: 'Move',  cls: 'bg-attention-subtle text-attention-fg border-attention-muted' },
  checkingResumeData: { label: 'Check', cls: 'bg-attention-subtle text-attention-fg border-attention-muted' },
  missingFiles:       { label: 'Miss',  cls: 'bg-danger-subtle text-danger-fg border-danger-muted' },
  error:              { label: 'Error', cls: 'bg-danger-subtle text-danger-fg border-danger-muted' },
  unknown:            { label: '—',     cls: 'bg-canvas-subtle text-fg-muted border-border-default' },
};

export function StatusPill({ state }: { state: TorrentState }) {
  const { label, cls } = MAP[state] ?? MAP.unknown;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${cls}`}>
      {label}
    </span>
  );
}

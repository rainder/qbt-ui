import type { TorrentState } from '@/api/types';
import { Badge, type BadgeProps } from '@/components/ui/Badge';

type BadgeVariant = BadgeProps['variant'];

const MAP: Record<TorrentState, { label: string; variant: BadgeVariant }> = {
  downloading:        { label: 'Down',  variant: 'accent' },
  forcedDL:           { label: 'Down',  variant: 'accent' },
  metaDL:             { label: 'Down',  variant: 'accent' },
  stalledDL:          { label: 'Down',  variant: 'neutral' },
  queuedDL:           { label: 'Queue', variant: 'neutral' },
  checkingDL:         { label: 'Check', variant: 'attention' },
  uploading:          { label: 'Seed',  variant: 'success' },
  forcedUP:           { label: 'Seed',  variant: 'success' },
  stalledUP:          { label: 'Seed',  variant: 'neutral' },
  queuedUP:           { label: 'Queue', variant: 'neutral' },
  checkingUP:         { label: 'Check', variant: 'attention' },
  pausedDL:           { label: 'Pause', variant: 'neutral' },
  pausedUP:           { label: 'Pause', variant: 'neutral' },
  allocating:         { label: 'Alloc', variant: 'attention' },
  moving:             { label: 'Move',  variant: 'attention' },
  checkingResumeData: { label: 'Check', variant: 'attention' },
  missingFiles:       { label: 'Miss',  variant: 'danger' },
  error:              { label: 'Error', variant: 'danger' },
  unknown:            { label: '—',     variant: 'neutral' },
};

export function StatusPill({ state }: { state: TorrentState }) {
  const { label, variant } = MAP[state] ?? MAP.unknown;
  return <Badge variant={variant} shape="pill">{label}</Badge>;
}

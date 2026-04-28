import type { TorrentState } from '@/api/types';

const MAP: Record<TorrentState, { label: string; cls: string }> = {
  downloading:        { label: 'DL', cls: 'border-accent text-accent' },
  forcedDL:           { label: 'DL', cls: 'border-accent text-accent' },
  metaDL:             { label: 'MD', cls: 'border-accent text-accent' },
  stalledDL:          { label: 'DL', cls: 'border-muted text-muted' },
  queuedDL:           { label: 'QU', cls: 'border-muted text-muted' },
  checkingDL:         { label: 'CK', cls: 'border-warn text-warn' },
  uploading:          { label: 'SE', cls: 'border-ok text-ok' },
  forcedUP:           { label: 'SE', cls: 'border-ok text-ok' },
  stalledUP:          { label: 'SE', cls: 'border-muted text-muted' },
  queuedUP:           { label: 'QU', cls: 'border-muted text-muted' },
  checkingUP:         { label: 'CK', cls: 'border-warn text-warn' },
  pausedDL:           { label: 'PA', cls: 'border-muted text-muted' },
  pausedUP:           { label: 'PA', cls: 'border-muted text-muted' },
  allocating:         { label: 'AL', cls: 'border-warn text-warn' },
  moving:             { label: 'MV', cls: 'border-warn text-warn' },
  checkingResumeData: { label: 'CK', cls: 'border-warn text-warn' },
  missingFiles:       { label: 'MS', cls: 'border-danger text-danger' },
  error:              { label: 'ER', cls: 'border-danger text-danger' },
  unknown:            { label: '??', cls: 'border-muted text-muted' },
};

export function StatusPill({ state }: { state: TorrentState }) {
  const { label, cls } = MAP[state] ?? MAP.unknown;
  return (
    <span className={`inline-block border px-1 text-[10px] leading-4 ${cls}`}>
      {label}
    </span>
  );
}

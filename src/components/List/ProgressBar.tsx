export function ProgressBar({ value, complete, thin }: { value: number; complete?: boolean; thin?: boolean }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className={`w-full ${thin ? 'h-1' : 'h-1.5 border border-border-muted'} bg-canvas-inset rounded-full overflow-hidden`}
      aria-label="progress"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full ${complete ? 'bg-success-emphasis' : 'bg-accent-emphasis'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

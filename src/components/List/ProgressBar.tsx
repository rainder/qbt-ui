export function ProgressBar({ value, complete }: { value: number; complete?: boolean }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className="w-full h-1.5 bg-canvas-inset border border-border-muted rounded-full overflow-hidden"
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

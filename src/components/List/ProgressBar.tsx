export function ProgressBar({ value, complete }: { value: number; complete?: boolean }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="w-full h-1 bg-border2/50 rounded-full overflow-hidden" aria-label="progress" role="progressbar"
         aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={`h-full rounded-full ${complete ? 'bar-fill-done' : 'bar-fill'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

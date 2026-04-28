interface SpeedSparklineProps {
  values: number[];
  color: string;
  width?: number;
  height?: number;
  ariaLabel?: string;
}

export function SpeedSparkline({
  values,
  color,
  width = 80,
  height = 16,
  ariaLabel,
}: SpeedSparklineProps) {
  if (values.length < 2) {
    return (
      <svg
        width={width}
        height={height}
        aria-label={ariaLabel}
        aria-hidden={!ariaLabel}
      />
    );
  }

  const max = Math.max(...values, 1);
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - (v / max) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
    >
      <polyline
        points={points}
        stroke={color}
        strokeWidth={1.5}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

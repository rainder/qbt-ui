import type { ReactNode } from 'react';
import clsx from 'clsx';

type Variant = 'accent' | 'success' | 'attention' | 'danger' | 'neutral' | 'done' | 'solid-accent';
type Shape = 'rounded' | 'pill';

const VARIANTS: Record<Variant, string> = {
  accent:       'bg-accent-subtle    text-accent-fg    border border-accent-muted',
  success:      'bg-success-subtle   text-success-fg   border border-success-muted',
  attention:    'bg-attention-subtle text-attention-fg border border-attention-muted',
  danger:       'bg-danger-subtle    text-danger-fg    border border-danger-muted',
  neutral:      'bg-canvas-subtle    text-fg-muted     border border-border-default',
  done:         'bg-done-subtle      text-done-fg      border border-subtle',
  // Filled accent — for "active" count badges
  'solid-accent': 'bg-accent-fg text-fg-on-emphasis border border-transparent',
};

const SHAPES: Record<Shape, string> = {
  rounded: 'rounded',
  pill:    'rounded-full',
};

export interface BadgeProps {
  variant?: Variant;
  shape?: Shape;
  className?: string;
  children: ReactNode;
}

export function Badge({ variant = 'neutral', shape = 'pill', className, children }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        VARIANTS[variant],
        SHAPES[shape],
        className,
      )}
    >
      {children}
    </span>
  );
}

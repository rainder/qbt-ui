import type { ReactNode } from 'react';
import clsx from 'clsx';

export interface KbdProps {
  className?: string;
  children: ReactNode;
}

export function Kbd({ className, children }: KbdProps) {
  return (
    <kbd
      className={clsx(
        'inline-flex items-center bg-canvas-subtle border border-border-default rounded px-1.5 py-0.5 text-[11px] font-mono text-fg-muted whitespace-nowrap',
        className,
      )}
    >
      {children}
    </kbd>
  );
}

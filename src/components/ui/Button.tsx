import { forwardRef, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'default' | 'danger' | 'ghost';
type Density = 'sm' | 'md';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-success-emphasis hover:bg-success-emphasis-h text-fg-on-emphasis border border-subtle',
  default:
    'bg-canvas-subtle hover:bg-border-default text-fg-default border border-border-default',
  danger:
    'bg-canvas-subtle hover:bg-danger-emphasis hover:text-fg-on-emphasis text-danger-fg border border-border-default hover:border-danger-emphasis',
  ghost:
    'bg-transparent hover:bg-canvas-subtle text-fg-muted hover:text-fg-default border border-transparent',
};

const DENSITY: Record<Density, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-[5px] text-sm',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  density?: Density;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'default', density = 'md', fullWidth = false, className, type = 'button', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      {...rest}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        DENSITY[density],
        fullWidth && 'w-full',
        className,
      )}
    >
      {children}
    </button>
  );
});

import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

type Density = 'sm' | 'md';

const DENSITY: Record<Density, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-[5px] text-sm',
};

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  density?: Density;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { density = 'md', fullWidth = false, className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      {...rest}
      className={clsx(
        'bg-canvas-inset border border-border-default rounded-md text-fg-default placeholder:text-fg-subtle focus-accent outline-none',
        DENSITY[density],
        fullWidth && 'w-full',
        className,
      )}
    />
  );
});

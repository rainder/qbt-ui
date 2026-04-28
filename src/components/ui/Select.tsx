import { forwardRef, type SelectHTMLAttributes } from 'react';

type Density = 'sm' | 'md';

const DENSITY: Record<Density, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-[5px] text-sm',
};

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  density?: Density;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { density = 'md', className = '', children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      {...rest}
      className={[
        'select-styled bg-canvas-inset border border-border-default rounded-md text-fg-default focus-accent',
        DENSITY[density],
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </select>
  );
});

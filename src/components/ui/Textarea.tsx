import { forwardRef, type TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { fullWidth = false, className, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      {...rest}
      className={clsx(
        'bg-canvas-inset border border-border-default rounded-md text-fg-default placeholder:text-fg-subtle focus-accent outline-none px-3 py-[5px] text-sm',
        fullWidth && 'w-full',
        className,
      )}
    />
  );
});

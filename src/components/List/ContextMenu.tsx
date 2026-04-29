import { useEffect, useRef } from 'react';
import { Kbd } from '@/components/ui/Kbd';

export interface ContextMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
  separatorBefore?: boolean;
  disabled?: boolean;
  shortcut?: string;
}

export function ContextMenu({
  x, y, items, onClose,
}: {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // Clamp to viewport so it doesn't render off-screen.
  const MENU_W = 200;
  const MENU_H = items.length * 32 + 8;
  const clampedX = Math.min(x, window.innerWidth - MENU_W - 4);
  const clampedY = Math.min(y, window.innerHeight - MENU_H - 4);

  return (
    <div
      ref={ref}
      role="menu"
      className="fixed z-50 min-w-[200px] bg-canvas border border-border-default rounded-md shadow-2xl py-1"
      style={{ left: clampedX, top: clampedY }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((it, i) => (
        <div key={i}>
          {it.separatorBefore && <div className="my-1 border-t border-border-muted" />}
          <button
            disabled={it.disabled}
            onClick={() => { it.onClick(); onClose(); }}
            className={[
              'w-full text-left px-3 py-1.5 text-sm flex items-center justify-between gap-4 disabled:opacity-50 disabled:cursor-not-allowed',
              it.danger
                ? 'text-danger-fg hover:bg-danger-subtle'
                : 'text-fg-default hover:bg-canvas-subtle',
            ].join(' ')}
          >
            <span>{it.label}</span>
            {it.shortcut && <Kbd>{it.shortcut}</Kbd>}
          </button>
        </div>
      ))}
    </div>
  );
}

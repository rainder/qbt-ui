import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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

  // Measure the rendered menu and clamp it inside the viewport on all sides.
  // Falls back to (x, y) for the first paint, then snaps into place.
  const [pos, setPos] = useState<{ left: number; top: number; maxHeight: number } | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const PAD = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = el.getBoundingClientRect();
    const maxHeight = Math.max(120, vh - PAD * 2);
    const height = Math.min(rect.height, maxHeight);
    const width = rect.width;
    const left = Math.max(PAD, Math.min(x, vw - width - PAD));
    const top = Math.max(PAD, Math.min(y, vh - height - PAD));
    setPos({ left, top, maxHeight });
  }, [x, y, items.length]);

  return (
    <div
      ref={ref}
      role="menu"
      className="fixed z-50 min-w-[200px] bg-canvas border border-border-default rounded-md shadow-2xl py-1 overflow-y-auto overscroll-contain"
      style={{
        left: pos?.left ?? x,
        top: pos?.top ?? y,
        maxHeight: pos?.maxHeight,
        visibility: pos ? 'visible' : 'hidden',
      }}
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

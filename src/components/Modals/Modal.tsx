import { useEffect } from 'react';
import { useUi } from '@/stores/ui';

export function Modal({ title, children, onClose }: {
  title: string; children: React.ReactNode; onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70" onClick={onClose}>
      <div className="bg-bg3 border border-border2 min-w-96 max-w-2xl rounded-md shadow-xl"
           onClick={(e) => e.stopPropagation()}>
        <div className="px-4 h-10 border-b border-border2 flex items-center justify-between text-fg2">
          <span className="font-medium">{title}</span>
          <button onClick={onClose} className="text-muted hover:text-fg2">
            <kbd className="text-[10px] text-muted bg-bg2 px-1.5 py-0.5 rounded border border-border">esc</kbd>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export function useCloseModal() {
  const openModal = useUi((s) => s.openModal);
  return () => openModal(null);
}

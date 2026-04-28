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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60" onClick={onClose}>
      <div className="bg-bg2 border border-border min-w-96 max-w-2xl"
           onClick={(e) => e.stopPropagation()}>
        <div className="px-3 h-7 border-b border-border flex items-center justify-between text-fg2">
          <span>{title}</span>
          <button onClick={onClose} className="text-muted hover:text-fg2">[esc]</button>
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

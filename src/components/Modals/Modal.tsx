import { useEffect } from 'react';
import { useUi } from '@/stores/ui';
import { Kbd } from '@/components/ui/Kbd';

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ backgroundColor: 'rgba(1,4,9,0.8)' }}
      onClick={onClose}
    >
      <div
        className="bg-canvas border border-border-default rounded-md shadow-2xl w-full max-w-2xl max-h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-12 px-4 border-b border-border-default flex items-center justify-between shrink-0">
          <span className="text-base font-semibold text-fg-default truncate pr-2">{title}</span>
          <button onClick={onClose} className="hover:text-fg-default text-fg-muted shrink-0">
            <Kbd>esc</Kbd>
          </button>
        </div>
        {/* Body */}
        <div className="p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function useCloseModal() {
  const openModal = useUi((s) => s.openModal);
  return () => openModal(null);
}

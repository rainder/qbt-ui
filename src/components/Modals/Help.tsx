import { Modal, useCloseModal } from './Modal';
import { registry } from '@/keyboard/bindings';
import { Kbd } from '@/components/ui/Kbd';

export function Help() {
  const close = useCloseModal();
  const grouped = registry.list().reduce<Record<string, { keys: string; label: string }[]>>(
    (acc, b) => {
      (acc[b.context] ??= []).push({ keys: b.keys, label: b.label });
      return acc;
    }, {});

  return (
    <Modal title="Keyboard shortcuts" onClose={close}>
      <div className="grid grid-cols-2 gap-6 w-[36rem]">
        {Object.entries(grouped).map(([ctx, items]) => (
          <div key={ctx}>
            <div className="text-fg-default font-semibold text-base mb-2">{ctx}</div>
            {items.map((it) => (
              <div
                key={it.keys + it.label}
                className="flex items-center justify-between border-b border-border-muted py-2"
              >
                <Kbd>{it.keys}</Kbd>
                <span className="text-fg-muted text-sm">{it.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Modal>
  );
}

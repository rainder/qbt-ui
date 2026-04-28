import { Modal, useCloseModal } from './Modal';
import { registry } from '@/keyboard/bindings';

export function Help() {
  const close = useCloseModal();
  const grouped = registry.list().reduce<Record<string, { keys: string; label: string }[]>>(
    (acc, b) => {
      (acc[b.context] ??= []).push({ keys: b.keys, label: b.label });
      return acc;
    }, {});

  return (
    <Modal title="keybindings" onClose={close}>
      <div className="grid grid-cols-2 gap-6 w-[36rem] text-xs">
        {Object.entries(grouped).map(([ctx, items]) => (
          <div key={ctx}>
            <div className="text-muted uppercase mb-1">{ctx}</div>
            {items.map((it) => (
              <div key={it.keys + it.label} className="flex justify-between border-b border-dotted border-border py-0.5">
                <span className="text-accent">{it.keys}</span>
                <span className="text-fg2">{it.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Modal>
  );
}

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
            <div className="text-fg2 font-medium text-sm mb-2">{ctx}</div>
            {items.map((it) => (
              <div key={it.keys + it.label} className="flex justify-between border-b border-border py-0.5">
                <kbd className="bg-bg2 border border-border2 px-1.5 py-0.5 rounded text-accent text-[11px] font-mono">{it.keys}</kbd>
                <span className="text-fg2">{it.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Modal>
  );
}

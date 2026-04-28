import type { KbContext, Registry } from './registry';

const SEQUENCE_TIMEOUT_MS = 600;

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

export function attachHandler(registry: Registry, getContext: () => KbContext): () => void {
  let buffer = '';
  let timer: ReturnType<typeof setTimeout> | undefined;

  const reset = () => { buffer = ''; if (timer) clearTimeout(timer); timer = undefined; };

  const onKeyDown = (ev: KeyboardEvent) => {
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    if (isEditable(ev.target)) return;
    if (ev.key.length !== 1 && ev.key !== 'Escape' && ev.key !== 'Enter') return;

    const key = ev.key === 'Escape' ? 'esc' : ev.key === 'Enter' ? 'enter' : ev.key;
    buffer += key;
    if (timer) clearTimeout(timer);

    const ctx = getContext();
    const hit = registry.resolve(ctx, buffer);
    if (hit) {
      ev.preventDefault();
      hit.action(ev);
      reset();
      return;
    }

    // Could be a prefix of a sequence; let it ride until timeout
    timer = setTimeout(reset, SEQUENCE_TIMEOUT_MS);
  };

  document.addEventListener('keydown', onKeyDown);
  return () => {
    document.removeEventListener('keydown', onKeyDown);
    reset();
  };
}

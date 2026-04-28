import { describe, it, expect, vi } from 'vitest';
import { createRegistry } from './registry';
import { attachHandler } from './handler';

function press(key: string, target: EventTarget = document.body) {
  const ev = new KeyboardEvent('keydown', { key, bubbles: true });
  target.dispatchEvent(ev);
}

describe('keyboard handler', () => {
  it('dispatches a registered single-key binding', () => {
    const r = createRegistry();
    const action = vi.fn();
    r.register({ context: 'list', keys: 'p', label: 'pause', action });
    const detach = attachHandler(r, () => 'list');

    press('p');
    expect(action).toHaveBeenCalledOnce();
    detach();
  });

  it('handles two-key sequences within timeout', () => {
    vi.useFakeTimers();
    const r = createRegistry();
    const action = vi.fn();
    r.register({ context: 'global', keys: 'gs', label: 'go-search', action });
    const detach = attachHandler(r, () => 'list');

    press('g');
    vi.advanceTimersByTime(100);
    press('s');
    expect(action).toHaveBeenCalledOnce();

    vi.useRealTimers();
    detach();
  });

  it('resets the buffer after timeout', () => {
    vi.useFakeTimers();
    const r = createRegistry();
    const goSearch = vi.fn();
    const goPlugin = vi.fn();
    r.register({ context: 'global', keys: 'gs', label: 'go-search', action: goSearch });
    r.register({ context: 'global', keys: 'gp', label: 'go-plugin', action: goPlugin });
    const detach = attachHandler(r, () => 'list');

    press('g');
    vi.advanceTimersByTime(700);
    press('p');
    expect(goPlugin).not.toHaveBeenCalled();   // 'p' alone, no binding

    vi.useRealTimers();
    detach();
  });

  it('ignores keypresses originating in inputs', () => {
    const r = createRegistry();
    const action = vi.fn();
    r.register({ context: 'list', keys: 'p', label: 'pause', action });
    const detach = attachHandler(r, () => 'list');

    const input = document.createElement('input');
    document.body.appendChild(input);
    press('p', input);
    expect(action).not.toHaveBeenCalled();

    input.remove();
    detach();
  });
});

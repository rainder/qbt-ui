import { describe, it, expect } from 'vitest';
import { createRegistry } from './registry';

describe('keyboard registry', () => {
  it('registers and resolves a binding', () => {
    const r = createRegistry();
    const action = () => 'paused';
    r.register({ context: 'list', keys: 'p', label: 'pause', action });
    expect(r.resolve('list', 'p')?.label).toBe('pause');
  });

  it('falls back to global when list has no match', () => {
    const r = createRegistry();
    r.register({ context: 'global', keys: '?', label: 'help', action: () => {} });
    expect(r.resolve('list', '?')?.label).toBe('help');
  });

  it('list binding overrides global on same key', () => {
    const r = createRegistry();
    r.register({ context: 'global', keys: 'a', label: 'global-a', action: () => {} });
    r.register({ context: 'list', keys: 'a', label: 'list-a', action: () => {} });
    expect(r.resolve('list', 'a')?.label).toBe('list-a');
  });

  it('modal context does not fall through to global', () => {
    const r = createRegistry();
    r.register({ context: 'global', keys: 'a', label: 'global-a', action: () => {} });
    expect(r.resolve('modal', 'a')).toBeUndefined();
  });

  it('supports two-key sequences', () => {
    const r = createRegistry();
    r.register({ context: 'global', keys: 'gs', label: 'go-search', action: () => {} });
    expect(r.resolve('global', 'g')).toBeUndefined();
    expect(r.resolve('global', 'gs')?.label).toBe('go-search');
  });

  it('lists all bindings for help overlay', () => {
    const r = createRegistry();
    r.register({ context: 'list', keys: 'p', label: 'pause', action: () => {} });
    r.register({ context: 'global', keys: '?', label: 'help', action: () => {} });
    expect(r.list()).toHaveLength(2);
  });
});

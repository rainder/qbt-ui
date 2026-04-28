export type KbContext = 'global' | 'list' | 'modal';

export interface Binding {
  context: KbContext;
  keys: string;          // single key like 'p' or sequence like 'gs'
  label: string;
  action: (ev?: KeyboardEvent) => void;
}

export interface Registry {
  register(b: Binding): void;
  unregister(b: Binding): void;
  resolve(ctx: KbContext, sequence: string): Binding | undefined;
  list(): Binding[];
}

export function createRegistry(): Registry {
  const bindings: Binding[] = [];
  return {
    register(b) { bindings.push(b); },
    unregister(b) {
      const i = bindings.indexOf(b);
      if (i >= 0) bindings.splice(i, 1);
    },
    resolve(ctx, sequence) {
      const order: KbContext[] = ctx === 'modal' ? ['modal'] : [ctx, 'global'];
      for (const c of order) {
        const hit = bindings.find((b) => b.context === c && b.keys === sequence);
        if (hit) return hit;
      }
      return undefined;
    },
    list() { return [...bindings]; },
  };
}

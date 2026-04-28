import { createRegistry, type Binding } from './registry';

export const registry = createRegistry();

export function registerAll(bindings: Binding[]) {
  for (const b of bindings) registry.register(b);
  return () => { for (const b of bindings) registry.unregister(b); };
}

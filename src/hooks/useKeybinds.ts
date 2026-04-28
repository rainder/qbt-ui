import { useEffect } from 'react';
import { registry, registerAll } from '@/keyboard/bindings';
import { attachHandler } from '@/keyboard/handler';
import type { Binding, KbContext } from '@/keyboard/registry';

export function useKeybinds(bindings: Binding[]) {
  useEffect(() => registerAll(bindings), [bindings]);
}

export function useKeyboardHandler(getCtx: () => KbContext) {
  useEffect(() => attachHandler(registry, getCtx), [getCtx]);
}

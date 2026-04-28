import { describe, it, expect, beforeEach } from 'vitest';
import { useSelection } from './selection';

describe('selection store', () => {
  beforeEach(() => useSelection.getState().clear());

  it('toggles a hash in and out', () => {
    useSelection.getState().toggle('abc');
    expect(useSelection.getState().has('abc')).toBe(true);
    useSelection.getState().toggle('abc');
    expect(useSelection.getState().has('abc')).toBe(false);
  });

  it('selectOnly replaces the selection', () => {
    useSelection.getState().toggle('a');
    useSelection.getState().toggle('b');
    useSelection.getState().selectOnly('c');
    expect(useSelection.getState().hashes()).toEqual(['c']);
  });

  it('selectRange between two hashes inclusive', () => {
    useSelection.getState().selectRange(['a', 'b', 'c', 'd', 'e'], 'b', 'd');
    expect(useSelection.getState().hashes().sort()).toEqual(['b', 'c', 'd']);
  });
});

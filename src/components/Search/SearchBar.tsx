import { useEffect, useState } from 'react';
import { fetchPlugins } from '@/api/search';
import type { SearchPlugin } from '@/api/types';

export function SearchBar({ onStart }: {
  onStart: (pattern: string, plugins: 'enabled' | string[], category: string) => void;
}) {
  const [pattern, setPattern] = useState('');
  const [plugin, setPlugin] = useState<'enabled' | string>('enabled');
  const [category, setCategory] = useState('all');
  const [plugins, setPlugins] = useState<SearchPlugin[]>([]);

  useEffect(() => { fetchPlugins().then(setPlugins).catch(() => {}); }, []);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (pattern.trim()) onStart(pattern, plugin === 'enabled' ? 'enabled' : [plugin], category); }}
      className="flex gap-2 p-3 border-b border-border text-xs items-center"
    >
      <input
        autoFocus
        placeholder="query"
        value={pattern} onChange={(e) => setPattern(e.target.value)}
        className="flex-1 bg-bg3 border border-border2 rounded px-3 py-1.5 text-fg2 focus:outline-none focus:border-accent"
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="bg-bg3 border border-border2 rounded px-3 py-1.5 text-fg2 focus:outline-none focus:border-accent">
        <option value="all">all categories</option>
        <option value="movies">movies</option>
        <option value="tv">tv</option>
        <option value="music">music</option>
        <option value="games">games</option>
        <option value="anime">anime</option>
        <option value="software">software</option>
        <option value="pictures">pictures</option>
        <option value="books">books</option>
      </select>
      <select value={plugin} onChange={(e) => setPlugin(e.target.value)}
              className="bg-bg3 border border-border2 rounded px-3 py-1.5 text-fg2 focus:outline-none focus:border-accent">
        <option value="enabled">all enabled</option>
        {plugins.filter((p) => p.enabled).map((p) => (
          <option key={p.name} value={p.name}>{p.fullName}</option>
        ))}
      </select>
      <button type="submit" className="bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-1.5 rounded font-medium">search</button>
    </form>
  );
}

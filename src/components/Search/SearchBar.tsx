import { useEffect, useState } from 'react';
import { fetchPlugins } from '@/api/search';
import type { SearchPlugin } from '@/api/types';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
      onSubmit={(e) => {
        e.preventDefault();
        if (pattern.trim()) onStart(pattern, plugin === 'enabled' ? 'enabled' : [plugin], category);
      }}
      className="flex gap-2 p-4 border-b border-border-default items-center bg-canvas-subtle"
    >
      <Input
        autoFocus
        placeholder="Search torrents…"
        value={pattern}
        onChange={(e) => setPattern(e.target.value)}
        className="flex-1 text-base"
      />
      <Select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">All categories</option>
        <option value="movies">Movies</option>
        <option value="tv">TV</option>
        <option value="music">Music</option>
        <option value="games">Games</option>
        <option value="anime">Anime</option>
        <option value="software">Software</option>
        <option value="pictures">Pictures</option>
        <option value="books">Books</option>
      </Select>
      <Select value={plugin} onChange={(e) => setPlugin(e.target.value)}>
        <option value="enabled">All enabled</option>
        {plugins.filter((p) => p.enabled).map((p) => (
          <option key={p.name} value={p.name}>{p.fullName}</option>
        ))}
      </Select>
      <Button type="submit" variant="primary">Search</Button>
    </form>
  );
}

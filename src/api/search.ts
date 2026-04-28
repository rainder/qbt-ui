import { apiGet, apiPost } from './client';
import type { SearchPlugin, SearchResult, SearchStatus } from './types';

export interface StartResponse { id: number }

export const startSearch = (pattern: string, plugins: string[] | 'all' | 'enabled', category = 'all') =>
  apiPost<StartResponse>('/search/start', {
    pattern,
    plugins: Array.isArray(plugins) ? plugins.join('|') : plugins,
    category,
  });

export const stopSearch = (id: number) => apiPost('/search/stop', { id });
export const deleteSearch = (id: number) => apiPost('/search/delete', { id });

export const fetchSearchStatus = (id: number) =>
  apiGet<SearchStatus[]>('/search/status', { id });

export interface ResultsResponse {
  results: SearchResult[];
  status: 'Running' | 'Stopped';
  total: number;
}

export const fetchSearchResults = (id: number, offset = 0, limit = 100) =>
  apiGet<ResultsResponse>('/search/results', { id, offset, limit });

export const fetchPlugins = () => apiGet<SearchPlugin[]>('/search/plugins');

export const installPlugin = (sources: string) =>
  apiPost('/search/installPlugin', { sources });

export const uninstallPlugin = (names: string[]) =>
  apiPost('/search/uninstallPlugin', { names: names.join('|') });

export const enablePlugin = (names: string[], enable: boolean) =>
  apiPost('/search/enablePlugin', { names: names.join('|'), enable });

export const updatePlugins = () => apiPost('/search/updatePlugins');

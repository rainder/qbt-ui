# qBittorrent UI Replacement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a terminal-native, keyboard-first SPA that replaces qBittorrent's built-in WebUI by talking to its `/api/v2` Web API.

**Architecture:** Vite-built React SPA. Same-origin in production (served via qBittorrent's "alternative WebUI"); Vite dev proxy in development. Server state via TanStack Query, polled live state via `sync/maindata` diffs. Local UI state via Zustand. No backend of our own.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, TanStack Virtual, Zustand, React Router, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-04-28-qbittorrent-ui-design.md`.

---

## Conventions

- **Package manager:** `npm`. Use `npm test -- --run` for one-shot Vitest runs.
- **TDD:** every behavioral unit (formatters, sync diff, keyboard registry, store reducers, API parsers) gets a failing test first. Pure UI atoms (StatusPill, ProgressBar) get a render-and-snapshot smoke test only.
- **Commits:** at the end of every task. Conventional Commits style (`feat:`, `test:`, `chore:`, `style:`, `refactor:`).
- **Imports:** absolute via `@/...` alias (configured in Task 1).
- **Files:** prefer small, single-responsibility files. Component file exports default plus named subcomponents only when they truly belong together.
- **No `any`:** types must be explicit; use `unknown` + narrowing for parsing.

---

## Task 1: Scaffold project

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `.gitignore`, `src/main.tsx`, `src/App.tsx`

- [ ] **Step 1: Init Vite app**

```bash
npm create vite@latest . -- --template react-ts
# Answer "Yes" if asked about non-empty dir; we'll overwrite.
npm install
```

- [ ] **Step 2: Install runtime deps**

```bash
npm install react-router-dom @tanstack/react-query @tanstack/react-virtual zustand clsx
```

- [ ] **Step 3: Install dev deps**

```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test tailwindcss postcss autoprefixer
```

- [ ] **Step 4: Configure path alias in `tsconfig.json`**

Replace `tsconfig.json` `compilerOptions` section with:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src", "tests"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 5: Configure `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.QBT_URL ?? 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
});
```

- [ ] **Step 6: Add test setup**

Create `tests/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 7: Update `package.json` scripts**

Replace the `"scripts"` block with:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "test": "vitest",
  "test:run": "vitest run",
  "e2e": "playwright test",
  "typecheck": "tsc --noEmit"
}
```

- [ ] **Step 8: Verify build chain**

Run: `npm run typecheck && npm run test:run`
Expected: typecheck passes (no source files yet), Vitest reports "no test files found".

- [ ] **Step 9: Update `.gitignore`**

Append to `.gitignore`:

```
node_modules
dist
.vite
coverage
playwright-report
test-results
.env
.env.local
.superpowers/
```

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TS project"
```

---

## Task 2: Tailwind + theme tokens

**Files:**
- Create: `tailwind.config.ts`, `postcss.config.js`, `src/styles/theme.css`, `src/styles/tailwind.css`
- Modify: `src/main.tsx`, `index.html`

- [ ] **Step 1: Init Tailwind**

```bash
npx tailwindcss init -p
```

This generates `tailwind.config.js` and `postcss.config.js`. Delete `tailwind.config.js`.

- [ ] **Step 2: Write `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0e14',
        bg2: '#0f141b',
        fg: '#b3b1ad',
        fg2: '#e6e1cf',
        muted: '#626a73',
        border: '#1f242c',
        accent: '#59c2ff',
        ok: '#aad94c',
        warn: '#ffb454',
        danger: '#f07178',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: { xs: '11px', sm: '12px', base: '13px', md: '14px', lg: '16px' },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 3: Write `src/styles/theme.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');

:root { color-scheme: dark; }

html, body, #root { height: 100%; }

body {
  margin: 0;
  background: #0a0e14;
  color: #b3b1ad;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  -webkit-font-smoothing: antialiased;
}

* { box-sizing: border-box; }

button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; padding: 0; }

input, select, textarea { font: inherit; color: inherit; }
```

- [ ] **Step 4: Write `src/styles/tailwind.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: Wire styles in `src/main.tsx`**

Replace contents:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/theme.css';
import './styles/tailwind.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 6: Replace `src/App.tsx` with placeholder**

```tsx
export function App() {
  return (
    <div className="p-4">
      <h1 className="text-fg2 text-lg">qbt</h1>
      <p className="text-muted">Loading...</p>
    </div>
  );
}
```

- [ ] **Step 7: Update `index.html` title**

Replace `<title>...` with `<title>qbt</title>` and confirm `<div id="root"></div>` exists.

- [ ] **Step 8: Run dev server briefly to confirm boot**

```bash
npm run build
```
Expected: success, `dist/` produced.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: tailwind theme tokens and base styles"
```

---

## Task 3: Format helpers (TDD)

**Files:**
- Create: `src/lib/format.ts`, `src/lib/format.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/format.test.ts
import { describe, it, expect } from 'vitest';
import { formatBytes, formatSpeed, formatEta, formatRatio } from './format';

describe('formatBytes', () => {
  it('formats zero', () => expect(formatBytes(0)).toBe('0 B'));
  it('formats KB', () => expect(formatBytes(1536)).toBe('1.5 KB'));
  it('formats MB', () => expect(formatBytes(5_242_880)).toBe('5.0 MB'));
  it('formats GB', () => expect(formatBytes(5_368_709_120)).toBe('5.0 GB'));
  it('formats TB', () => expect(formatBytes(1_099_511_627_776)).toBe('1.0 TB'));
  it('handles negative as 0', () => expect(formatBytes(-1)).toBe('0 B'));
});

describe('formatSpeed', () => {
  it('appends /s', () => expect(formatSpeed(1024)).toBe('1.0 KB/s'));
  it('shows dash when zero', () => expect(formatSpeed(0)).toBe('—'));
});

describe('formatEta', () => {
  it('shows ∞ for sentinel', () => expect(formatEta(8_640_000)).toBe('∞'));
  it('shows seconds', () => expect(formatEta(45)).toBe('45s'));
  it('shows minutes', () => expect(formatEta(125)).toBe('2m 5s'));
  it('shows hours', () => expect(formatEta(3725)).toBe('1h 2m'));
  it('shows days', () => expect(formatEta(90061)).toBe('1d 1h'));
});

describe('formatRatio', () => {
  it('two decimals', () => expect(formatRatio(1.234567)).toBe('1.23'));
  it('shows ∞ for -1 sentinel', () => expect(formatRatio(-1)).toBe('∞'));
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/lib/format.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/lib/format.ts`**

```ts
const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${i === 0 ? value.toFixed(0) : value.toFixed(1)} ${UNITS[i]}`;
}

export function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec <= 0) return '—';
  return `${formatBytes(bytesPerSec)}/s`;
}

export function formatEta(seconds: number): string {
  if (seconds >= 8_640_000 || seconds < 0) return '∞';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }
  if (seconds < 86_400) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }
  const d = Math.floor(seconds / 86_400);
  const h = Math.floor((seconds % 86_400) / 3600);
  return `${d}d ${h}h`;
}

export function formatRatio(ratio: number): string {
  if (ratio < 0) return '∞';
  return ratio.toFixed(2);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/lib/format.test.ts`
Expected: 12 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: format helpers for size/speed/eta/ratio"
```

---

## Task 4: API types

**Files:**
- Create: `src/api/types.ts`

- [ ] **Step 1: Write `src/api/types.ts`**

These mirror the qBittorrent Web API. Field names match the API exactly so JSON parses with no remapping.

```ts
export type TorrentState =
  | 'error' | 'missingFiles' | 'uploading' | 'pausedUP' | 'queuedUP'
  | 'stalledUP' | 'checkingUP' | 'forcedUP' | 'allocating' | 'downloading'
  | 'metaDL' | 'pausedDL' | 'queuedDL' | 'stalledDL' | 'checkingDL'
  | 'forcedDL' | 'checkingResumeData' | 'moving' | 'unknown';

export interface Torrent {
  hash: string;
  name: string;
  size: number;
  progress: number;          // 0..1
  dlspeed: number;           // bytes/s
  upspeed: number;           // bytes/s
  priority: number;
  num_seeds: number;
  num_complete: number;
  num_leechs: number;
  num_incomplete: number;
  ratio: number;
  eta: number;               // seconds (8_640_000 == infinity)
  state: TorrentState;
  category: string;
  tags: string;              // comma-separated
  added_on: number;          // unix s
  completion_on: number;
  save_path: string;
  total_size: number;
  amount_left: number;
  uploaded: number;
  downloaded: number;
}

export interface SyncMainData {
  rid: number;
  full_update?: boolean;
  torrents?: Record<string, Partial<Torrent>>;
  torrents_removed?: string[];
  categories?: Record<string, { name: string; savePath: string }>;
  categories_removed?: string[];
  tags?: string[];
  tags_removed?: string[];
  server_state?: Partial<ServerState>;
}

export interface ServerState {
  dl_info_speed: number;
  up_info_speed: number;
  dl_info_data: number;
  up_info_data: number;
  free_space_on_disk: number;
  global_ratio: string;
  alltime_dl: number;
  alltime_ul: number;
  use_alt_speed_limits: boolean;
  connection_status: 'connected' | 'firewalled' | 'disconnected';
}

export interface TorrentFile {
  index: number;
  name: string;
  size: number;
  progress: number;
  priority: number;
  is_seed?: boolean;
}

export interface TorrentPeer {
  ip: string;
  port: number;
  client: string;
  progress: number;
  dl_speed: number;
  up_speed: number;
  flags: string;
  country?: string;
  connection: string;
}

export interface TorrentTracker {
  url: string;
  status: number;
  num_peers: number;
  num_seeds: number;
  num_leeches: number;
  msg: string;
  tier: number;
}

export interface SearchPlugin {
  name: string;
  fullName: string;
  version: string;
  url: string;
  enabled: boolean;
  supportedCategories: { id: string; name: string }[];
}

export interface SearchResult {
  fileName: string;
  fileSize: number;       // -1 if unknown
  fileUrl: string;
  nbLeechers: number;
  nbSeeders: number;
  siteUrl: string;
  descrLink: string;
  pubDate?: number;
}

export interface SearchStatus {
  id: number;
  status: 'Running' | 'Stopped';
  total: number;
}

export type Preferences = Record<string, unknown>;
```

- [ ] **Step 2: Confirm typecheck**

Run: `npm run typecheck`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: qBittorrent API types"
```

---

## Task 5: API client wrapper (TDD)

**Files:**
- Create: `src/api/client.ts`, `src/api/client.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/api/client.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiGet, apiPost, ApiError } from './client';

describe('apiGet', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('returns parsed JSON on 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: 1 }), { status: 200, headers: { 'content-type': 'application/json' } }),
    ));
    expect(await apiGet('/foo')).toEqual({ ok: 1 });
  });

  it('returns text body when not json', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response('Ok.', { status: 200, headers: { 'content-type': 'text/plain' } }),
    ));
    expect(await apiGet('/foo')).toBe('Ok.');
  });

  it('throws ApiError with status on non-2xx', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Forbidden', { status: 403 })));
    await expect(apiGet('/x')).rejects.toMatchObject({ status: 403, message: 'Forbidden' });
  });
});

describe('apiPost', () => {
  it('sends form-urlencoded by default', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('Ok.', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await apiPost('/bar', { a: '1', b: '2' });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v2/bar');
    expect(init.method).toBe('POST');
    expect(init.headers['content-type']).toBe('application/x-www-form-urlencoded');
    expect(init.body).toBe('a=1&b=2');
  });

  it('sends FormData when given one', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('Ok.', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const fd = new FormData();
    fd.append('urls', 'magnet:?xt=...');

    await apiPost('/torrents/add', fd);

    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBeInstanceOf(FormData);
    expect(init.headers).toBeUndefined();
  });
});

describe('ApiError', () => {
  it('preserves status', () => {
    const err = new ApiError(403, 'Forbidden');
    expect(err.status).toBe(403);
    expect(err.message).toBe('Forbidden');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/api/client.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/api/client.ts`**

```ts
const BASE = '/api/v2';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parse(res: Response): Promise<unknown> {
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text || res.statusText);
  }
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export async function apiGet<T = unknown>(path: string, params?: Record<string, string | number>): Promise<T> {
  const qs = params ? '?' + new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ) : '';
  const res = await fetch(`${BASE}${path}${qs}`, { credentials: 'include' });
  return parse(res) as Promise<T>;
}

export async function apiPost<T = unknown>(
  path: string,
  body?: Record<string, string | number | boolean> | FormData,
): Promise<T> {
  let init: RequestInit;
  if (body instanceof FormData) {
    init = { method: 'POST', body, credentials: 'include' };
  } else if (body) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(body)) params.append(k, String(v));
    init = {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      credentials: 'include',
    };
  } else {
    init = { method: 'POST', credentials: 'include' };
  }
  const res = await fetch(`${BASE}${path}`, init);
  return parse(res) as Promise<T>;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/api/client.test.ts`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: api client wrapper"
```

---

## Task 6: Sync diff applier (TDD)

The `sync/maindata` endpoint returns a full snapshot when `rid=0` (or stale), and diffs otherwise. The applier must merge added/changed torrents, remove deleted ones, and reset to a fresh state on `full_update: true`.

**Files:**
- Create: `src/api/sync.ts`, `src/api/sync.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/api/sync.test.ts
import { describe, it, expect } from 'vitest';
import type { SyncMainData, Torrent } from './types';
import { applyDiff, emptyState, type SyncState } from './sync';

const baseTorrent = (over: Partial<Torrent>): Partial<Torrent> => ({
  name: 'x', size: 100, progress: 0, dlspeed: 0, upspeed: 0, state: 'pausedDL', ...over,
});

describe('applyDiff', () => {
  it('initializes from full snapshot', () => {
    const next = applyDiff(emptyState(), {
      rid: 1,
      full_update: true,
      torrents: { abc: baseTorrent({ name: 'a' }) },
      categories: { movies: { name: 'movies', savePath: '/m' } },
      tags: ['linux'],
      server_state: { dl_info_speed: 100, up_info_speed: 50, free_space_on_disk: 1024,
        dl_info_data: 0, up_info_data: 0, global_ratio: '0', alltime_dl: 0, alltime_ul: 0,
        use_alt_speed_limits: false, connection_status: 'connected' },
    });
    expect(next.rid).toBe(1);
    expect(next.torrents.abc?.name).toBe('a');
    expect(next.categories.movies?.savePath).toBe('/m');
    expect(next.tags).toEqual(['linux']);
    expect(next.serverState?.dl_info_speed).toBe(100);
  });

  it('merges incremental torrent updates', () => {
    let s: SyncState = applyDiff(emptyState(), {
      rid: 1, full_update: true,
      torrents: { abc: baseTorrent({ name: 'a', dlspeed: 0 }) },
    });
    s = applyDiff(s, { rid: 2, torrents: { abc: { dlspeed: 1024 } } });
    expect(s.torrents.abc?.name).toBe('a');
    expect(s.torrents.abc?.dlspeed).toBe(1024);
    expect(s.rid).toBe(2);
  });

  it('removes torrents listed in torrents_removed', () => {
    let s = applyDiff(emptyState(), {
      rid: 1, full_update: true, torrents: { abc: baseTorrent({}), def: baseTorrent({}) },
    });
    s = applyDiff(s, { rid: 2, torrents_removed: ['abc'] });
    expect(s.torrents.abc).toBeUndefined();
    expect(s.torrents.def).toBeDefined();
  });

  it('full_update wipes prior state', () => {
    let s = applyDiff(emptyState(), {
      rid: 1, full_update: true, torrents: { old: baseTorrent({}) },
    });
    s = applyDiff(s, { rid: 5, full_update: true, torrents: { fresh: baseTorrent({}) } });
    expect(s.torrents.old).toBeUndefined();
    expect(s.torrents.fresh).toBeDefined();
    expect(s.rid).toBe(5);
  });

  it('removes categories and tags', () => {
    let s = applyDiff(emptyState(), {
      rid: 1, full_update: true,
      categories: { a: { name: 'a', savePath: '' }, b: { name: 'b', savePath: '' } },
      tags: ['x', 'y', 'z'],
    });
    s = applyDiff(s, { rid: 2, categories_removed: ['a'], tags_removed: ['y'] });
    expect(Object.keys(s.categories)).toEqual(['b']);
    expect(s.tags).toEqual(['x', 'z']);
  });

  it('shallow-merges server_state', () => {
    let s = applyDiff(emptyState(), {
      rid: 1, full_update: true,
      server_state: { dl_info_speed: 100, up_info_speed: 50, free_space_on_disk: 0,
        dl_info_data: 0, up_info_data: 0, global_ratio: '0', alltime_dl: 0, alltime_ul: 0,
        use_alt_speed_limits: false, connection_status: 'connected' },
    });
    s = applyDiff(s, { rid: 2, server_state: { dl_info_speed: 999 } });
    expect(s.serverState?.dl_info_speed).toBe(999);
    expect(s.serverState?.up_info_speed).toBe(50);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/api/sync.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/api/sync.ts`**

```ts
import type { SyncMainData, Torrent, ServerState } from './types';

export interface SyncState {
  rid: number;
  torrents: Record<string, Partial<Torrent>>;
  categories: Record<string, { name: string; savePath: string }>;
  tags: string[];
  serverState?: ServerState;
}

export function emptyState(): SyncState {
  return { rid: 0, torrents: {}, categories: {}, tags: [] };
}

export function applyDiff(prev: SyncState, diff: SyncMainData): SyncState {
  const start: SyncState = diff.full_update ? emptyState() : prev;

  const torrents = { ...start.torrents };
  if (diff.torrents) {
    for (const [hash, patch] of Object.entries(diff.torrents)) {
      torrents[hash] = { ...torrents[hash], ...patch };
    }
  }
  if (diff.torrents_removed) {
    for (const hash of diff.torrents_removed) delete torrents[hash];
  }

  const categories = { ...start.categories, ...(diff.categories ?? {}) };
  if (diff.categories_removed) {
    for (const c of diff.categories_removed) delete categories[c];
  }

  let tags = start.tags;
  if (diff.tags) tags = Array.from(new Set([...tags, ...diff.tags]));
  if (diff.tags_removed) tags = tags.filter((t) => !diff.tags_removed!.includes(t));

  const serverState = diff.server_state
    ? ({ ...start.serverState, ...diff.server_state } as ServerState)
    : start.serverState;

  return { rid: diff.rid, torrents, categories, tags, serverState };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/api/sync.test.ts`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: sync diff applier"
```

---

## Task 7: Torrent + auth + prefs endpoints

**Files:**
- Create: `src/api/torrents.ts`, `src/api/auth.ts`, `src/api/prefs.ts`

- [ ] **Step 1: Write `src/api/auth.ts`**

```ts
import { apiPost } from './client';

export async function login(username: string, password: string): Promise<void> {
  const result = await apiPost<string>('/auth/login', { username, password });
  if (typeof result === 'string' && result.trim() !== 'Ok.') {
    throw new Error('Invalid credentials');
  }
}

export async function logout(): Promise<void> {
  await apiPost('/auth/logout');
}
```

- [ ] **Step 2: Write `src/api/torrents.ts`**

```ts
import { apiGet, apiPost } from './client';
import type { SyncMainData, TorrentFile, TorrentPeer, TorrentTracker } from './types';

export const fetchSync = (rid: number) => apiGet<SyncMainData>('/sync/maindata', { rid });

export const pause = (hashes: string[]) => apiPost('/torrents/pause', { hashes: hashes.join('|') });
export const resume = (hashes: string[]) => apiPost('/torrents/resume', { hashes: hashes.join('|') });
export const recheck = (hashes: string[]) => apiPost('/torrents/recheck', { hashes: hashes.join('|') });
export const reannounce = (hashes: string[]) => apiPost('/torrents/reannounce', { hashes: hashes.join('|') });

export const remove = (hashes: string[], deleteFiles: boolean) =>
  apiPost('/torrents/delete', { hashes: hashes.join('|'), deleteFiles });

export const setCategory = (hashes: string[], category: string) =>
  apiPost('/torrents/setCategory', { hashes: hashes.join('|'), category });

export const addTags = (hashes: string[], tags: string[]) =>
  apiPost('/torrents/addTags', { hashes: hashes.join('|'), tags: tags.join(',') });

export const removeTags = (hashes: string[], tags: string[]) =>
  apiPost('/torrents/removeTags', { hashes: hashes.join('|'), tags: tags.join(',') });

export const createCategory = (name: string, savePath = '') =>
  apiPost('/torrents/createCategory', { category: name, savePath });

export const fetchFiles = (hash: string) => apiGet<TorrentFile[]>('/torrents/files', { hash });
export const fetchPeers = (hash: string) =>
  apiGet<{ peers: Record<string, TorrentPeer> }>('/sync/torrentPeers', { hash, rid: 0 });
export const fetchTrackers = (hash: string) => apiGet<TorrentTracker[]>('/torrents/trackers', { hash });

export interface AddTorrentInput {
  files?: File[];
  urls?: string;          // newline-separated magnet/HTTP URLs
  category?: string;
  tags?: string;
  savepath?: string;
  paused?: boolean;
}

export async function addTorrent(input: AddTorrentInput): Promise<void> {
  const fd = new FormData();
  if (input.files) for (const f of input.files) fd.append('torrents', f, f.name);
  if (input.urls) fd.append('urls', input.urls);
  if (input.category) fd.append('category', input.category);
  if (input.tags) fd.append('tags', input.tags);
  if (input.savepath) fd.append('savepath', input.savepath);
  if (input.paused !== undefined) fd.append('paused', String(input.paused));
  await apiPost('/torrents/add', fd);
}
```

- [ ] **Step 3: Write `src/api/prefs.ts`**

```ts
import { apiGet, apiPost } from './client';
import type { Preferences } from './types';

export const fetchPrefs = () => apiGet<Preferences>('/app/preferences');

export const setPrefs = (patch: Preferences) =>
  apiPost('/app/setPreferences', { json: JSON.stringify(patch) });

export const fetchVersion = () => apiGet<string>('/app/version');
```

- [ ] **Step 4: Confirm typecheck**

Run: `npm run typecheck`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: auth/torrents/prefs API endpoints"
```

---

## Task 8: Search endpoints

**Files:**
- Create: `src/api/search.ts`

- [ ] **Step 1: Write `src/api/search.ts`**

```ts
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
```

- [ ] **Step 2: Confirm typecheck**

Run: `npm run typecheck`
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: search and plugin endpoints"
```

---

## Task 9: Keyboard registry (TDD)

The registry stores bindings keyed by context (`global` | `list` | `modal`). Resolution: when a key is pressed, the handler walks `[currentContext, 'global']` until it finds a match. Modal context overrides everything (no global escape needed in modals beyond what bindings define).

**Files:**
- Create: `src/keyboard/registry.ts`, `src/keyboard/registry.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/keyboard/registry.test.ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/keyboard/registry.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/keyboard/registry.ts`**

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/keyboard/registry.test.ts`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: keyboard binding registry"
```

---

## Task 10: Keyboard handler

The handler attaches a single `keydown` listener to `document`, accumulates key sequences with a 600 ms reset timeout, ignores keys typed in `input`/`textarea`/`contenteditable`, and dispatches the matching binding. The current context comes from a callback (lets the UI swap context as modals open).

**Files:**
- Create: `src/keyboard/handler.ts`, `src/keyboard/handler.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/keyboard/handler.test.ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- src/keyboard/handler.test.ts`
Expected: FAIL — `attachHandler` not defined.

- [ ] **Step 3: Implement `src/keyboard/handler.ts`**

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- src/keyboard/handler.test.ts`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: keyboard handler with sequence support"
```

---

## Task 11: Zustand stores

**Files:**
- Create: `src/stores/selection.ts`, `src/stores/ui.ts`, `src/stores/selection.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/stores/selection.test.ts
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
```

- [ ] **Step 2: Implement `src/stores/selection.ts`**

```ts
import { create } from 'zustand';

interface SelectionState {
  selected: Set<string>;
  toggle(hash: string): void;
  selectOnly(hash: string): void;
  selectRange(ordered: string[], from: string, to: string): void;
  has(hash: string): boolean;
  hashes(): string[];
  clear(): void;
}

export const useSelection = create<SelectionState>((set, get) => ({
  selected: new Set(),
  toggle(hash) {
    const next = new Set(get().selected);
    if (next.has(hash)) next.delete(hash); else next.add(hash);
    set({ selected: next });
  },
  selectOnly(hash) { set({ selected: new Set([hash]) }); },
  selectRange(ordered, from, to) {
    const i = ordered.indexOf(from);
    const j = ordered.indexOf(to);
    if (i < 0 || j < 0) return;
    const [lo, hi] = i < j ? [i, j] : [j, i];
    set({ selected: new Set(ordered.slice(lo, hi + 1)) });
  },
  has(hash) { return get().selected.has(hash); },
  hashes() { return Array.from(get().selected); },
  clear() { set({ selected: new Set() }); },
}));
```

- [ ] **Step 3: Run selection tests**

Run: `npm run test:run -- src/stores/selection.test.ts`
Expected: 3 passed.

- [ ] **Step 4: Implement `src/stores/ui.ts`**

```ts
import { create } from 'zustand';

export type SortKey = 'name' | 'size' | 'progress' | 'dlspeed' | 'upspeed' | 'eta' | 'added_on' | 'ratio';
export type SortDir = 'asc' | 'desc';
export type StatusFilter = 'all' | 'downloading' | 'seeding' | 'paused' | 'completed' | 'active' | 'inactive' | 'errored';

interface UiState {
  filterStatus: StatusFilter;
  filterCategory: string | null;
  filterTag: string | null;
  filterText: string;
  sortKey: SortKey;
  sortDir: SortDir;
  detailsOpen: boolean;
  activeHash: string | null;
  activeModal: 'add' | 'delete' | 'category' | 'tags' | 'help' | null;

  setStatus(s: StatusFilter): void;
  setCategory(c: string | null): void;
  setTag(t: string | null): void;
  setFilterText(s: string): void;
  setSort(key: SortKey): void;
  openDetails(hash: string): void;
  closeDetails(): void;
  openModal(m: UiState['activeModal']): void;
}

export const useUi = create<UiState>((set, get) => ({
  filterStatus: 'all',
  filterCategory: null,
  filterTag: null,
  filterText: '',
  sortKey: 'added_on',
  sortDir: 'desc',
  detailsOpen: false,
  activeHash: null,
  activeModal: null,

  setStatus(s) { set({ filterStatus: s }); },
  setCategory(c) { set({ filterCategory: c }); },
  setTag(t) { set({ filterTag: t }); },
  setFilterText(s) { set({ filterText: s }); },
  setSort(key) {
    const { sortKey, sortDir } = get();
    set(sortKey === key
      ? { sortDir: sortDir === 'asc' ? 'desc' : 'asc' }
      : { sortKey: key, sortDir: 'desc' });
  },
  openDetails(hash) { set({ detailsOpen: true, activeHash: hash }); },
  closeDetails() { set({ detailsOpen: false }); },
  openModal(m) { set({ activeModal: m }); },
}));
```

- [ ] **Step 5: Confirm typecheck and commit**

Run: `npm run typecheck && npm run test:run`
Expected: pass.

```bash
git add -A
git commit -m "feat: selection and ui zustand stores"
```

---

## Task 12: useSync hook

**Files:**
- Create: `src/hooks/useSync.ts`, `src/hooks/useStats.ts`

- [ ] **Step 1: Write `src/hooks/useSync.ts`**

```ts
import { useEffect, useRef, useState } from 'react';
import { fetchSync } from '@/api/torrents';
import { applyDiff, emptyState, type SyncState } from '@/api/sync';
import { ApiError } from '@/api/client';

const POLL_INTERVAL_MS = 1500;
const BACKOFF_MAX_MS = 10_000;

export function useSync() {
  const [state, setState] = useState<SyncState>(emptyState());
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let cancelled = false;
    let backoff = POLL_INTERVAL_MS;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      if (document.hidden) {
        timer = setTimeout(tick, POLL_INTERVAL_MS);
        return;
      }
      try {
        const diff = await fetchSync(stateRef.current.rid);
        if (cancelled) return;
        setState((prev) => applyDiff(prev, diff));
        setError(null);
        backoff = POLL_INTERVAL_MS;
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          setAuthError(true);
          return;
        }
        setError(err instanceof Error ? err.message : String(err));
        backoff = Math.min(backoff * 2, BACKOFF_MAX_MS);
      }
      timer = setTimeout(tick, backoff);
    };

    void tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return { state, error, authError };
}
```

- [ ] **Step 2: Write `src/hooks/useStats.ts`**

```ts
import type { ServerState } from '@/api/types';

export function useStats(serverState: ServerState | undefined) {
  return {
    dlSpeed: serverState?.dl_info_speed ?? 0,
    upSpeed: serverState?.up_info_speed ?? 0,
    ratio: parseFloat(serverState?.global_ratio ?? '0') || 0,
    freeSpace: serverState?.free_space_on_disk ?? 0,
    altRate: serverState?.use_alt_speed_limits ?? false,
    connection: serverState?.connection_status ?? 'disconnected',
  };
}
```

- [ ] **Step 3: Confirm typecheck**

Run: `npm run typecheck`
Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: useSync polling hook and useStats derivator"
```

---

## Task 13: Routing + auth guard

**Files:**
- Modify: `src/App.tsx`
- Create: `src/pages/LoginPage.tsx`, `src/pages/TorrentListPage.tsx`, `src/pages/SearchPage.tsx`, `src/pages/SettingsPage.tsx`, `src/components/AuthGate.tsx`

- [ ] **Step 1: Create stubs for the four pages**

Create `src/pages/TorrentListPage.tsx`:

```tsx
export default function TorrentListPage() {
  return <div className="p-4">Torrents</div>;
}
```

Create `src/pages/SearchPage.tsx`:

```tsx
export default function SearchPage() {
  return <div className="p-4">Search</div>;
}
```

Create `src/pages/SettingsPage.tsx`:

```tsx
export default function SettingsPage() {
  return <div className="p-4">Settings</div>;
}
```

- [ ] **Step 2: Implement `src/pages/LoginPage.tsx`**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/api/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(username, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid place-items-center min-h-screen">
      <form onSubmit={onSubmit} className="w-80 border border-border p-6 space-y-3 bg-bg2">
        <div className="text-fg2 text-lg">qbt / login</div>
        <label className="block text-xs text-muted">USERNAME
          <input
            className="block w-full mt-1 border border-border bg-bg px-2 py-1 text-fg2"
            value={username} onChange={(e) => setUsername(e.target.value)}
            autoFocus required
          />
        </label>
        <label className="block text-xs text-muted">PASSWORD
          <input
            type="password"
            className="block w-full mt-1 border border-border bg-bg px-2 py-1 text-fg2"
            value={password} onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <div className="text-danger text-xs">{error}</div>}
        <button
          type="submit" disabled={busy}
          className="w-full border border-accent text-accent px-2 py-1 disabled:opacity-50"
        >{busy ? '...' : 'Connect'}</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Implement `src/components/AuthGate.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { fetchVersion } from '@/api/prefs';

type Status = 'checking' | 'authed' | 'unauthed';

export function AuthGate() {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    fetchVersion()
      .then(() => setStatus('authed'))
      .catch(() => setStatus('unauthed'));
  }, []);

  if (status === 'checking') return <div className="p-4 text-muted">checking session...</div>;
  if (status === 'unauthed') return <Navigate to="/login" replace />;
  return <Outlet />;
}
```

- [ ] **Step 4: Wire routing in `src/App.tsx`**

Replace contents:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthGate } from './components/AuthGate';
import LoginPage from './pages/LoginPage';
import TorrentListPage from './pages/TorrentListPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 5_000, retry: false } },
});

export function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AuthGate />}>
            <Route path="/" element={<TorrentListPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/settings/*" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 5: Build to verify**

Run: `npm run build`
Expected: success.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: routing, login page, auth gate"
```

---

## Task 14: Status pill and progress bar

**Files:**
- Create: `src/components/List/StatusPill.tsx`, `src/components/List/ProgressBar.tsx`, `src/components/List/StatusPill.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/List/StatusPill.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusPill } from './StatusPill';

describe('StatusPill', () => {
  it('renders DL for downloading', () => {
    render(<StatusPill state="downloading" />);
    expect(screen.getByText('DL')).toBeInTheDocument();
  });
  it('renders SE for stalledUP', () => {
    render(<StatusPill state="stalledUP" />);
    expect(screen.getByText('SE')).toBeInTheDocument();
  });
  it('renders PA for pausedDL', () => {
    render(<StatusPill state="pausedDL" />);
    expect(screen.getByText('PA')).toBeInTheDocument();
  });
  it('renders ER for error', () => {
    render(<StatusPill state="error" />);
    expect(screen.getByText('ER')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement `src/components/List/StatusPill.tsx`**

```tsx
import type { TorrentState } from '@/api/types';

const MAP: Record<TorrentState, { label: string; cls: string }> = {
  downloading:        { label: 'DL', cls: 'border-accent text-accent' },
  forcedDL:           { label: 'DL', cls: 'border-accent text-accent' },
  metaDL:             { label: 'MD', cls: 'border-accent text-accent' },
  stalledDL:          { label: 'DL', cls: 'border-muted text-muted' },
  queuedDL:           { label: 'QU', cls: 'border-muted text-muted' },
  checkingDL:         { label: 'CK', cls: 'border-warn text-warn' },
  uploading:          { label: 'SE', cls: 'border-ok text-ok' },
  forcedUP:           { label: 'SE', cls: 'border-ok text-ok' },
  stalledUP:          { label: 'SE', cls: 'border-muted text-muted' },
  queuedUP:           { label: 'QU', cls: 'border-muted text-muted' },
  checkingUP:         { label: 'CK', cls: 'border-warn text-warn' },
  pausedDL:           { label: 'PA', cls: 'border-muted text-muted' },
  pausedUP:           { label: 'PA', cls: 'border-muted text-muted' },
  allocating:         { label: 'AL', cls: 'border-warn text-warn' },
  moving:             { label: 'MV', cls: 'border-warn text-warn' },
  checkingResumeData: { label: 'CK', cls: 'border-warn text-warn' },
  missingFiles:       { label: 'MS', cls: 'border-danger text-danger' },
  error:              { label: 'ER', cls: 'border-danger text-danger' },
  unknown:            { label: '??', cls: 'border-muted text-muted' },
};

export function StatusPill({ state }: { state: TorrentState }) {
  const { label, cls } = MAP[state] ?? MAP.unknown;
  return (
    <span className={`inline-block border px-1 text-[10px] leading-4 ${cls}`}>
      {label}
    </span>
  );
}
```

- [ ] **Step 3: Implement `src/components/List/ProgressBar.tsx`**

```tsx
export function ProgressBar({ value, complete }: { value: number; complete?: boolean }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="w-24 h-1.5 bg-border" aria-label="progress" role="progressbar"
         aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={`h-full ${complete ? 'bg-ok' : 'bg-accent'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run pill test**

Run: `npm run test:run -- src/components/List/StatusPill.test.tsx`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: StatusPill and ProgressBar atoms"
```

---

## Task 15: Torrent list (filter, sort, virtualize)

**Files:**
- Create: `src/lib/listOps.ts`, `src/lib/listOps.test.ts`, `src/components/List/TorrentTable.tsx`, `src/components/List/TorrentRow.tsx`, `src/components/List/ColumnHeader.tsx`
- Modify: `src/pages/TorrentListPage.tsx`

- [ ] **Step 1: Write list ops tests**

```ts
// src/lib/listOps.test.ts
import { describe, it, expect } from 'vitest';
import type { Torrent } from '@/api/types';
import { filterTorrents, sortTorrents } from './listOps';

const T = (over: Partial<Torrent>): Partial<Torrent> => ({
  hash: 'h', name: 'x', size: 100, progress: 0.5, dlspeed: 0, upspeed: 0,
  state: 'pausedDL', category: '', tags: '', added_on: 0, ratio: 0, eta: 0, ...over,
});

describe('filterTorrents', () => {
  const data: Record<string, Partial<Torrent>> = {
    a: T({ hash: 'a', name: 'ubuntu', state: 'downloading', category: 'iso', tags: 'linux' }),
    b: T({ hash: 'b', name: 'arch',   state: 'pausedDL',    category: 'iso', tags: 'linux' }),
    c: T({ hash: 'c', name: 'movie',  state: 'uploading',   category: 'films', tags: '' }),
  };

  it('all returns everything', () => {
    expect(filterTorrents(data, { status: 'all', category: null, tag: null, text: '' })).toHaveLength(3);
  });
  it('downloading status', () => {
    expect(filterTorrents(data, { status: 'downloading', category: null, tag: null, text: '' })
      .map((t) => t.hash)).toEqual(['a']);
  });
  it('paused status includes pausedDL and pausedUP', () => {
    expect(filterTorrents(data, { status: 'paused', category: null, tag: null, text: '' })
      .map((t) => t.hash)).toEqual(['b']);
  });
  it('text filter is case-insensitive substring', () => {
    expect(filterTorrents(data, { status: 'all', category: null, tag: null, text: 'BUN' })
      .map((t) => t.hash)).toEqual(['a']);
  });
  it('category filter', () => {
    expect(filterTorrents(data, { status: 'all', category: 'films', tag: null, text: '' })
      .map((t) => t.hash)).toEqual(['c']);
  });
  it('tag filter (substring on comma-separated)', () => {
    expect(filterTorrents(data, { status: 'all', category: null, tag: 'linux', text: '' })
      .map((t) => t.hash).sort()).toEqual(['a', 'b']);
  });
});

describe('sortTorrents', () => {
  const data = [T({ hash: 'a', name: 'b' }), T({ hash: 'b', name: 'a' }), T({ hash: 'c', name: 'c' })];
  it('asc by name', () => {
    expect(sortTorrents(data, 'name', 'asc').map((t) => t.hash)).toEqual(['b', 'a', 'c']);
  });
  it('desc by name', () => {
    expect(sortTorrents(data, 'name', 'desc').map((t) => t.hash)).toEqual(['c', 'a', 'b']);
  });
});
```

- [ ] **Step 2: Implement `src/lib/listOps.ts`**

```ts
import type { Torrent } from '@/api/types';
import type { SortKey, SortDir, StatusFilter } from '@/stores/ui';

export interface FilterArgs {
  status: StatusFilter;
  category: string | null;
  tag: string | null;
  text: string;
}

const STATUS_GROUPS: Record<Exclude<StatusFilter, 'all'>, Torrent['state'][]> = {
  downloading: ['downloading', 'forcedDL', 'metaDL', 'stalledDL', 'queuedDL', 'checkingDL', 'allocating'],
  seeding:     ['uploading', 'forcedUP', 'stalledUP', 'queuedUP', 'checkingUP'],
  paused:      ['pausedDL', 'pausedUP'],
  completed:   ['uploading', 'forcedUP', 'stalledUP', 'pausedUP', 'queuedUP'],
  active:      ['downloading', 'forcedDL', 'uploading', 'forcedUP', 'metaDL'],
  inactive:    ['pausedDL', 'pausedUP', 'stalledDL', 'stalledUP', 'queuedDL', 'queuedUP'],
  errored:     ['error', 'missingFiles'],
};

export function filterTorrents(
  torrents: Record<string, Partial<Torrent>>,
  f: FilterArgs,
): Partial<Torrent>[] {
  const text = f.text.trim().toLowerCase();
  return Object.values(torrents).filter((t) => {
    if (f.status !== 'all') {
      const states = STATUS_GROUPS[f.status];
      if (!t.state || !states.includes(t.state)) return false;
    }
    if (f.category && t.category !== f.category) return false;
    if (f.tag) {
      const tags = (t.tags ?? '').split(',').map((s) => s.trim());
      if (!tags.includes(f.tag)) return false;
    }
    if (text && !(t.name ?? '').toLowerCase().includes(text)) return false;
    return true;
  });
}

export function sortTorrents(rows: Partial<Torrent>[], key: SortKey, dir: SortDir): Partial<Torrent>[] {
  const factor = dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a[key]; const bv = b[key];
    if (av === undefined && bv === undefined) return 0;
    if (av === undefined) return 1;
    if (bv === undefined) return -1;
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
    return String(av).localeCompare(String(bv)) * factor;
  });
}
```

- [ ] **Step 3: Run list ops tests**

Run: `npm run test:run -- src/lib/listOps.test.ts`
Expected: 8 passed.

- [ ] **Step 4: Implement `src/components/List/ColumnHeader.tsx`**

```tsx
import { useUi, type SortKey } from '@/stores/ui';
import clsx from 'clsx';

const COLS: { key: SortKey; label: string; width: string; align?: string }[] = [
  { key: 'name',     label: 'name',     width: 'flex-1' },
  { key: 'size',     label: 'size',     width: 'w-20', align: 'text-right' },
  { key: 'progress', label: 'progress', width: 'w-28' },
  { key: 'dlspeed',  label: '↓',        width: 'w-20', align: 'text-right' },
  { key: 'upspeed',  label: '↑',        width: 'w-20', align: 'text-right' },
  { key: 'eta',      label: 'eta',      width: 'w-16', align: 'text-right' },
  { key: 'ratio',    label: 'ratio',    width: 'w-14', align: 'text-right' },
];

export function ColumnHeader() {
  const { sortKey, sortDir, setSort } = useUi();
  return (
    <div className="flex items-center gap-3 px-3 h-7 border-b border-border text-xs uppercase tracking-wide text-muted">
      <div className="w-8" />
      {COLS.map((c) => (
        <button
          key={c.key} onClick={() => setSort(c.key)}
          className={clsx(c.width, c.align, 'truncate text-left hover:text-fg2',
            sortKey === c.key && 'text-fg2')}
        >
          {c.label}{sortKey === c.key && (sortDir === 'asc' ? ' ▲' : ' ▼')}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Implement `src/components/List/TorrentRow.tsx`**

```tsx
import type { Torrent } from '@/api/types';
import { StatusPill } from './StatusPill';
import { ProgressBar } from './ProgressBar';
import { formatBytes, formatSpeed, formatEta, formatRatio } from '@/lib/format';
import clsx from 'clsx';

export function TorrentRow({
  t, selected, active, onClick, onDouble,
}: {
  t: Partial<Torrent>;
  selected: boolean;
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDouble: () => void;
}) {
  return (
    <div
      onClick={onClick}
      onDoubleClick={onDouble}
      className={clsx(
        'flex items-center gap-3 px-3 h-7 border-b border-dotted border-border cursor-default',
        selected ? 'bg-bg2 text-fg2' : 'hover:bg-bg2',
        active && 'outline outline-1 -outline-offset-1 outline-accent',
      )}
    >
      <StatusPill state={t.state ?? 'unknown'} />
      <div className="flex-1 truncate">{t.name}</div>
      <div className="w-20 text-right">{formatBytes(t.size ?? 0)}</div>
      <div className="w-28"><ProgressBar value={t.progress ?? 0} complete={(t.progress ?? 0) >= 1} /></div>
      <div className="w-20 text-right">{formatSpeed(t.dlspeed ?? 0)}</div>
      <div className="w-20 text-right">{formatSpeed(t.upspeed ?? 0)}</div>
      <div className="w-16 text-right">{formatEta(t.eta ?? -1)}</div>
      <div className="w-14 text-right">{formatRatio(t.ratio ?? 0)}</div>
    </div>
  );
}
```

- [ ] **Step 6: Implement `src/components/List/TorrentTable.tsx`**

```tsx
import { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Torrent } from '@/api/types';
import { TorrentRow } from './TorrentRow';
import { ColumnHeader } from './ColumnHeader';
import { useSelection } from '@/stores/selection';
import { useUi } from '@/stores/ui';
import { filterTorrents, sortTorrents } from '@/lib/listOps';

export function TorrentTable({ torrents }: { torrents: Record<string, Partial<Torrent>> }) {
  const { filterStatus, filterCategory, filterTag, filterText, sortKey, sortDir, openDetails, activeHash } = useUi();
  const { has, selectOnly, toggle } = useSelection();

  const rows = useMemo(() => {
    const filtered = filterTorrents(torrents, {
      status: filterStatus, category: filterCategory, tag: filterTag, text: filterText,
    });
    return sortTorrents(filtered, sortKey, sortDir);
  }, [torrents, filterStatus, filterCategory, filterTag, filterText, sortKey, sortDir]);

  const parentRef = useRef<HTMLDivElement>(null);
  const v = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28,
    overscan: 16,
  });

  return (
    <div className="flex flex-col h-full">
      <ColumnHeader />
      <div ref={parentRef} className="flex-1 overflow-auto" data-testid="torrent-list">
        <div style={{ height: v.getTotalSize(), position: 'relative' }}>
          {v.getVirtualItems().map((vi) => {
            const t = rows[vi.index];
            const hash = t.hash!;
            return (
              <div key={hash} style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                transform: `translateY(${vi.start}px)`,
              }}>
                <TorrentRow
                  t={t}
                  selected={has(hash)}
                  active={activeHash === hash}
                  onClick={(e) => (e.metaKey || e.ctrlKey ? toggle(hash) : selectOnly(hash))}
                  onDouble={() => openDetails(hash)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Wire into `src/pages/TorrentListPage.tsx`**

```tsx
import { useSync } from '@/hooks/useSync';
import { TorrentTable } from '@/components/List/TorrentTable';
import { Navigate } from 'react-router-dom';

export default function TorrentListPage() {
  const { state, error, authError } = useSync();
  if (authError) return <Navigate to="/login" replace />;

  return (
    <div className="h-screen flex flex-col">
      <div className="px-3 h-11 border-b border-border flex items-center text-fg2">qbt</div>
      <div className="flex-1 min-h-0">
        <TorrentTable torrents={state.torrents} />
      </div>
      {error && <div className="border-t border-danger text-danger px-3 py-1 text-xs">{error}</div>}
    </div>
  );
}
```

- [ ] **Step 8: Build and commit**

Run: `npm run build`
Expected: success.

```bash
git add -A
git commit -m "feat: torrent table with filter, sort, virtualization"
```

---

## Task 16: Top bar with global stats

**Files:**
- Create: `src/components/Layout/TopBar.tsx`
- Modify: `src/pages/TorrentListPage.tsx`

- [ ] **Step 1: Implement `src/components/Layout/TopBar.tsx`**

```tsx
import { Link, useLocation } from 'react-router-dom';
import type { ServerState } from '@/api/types';
import { useStats } from '@/hooks/useStats';
import { useUi } from '@/stores/ui';
import { formatBytes, formatSpeed, formatRatio } from '@/lib/format';

export function TopBar({ serverState }: { serverState?: ServerState }) {
  const stats = useStats(serverState);
  const { openModal, setFilterText, filterText } = useUi();
  const loc = useLocation();
  return (
    <div className="h-11 border-b border-border flex items-center gap-4 px-3 text-fg">
      <div className="text-fg2">qbt</div>
      <div className="text-muted">|</div>
      <Stat label="↓" value={formatSpeed(stats.dlSpeed)} />
      <Stat label="↑" value={formatSpeed(stats.upSpeed)} />
      <Stat label="ratio" value={formatRatio(stats.ratio)} />
      <Stat label="free" value={formatBytes(stats.freeSpace)} />
      <div className="flex-1" />
      <input
        value={filterText} onChange={(e) => setFilterText(e.target.value)}
        placeholder="/ filter"
        className="border border-border bg-bg px-2 py-0.5 text-xs w-48"
      />
      <button onClick={() => openModal('add')}
              className="border border-accent text-accent px-2 py-0.5 text-xs">+ add</button>
      <Link to="/search" className={navCls(loc.pathname === '/search')}>search</Link>
      <Link to="/settings" className={navCls(loc.pathname.startsWith('/settings'))}>settings</Link>
      <button onClick={() => openModal('help')} className="text-muted hover:text-fg2 text-xs">?</button>
    </div>
  );
}

function navCls(active: boolean) {
  return `px-2 py-0.5 text-xs ${active ? 'text-fg2 border-b border-accent' : 'text-muted hover:text-fg2'}`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-xs">
      <span className="text-muted">{label}</span>{' '}
      <span className="text-fg2">{value}</span>
    </div>
  );
}
```

- [ ] **Step 2: Wire TopBar into `src/pages/TorrentListPage.tsx`**

Replace contents:

```tsx
import { useSync } from '@/hooks/useSync';
import { TorrentTable } from '@/components/List/TorrentTable';
import { TopBar } from '@/components/Layout/TopBar';
import { Navigate } from 'react-router-dom';

export default function TorrentListPage() {
  const { state, error, authError } = useSync();
  if (authError) return <Navigate to="/login" replace />;

  return (
    <div className="h-screen flex flex-col">
      <TopBar serverState={state.serverState} />
      <div className="flex-1 min-h-0">
        <TorrentTable torrents={state.torrents} />
      </div>
      {error && <div className="border-t border-danger text-danger px-3 py-1 text-xs">{error}</div>}
    </div>
  );
}
```

- [ ] **Step 3: Build and commit**

Run: `npm run build`
Expected: success.

```bash
git add -A
git commit -m "feat: TopBar with global stats and nav"
```

---

## Task 17: Sidebar (status, categories, tags)

**Files:**
- Create: `src/components/Layout/Sidebar.tsx`
- Modify: `src/pages/TorrentListPage.tsx`

- [ ] **Step 1: Implement `src/components/Layout/Sidebar.tsx`**

```tsx
import { useMemo } from 'react';
import type { Torrent } from '@/api/types';
import { useUi, type StatusFilter } from '@/stores/ui';
import clsx from 'clsx';
import { filterTorrents } from '@/lib/listOps';

const STATUSES: { key: StatusFilter; label: string }[] = [
  { key: 'all',         label: 'all' },
  { key: 'downloading', label: 'downloading' },
  { key: 'seeding',     label: 'seeding' },
  { key: 'completed',   label: 'completed' },
  { key: 'paused',      label: 'paused' },
  { key: 'active',      label: 'active' },
  { key: 'inactive',    label: 'inactive' },
  { key: 'errored',     label: 'errored' },
];

export function Sidebar({
  torrents, categories, tags,
}: {
  torrents: Record<string, Partial<Torrent>>;
  categories: Record<string, { name: string; savePath: string }>;
  tags: string[];
}) {
  const { filterStatus, setStatus, filterCategory, setCategory, filterTag, setTag } = useUi();

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: 0, downloading: 0, seeding: 0, completed: 0,
      paused: 0, active: 0, inactive: 0, errored: 0,
    };
    for (const k of Object.keys(c) as StatusFilter[]) {
      c[k] = filterTorrents(torrents, { status: k, category: null, tag: null, text: '' }).length;
    }
    return c;
  }, [torrents]);

  return (
    <div className="w-48 border-r border-border h-full overflow-auto py-2 text-xs">
      <Section label="STATUS">
        {STATUSES.map((s) => (
          <Row key={s.key} active={filterStatus === s.key}
               onClick={() => setStatus(s.key)} count={counts[s.key]}>
            {s.label}
          </Row>
        ))}
      </Section>

      <Section label="CATEGORIES">
        <Row active={filterCategory === null} onClick={() => setCategory(null)}>(none)</Row>
        {Object.values(categories).map((c) => (
          <Row key={c.name} active={filterCategory === c.name} onClick={() => setCategory(c.name)}>
            {c.name || '(uncategorized)'}
          </Row>
        ))}
      </Section>

      <Section label="TAGS">
        <Row active={filterTag === null} onClick={() => setTag(null)}>(none)</Row>
        {tags.map((t) => (
          <Row key={t} active={filterTag === t} onClick={() => setTag(t)}>#{t}</Row>
        ))}
      </Section>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="px-3 mb-1 text-muted uppercase tracking-wide">{label}</div>
      {children}
    </div>
  );
}

function Row({ children, active, onClick, count }: {
  children: React.ReactNode; active: boolean; onClick: () => void; count?: number;
}) {
  return (
    <button onClick={onClick}
      className={clsx('w-full text-left px-3 py-0.5 flex justify-between gap-2',
        active ? 'bg-bg2 text-fg2' : 'text-fg hover:bg-bg2')}>
      <span className="truncate">{children}</span>
      {count !== undefined && <span className="text-muted">{count}</span>}
    </button>
  );
}
```

- [ ] **Step 2: Wire into `src/pages/TorrentListPage.tsx`**

Replace contents:

```tsx
import { useSync } from '@/hooks/useSync';
import { TorrentTable } from '@/components/List/TorrentTable';
import { TopBar } from '@/components/Layout/TopBar';
import { Sidebar } from '@/components/Layout/Sidebar';
import { Navigate } from 'react-router-dom';

export default function TorrentListPage() {
  const { state, error, authError } = useSync();
  if (authError) return <Navigate to="/login" replace />;

  return (
    <div className="h-screen flex flex-col">
      <TopBar serverState={state.serverState} />
      <div className="flex-1 min-h-0 flex">
        <Sidebar torrents={state.torrents} categories={state.categories} tags={state.tags} />
        <div className="flex-1 min-w-0">
          <TorrentTable torrents={state.torrents} />
        </div>
      </div>
      {error && <div className="border-t border-danger text-danger px-3 py-1 text-xs">{error}</div>}
    </div>
  );
}
```

- [ ] **Step 3: Build and commit**

Run: `npm run build`
Expected: success.

```bash
git add -A
git commit -m "feat: Sidebar with status/category/tag filters"
```

---

## Task 18: Modal shell + Add Torrent modal

**Files:**
- Create: `src/components/Modals/Modal.tsx`, `src/components/Modals/AddTorrent.tsx`

- [ ] **Step 1: Implement `src/components/Modals/Modal.tsx`**

```tsx
import { useEffect } from 'react';
import { useUi } from '@/stores/ui';

export function Modal({ title, children, onClose }: {
  title: string; children: React.ReactNode; onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60" onClick={onClose}>
      <div className="bg-bg2 border border-border min-w-96 max-w-2xl"
           onClick={(e) => e.stopPropagation()}>
        <div className="px-3 h-7 border-b border-border flex items-center justify-between text-fg2">
          <span>{title}</span>
          <button onClick={onClose} className="text-muted hover:text-fg2">[esc]</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export function useCloseModal() {
  const openModal = useUi((s) => s.openModal);
  return () => openModal(null);
}
```

- [ ] **Step 2: Implement `src/components/Modals/AddTorrent.tsx`**

```tsx
import { useState } from 'react';
import { Modal, useCloseModal } from './Modal';
import { addTorrent } from '@/api/torrents';

export function AddTorrent({ initialUrl = '', categories }: {
  initialUrl?: string;
  categories: string[];
}) {
  const close = useCloseModal();
  const [urls, setUrls] = useState(initialUrl);
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [paused, setPaused] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await addTorrent({
        urls: urls.trim() || undefined,
        files: files.length ? files : undefined,
        category: category || undefined,
        tags: tags || undefined,
        paused,
      });
      close();
    } catch (x) {
      setErr(x instanceof Error ? x.message : String(x));
    } finally { setBusy(false); }
  }

  return (
    <Modal title="add torrent" onClose={close}>
      <form onSubmit={submit} className="space-y-3 text-xs w-[28rem]">
        <label className="block text-muted">URLS / MAGNETS (one per line)
          <textarea
            className="mt-1 block w-full h-24 border border-border bg-bg px-2 py-1 text-fg2"
            value={urls} onChange={(e) => setUrls(e.target.value)}
            placeholder="magnet:?xt=urn:btih:..."
          />
        </label>
        <label className="block text-muted">FILES
          <input
            type="file" multiple accept=".torrent"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="mt-1 block w-full text-fg2"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-muted">CATEGORY
            <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 block w-full border border-border bg-bg px-2 py-1 text-fg2">
              <option value="">(none)</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="block text-muted">TAGS (comma)
            <input className="mt-1 block w-full border border-border bg-bg px-2 py-1 text-fg2"
                   value={tags} onChange={(e) => setTags(e.target.value)} />
          </label>
        </div>
        <label className="flex items-center gap-2 text-muted">
          <input type="checkbox" checked={paused} onChange={(e) => setPaused(e.target.checked)} />
          start paused
        </label>
        {err && <div className="text-danger">{err}</div>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={close} className="px-3 py-1 border border-border">cancel</button>
          <button type="submit" disabled={busy}
                  className="px-3 py-1 border border-accent text-accent disabled:opacity-50">
            {busy ? '...' : 'add'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
```

- [ ] **Step 3: Wire AddTorrent into `src/pages/TorrentListPage.tsx`**

Replace contents:

```tsx
import { useSync } from '@/hooks/useSync';
import { TorrentTable } from '@/components/List/TorrentTable';
import { TopBar } from '@/components/Layout/TopBar';
import { Sidebar } from '@/components/Layout/Sidebar';
import { AddTorrent } from '@/components/Modals/AddTorrent';
import { useUi } from '@/stores/ui';
import { Navigate } from 'react-router-dom';

export default function TorrentListPage() {
  const { state, error, authError } = useSync();
  const activeModal = useUi((s) => s.activeModal);
  if (authError) return <Navigate to="/login" replace />;

  return (
    <div className="h-screen flex flex-col">
      <TopBar serverState={state.serverState} />
      <div className="flex-1 min-h-0 flex">
        <Sidebar torrents={state.torrents} categories={state.categories} tags={state.tags} />
        <div className="flex-1 min-w-0">
          <TorrentTable torrents={state.torrents} />
        </div>
      </div>
      {error && <div className="border-t border-danger text-danger px-3 py-1 text-xs">{error}</div>}
      {activeModal === 'add' && <AddTorrent categories={Object.keys(state.categories)} />}
    </div>
  );
}
```

- [ ] **Step 4: Build and commit**

Run: `npm run build`
Expected: success.

```bash
git add -A
git commit -m "feat: Modal shell and AddTorrent modal"
```

---

## Task 19: Confirm-Delete, Set-Category, Edit-Tags modals

**Files:**
- Create: `src/components/Modals/ConfirmDelete.tsx`, `src/components/Modals/SetCategory.tsx`, `src/components/Modals/EditTags.tsx`
- Modify: `src/pages/TorrentListPage.tsx`

- [ ] **Step 1: Implement `src/components/Modals/ConfirmDelete.tsx`**

```tsx
import { useState } from 'react';
import { Modal, useCloseModal } from './Modal';
import { remove } from '@/api/torrents';
import { useSelection } from '@/stores/selection';

export function ConfirmDelete() {
  const close = useCloseModal();
  const hashes = useSelection((s) => s.hashes());
  const clear = useSelection((s) => s.clear);
  const [files, setFiles] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      await remove(hashes, files);
      clear();
      close();
    } finally { setBusy(false); }
  }

  return (
    <Modal title={`delete ${hashes.length} torrent(s)`} onClose={close}>
      <div className="space-y-3 text-xs w-80">
        <p>this action cannot be undone.</p>
        <label className="flex items-center gap-2 text-danger">
          <input type="checkbox" checked={files} onChange={(e) => setFiles(e.target.checked)} />
          also delete files on disk
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={close} className="px-3 py-1 border border-border">cancel</button>
          <button onClick={submit} disabled={busy}
                  className="px-3 py-1 border border-danger text-danger disabled:opacity-50">
            {busy ? '...' : 'delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 2: Implement `src/components/Modals/SetCategory.tsx`**

```tsx
import { useState } from 'react';
import { Modal, useCloseModal } from './Modal';
import { setCategory } from '@/api/torrents';
import { useSelection } from '@/stores/selection';

export function SetCategory({ categories }: { categories: string[] }) {
  const close = useCloseModal();
  const hashes = useSelection((s) => s.hashes());
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      await setCategory(hashes, value);
      close();
    } finally { setBusy(false); }
  }

  return (
    <Modal title="set category" onClose={close}>
      <div className="space-y-3 text-xs w-72">
        <label className="block text-muted">CATEGORY
          <input list="cats" value={value} onChange={(e) => setValue(e.target.value)} autoFocus
                 className="mt-1 block w-full border border-border bg-bg px-2 py-1 text-fg2" />
          <datalist id="cats">
            {categories.map((c) => <option key={c} value={c} />)}
          </datalist>
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={close} className="px-3 py-1 border border-border">cancel</button>
          <button onClick={submit} disabled={busy}
                  className="px-3 py-1 border border-accent text-accent disabled:opacity-50">apply</button>
        </div>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 3: Implement `src/components/Modals/EditTags.tsx`**

```tsx
import { useState } from 'react';
import { Modal, useCloseModal } from './Modal';
import { addTags, removeTags } from '@/api/torrents';
import { useSelection } from '@/stores/selection';

export function EditTags({ allTags }: { allTags: string[] }) {
  const close = useCloseModal();
  const hashes = useSelection((s) => s.hashes());
  const [add, setAdd] = useState('');
  const [rm, setRm] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const adds = add.split(',').map((s) => s.trim()).filter(Boolean);
      const rms = rm.split(',').map((s) => s.trim()).filter(Boolean);
      if (adds.length) await addTags(hashes, adds);
      if (rms.length) await removeTags(hashes, rms);
      close();
    } finally { setBusy(false); }
  }

  return (
    <Modal title="edit tags" onClose={close}>
      <div className="space-y-3 text-xs w-80">
        <label className="block text-muted">ADD (comma)
          <input value={add} onChange={(e) => setAdd(e.target.value)} list="tags-add"
                 className="mt-1 block w-full border border-border bg-bg px-2 py-1 text-fg2" />
          <datalist id="tags-add">
            {allTags.map((t) => <option key={t} value={t} />)}
          </datalist>
        </label>
        <label className="block text-muted">REMOVE (comma)
          <input value={rm} onChange={(e) => setRm(e.target.value)}
                 className="mt-1 block w-full border border-border bg-bg px-2 py-1 text-fg2" />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={close} className="px-3 py-1 border border-border">cancel</button>
          <button onClick={submit} disabled={busy}
                  className="px-3 py-1 border border-accent text-accent disabled:opacity-50">apply</button>
        </div>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 4: Wire modals into `src/pages/TorrentListPage.tsx`**

Replace the `{activeModal === 'add' && ...}` line with:

```tsx
      {activeModal === 'add' && <AddTorrent categories={Object.keys(state.categories)} />}
      {activeModal === 'delete' && <ConfirmDelete />}
      {activeModal === 'category' && <SetCategory categories={Object.keys(state.categories)} />}
      {activeModal === 'tags' && <EditTags allTags={state.tags} />}
```

And add the imports:

```tsx
import { ConfirmDelete } from '@/components/Modals/ConfirmDelete';
import { SetCategory } from '@/components/Modals/SetCategory';
import { EditTags } from '@/components/Modals/EditTags';
```

- [ ] **Step 5: Build and commit**

Run: `npm run build`
Expected: success.

```bash
git add -A
git commit -m "feat: Confirm-delete, set-category, edit-tags modals"
```

---

## Task 20: Help modal driven by registry

**Files:**
- Create: `src/components/Modals/Help.tsx`, `src/keyboard/bindings.ts`
- Modify: `src/pages/TorrentListPage.tsx`, `src/App.tsx`

- [ ] **Step 1: Create the registry singleton + binding setup `src/keyboard/bindings.ts`**

```ts
import { createRegistry, type Binding } from './registry';

export const registry = createRegistry();

export function registerAll(bindings: Binding[]) {
  for (const b of bindings) registry.register(b);
  return () => { for (const b of bindings) registry.unregister(b); };
}
```

- [ ] **Step 2: Implement `src/components/Modals/Help.tsx`**

```tsx
import { Modal, useCloseModal } from './Modal';
import { registry } from '@/keyboard/bindings';

export function Help() {
  const close = useCloseModal();
  const grouped = registry.list().reduce<Record<string, { keys: string; label: string }[]>>(
    (acc, b) => {
      (acc[b.context] ??= []).push({ keys: b.keys, label: b.label });
      return acc;
    }, {});

  return (
    <Modal title="keybindings" onClose={close}>
      <div className="grid grid-cols-2 gap-6 w-[36rem] text-xs">
        {Object.entries(grouped).map(([ctx, items]) => (
          <div key={ctx}>
            <div className="text-muted uppercase mb-1">{ctx}</div>
            {items.map((it) => (
              <div key={it.keys + it.label} className="flex justify-between border-b border-dotted border-border py-0.5">
                <span className="text-accent">{it.keys}</span>
                <span className="text-fg2">{it.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Modal>
  );
}
```

- [ ] **Step 3: Wire help into list page**

In `src/pages/TorrentListPage.tsx` add to the modal block:

```tsx
      {activeModal === 'help' && <Help />}
```

And import:

```tsx
import { Help } from '@/components/Modals/Help';
```

- [ ] **Step 4: Build and commit**

Run: `npm run build`
Expected: success.

```bash
git add -A
git commit -m "feat: Help modal generated from binding registry"
```

---

## Task 21: Wire global + list keybindings

**Files:**
- Create: `src/hooks/useKeybinds.ts`
- Modify: `src/App.tsx`, `src/pages/TorrentListPage.tsx`

- [ ] **Step 1: Implement `src/hooks/useKeybinds.ts`**

```ts
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
```

- [ ] **Step 2: Wire global handler in `src/App.tsx`**

Replace contents:

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthGate } from './components/AuthGate';
import { useUi } from './stores/ui';
import { useKeyboardHandler, useKeybinds } from './hooks/useKeybinds';
import LoginPage from './pages/LoginPage';
import TorrentListPage from './pages/TorrentListPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 5_000, retry: false } } });

function GlobalKeybinds() {
  const { activeModal, openModal } = useUi();
  useKeyboardHandler(() => (activeModal ? 'modal' : 'list'));
  useKeybinds([
    { context: 'global', keys: '?', label: 'help', action: () => openModal('help') },
    { context: 'global', keys: 'a', label: 'add torrent', action: () => openModal('add') },
    { context: 'global', keys: 'gs', label: 'go search', action: () => { window.location.href = '/search'; } },
    { context: 'global', keys: 'gh', label: 'go home', action: () => { window.location.href = '/'; } },
    { context: 'global', keys: 'gp', label: 'go plugins',
      action: () => { window.location.href = '/settings/plugins'; } },
    { context: 'modal',  keys: 'esc', label: 'close', action: () => openModal(null) },
  ]);
  return null;
}

export function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <GlobalKeybinds />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AuthGate />}>
            <Route path="/" element={<TorrentListPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/settings/*" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 3: Add list bindings inside `src/pages/TorrentListPage.tsx`**

Insert right after the `useSync` line in the component body:

```tsx
  const ui = useUi();
  const sel = useSelection();
  const ordered = useMemo(
    () => Object.values(state.torrents).map((t) => t.hash!).filter(Boolean),
    [state.torrents],
  );

  useKeybinds([
    { context: 'list', keys: 'j', label: 'next',
      action: () => moveCursor(ordered, sel, 1) },
    { context: 'list', keys: 'k', label: 'prev',
      action: () => moveCursor(ordered, sel, -1) },
    { context: 'list', keys: 'p', label: 'pause',
      action: () => { void pause(sel.hashes()); } },
    { context: 'list', keys: 'r', label: 'resume',
      action: () => { void resume(sel.hashes()); } },
    { context: 'list', keys: 'd', label: 'delete',
      action: () => ui.openModal('delete') },
    { context: 'list', keys: 'R', label: 'recheck',
      action: () => { void recheck(sel.hashes()); } },
    { context: 'list', keys: 'c', label: 'set category',
      action: () => ui.openModal('category') },
    { context: 'list', keys: 't', label: 'edit tags',
      action: () => ui.openModal('tags') },
    { context: 'list', keys: 'enter', label: 'open details',
      action: () => { const h = sel.hashes()[0]; if (h) ui.openDetails(h); } },
    { context: 'list', keys: 'esc', label: 'close details',
      action: () => ui.closeDetails() },
  ]);
```

Add a helper at the bottom of the file (export not required):

```tsx
function moveCursor(ordered: string[], sel: ReturnType<typeof useSelection>, dir: 1 | -1) {
  const cur = sel.hashes()[0];
  const i = cur ? ordered.indexOf(cur) : -1;
  const next = ordered[Math.max(0, Math.min(ordered.length - 1, i + dir))];
  if (next) sel.selectOnly(next);
}
```

Add the imports at the top:

```tsx
import { useMemo } from 'react';
import { useSelection } from '@/stores/selection';
import { useUi } from '@/stores/ui';
import { useKeybinds } from '@/hooks/useKeybinds';
import { pause, resume, recheck } from '@/api/torrents';
```

- [ ] **Step 4: Build and verify**

Run: `npm run build`
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: wire global and list keybindings"
```

---

## Task 22: Details panel shell + General tab

**Files:**
- Create: `src/components/Layout/DetailsPanel.tsx`, `src/components/Details/GeneralTab.tsx`
- Modify: `src/pages/TorrentListPage.tsx`

- [ ] **Step 1: Implement `src/components/Layout/DetailsPanel.tsx`**

```tsx
import { useState } from 'react';
import type { Torrent } from '@/api/types';
import { GeneralTab } from '@/components/Details/GeneralTab';
import { useUi } from '@/stores/ui';

type Tab = 'general' | 'files' | 'peers' | 'trackers';
const TABS: Tab[] = ['general', 'files', 'peers', 'trackers'];

export function DetailsPanel({ torrent }: { torrent: Partial<Torrent> }) {
  const close = useUi((s) => s.closeDetails);
  const [tab, setTab] = useState<Tab>('general');
  return (
    <div className="border-t border-border bg-bg2 flex flex-col" style={{ height: '40vh' }}>
      <div className="px-3 h-7 border-b border-border flex items-center gap-3 text-xs">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={t === tab ? 'text-fg2 border-b border-accent' : 'text-muted hover:text-fg2'}>
            {t}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={close} className="text-muted hover:text-fg2">[esc]</button>
      </div>
      <div className="flex-1 overflow-auto p-3 text-xs">
        {tab === 'general' && <GeneralTab t={torrent} />}
        {tab === 'files' && <FilesPlaceholder />}
        {tab === 'peers' && <PeersPlaceholder />}
        {tab === 'trackers' && <TrackersPlaceholder />}
      </div>
    </div>
  );
}

function FilesPlaceholder() { return <div className="text-muted">files (next task)</div>; }
function PeersPlaceholder() { return <div className="text-muted">peers (next task)</div>; }
function TrackersPlaceholder() { return <div className="text-muted">trackers (next task)</div>; }
```

- [ ] **Step 2: Implement `src/components/Details/GeneralTab.tsx`**

```tsx
import type { Torrent } from '@/api/types';
import { formatBytes, formatRatio, formatEta, formatSpeed } from '@/lib/format';

export function GeneralTab({ t }: { t: Partial<Torrent> }) {
  const rows: [string, string][] = [
    ['hash', t.hash ?? ''],
    ['name', t.name ?? ''],
    ['state', t.state ?? ''],
    ['size', formatBytes(t.size ?? 0)],
    ['progress', `${((t.progress ?? 0) * 100).toFixed(1)}%`],
    ['downloaded', formatBytes(t.downloaded ?? 0)],
    ['uploaded', formatBytes(t.uploaded ?? 0)],
    ['ratio', formatRatio(t.ratio ?? 0)],
    ['↓ speed', formatSpeed(t.dlspeed ?? 0)],
    ['↑ speed', formatSpeed(t.upspeed ?? 0)],
    ['eta', formatEta(t.eta ?? -1)],
    ['save path', t.save_path ?? ''],
    ['category', t.category ?? ''],
    ['tags', t.tags ?? ''],
    ['added', t.added_on ? new Date(t.added_on * 1000).toISOString() : ''],
  ];
  return (
    <table className="w-full">
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k} className="border-b border-dotted border-border">
            <td className="text-muted py-0.5 pr-3 w-32">{k}</td>
            <td className="text-fg2 break-all">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 3: Wire details panel into list page**

Replace the inner column div in `TorrentListPage.tsx`:

```tsx
      <div className="flex-1 min-h-0 flex">
        <Sidebar torrents={state.torrents} categories={state.categories} tags={state.tags} />
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 min-h-0">
            <TorrentTable torrents={state.torrents} />
          </div>
          {ui.detailsOpen && ui.activeHash && state.torrents[ui.activeHash] &&
            <DetailsPanel torrent={state.torrents[ui.activeHash]!} />}
        </div>
      </div>
```

Add import:

```tsx
import { DetailsPanel } from '@/components/Layout/DetailsPanel';
```

- [ ] **Step 4: Build and commit**

Run: `npm run build`
Expected: success.

```bash
git add -A
git commit -m "feat: details panel shell and General tab"
```

---

## Task 23: Files / Peers / Trackers tabs

**Files:**
- Create: `src/components/Details/FilesTab.tsx`, `src/components/Details/PeersTab.tsx`, `src/components/Details/TrackersTab.tsx`
- Modify: `src/components/Layout/DetailsPanel.tsx`

- [ ] **Step 1: Implement `src/components/Details/FilesTab.tsx`**

```tsx
import { useQuery } from '@tanstack/react-query';
import { fetchFiles } from '@/api/torrents';
import { formatBytes } from '@/lib/format';
import { ProgressBar } from '@/components/List/ProgressBar';

export function FilesTab({ hash }: { hash: string }) {
  const q = useQuery({
    queryKey: ['files', hash],
    queryFn: () => fetchFiles(hash),
    refetchInterval: 3000,
  });
  if (q.isLoading) return <div className="text-muted">loading files...</div>;
  if (q.error) return <div className="text-danger">{(q.error as Error).message}</div>;
  return (
    <table className="w-full">
      <thead>
        <tr className="text-muted uppercase tracking-wide text-[10px]">
          <th className="text-left py-1">name</th>
          <th className="text-right w-20">size</th>
          <th className="w-28">progress</th>
          <th className="text-right w-12">prio</th>
        </tr>
      </thead>
      <tbody>
        {(q.data ?? []).map((f) => (
          <tr key={f.index} className="border-b border-dotted border-border">
            <td className="py-0.5 truncate text-fg2">{f.name}</td>
            <td className="text-right">{formatBytes(f.size)}</td>
            <td><ProgressBar value={f.progress} complete={f.progress >= 1} /></td>
            <td className="text-right">{f.priority}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 2: Implement `src/components/Details/PeersTab.tsx`**

```tsx
import { useQuery } from '@tanstack/react-query';
import { fetchPeers } from '@/api/torrents';
import { formatSpeed } from '@/lib/format';

export function PeersTab({ hash }: { hash: string }) {
  const q = useQuery({
    queryKey: ['peers', hash],
    queryFn: () => fetchPeers(hash),
    refetchInterval: 2000,
  });
  if (q.isLoading) return <div className="text-muted">loading peers...</div>;
  if (q.error) return <div className="text-danger">{(q.error as Error).message}</div>;
  const peers = Object.values(q.data?.peers ?? {});
  return (
    <table className="w-full">
      <thead>
        <tr className="text-muted uppercase tracking-wide text-[10px]">
          <th className="text-left py-1 w-44">ip</th>
          <th className="text-left">client</th>
          <th className="text-right w-20">↓</th>
          <th className="text-right w-20">↑</th>
          <th className="text-right w-16">progress</th>
          <th className="text-left w-20">flags</th>
        </tr>
      </thead>
      <tbody>
        {peers.map((p, i) => (
          <tr key={i} className="border-b border-dotted border-border">
            <td className="py-0.5 text-fg2">{p.ip}:{p.port}</td>
            <td className="truncate">{p.client}</td>
            <td className="text-right">{formatSpeed(p.dl_speed)}</td>
            <td className="text-right">{formatSpeed(p.up_speed)}</td>
            <td className="text-right">{(p.progress * 100).toFixed(0)}%</td>
            <td>{p.flags}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 3: Implement `src/components/Details/TrackersTab.tsx`**

```tsx
import { useQuery } from '@tanstack/react-query';
import { fetchTrackers, reannounce } from '@/api/torrents';

const STATUS: Record<number, string> = {
  0: 'disabled', 1: 'not contacted', 2: 'working', 3: 'updating', 4: 'not working',
};

export function TrackersTab({ hash }: { hash: string }) {
  const q = useQuery({
    queryKey: ['trackers', hash],
    queryFn: () => fetchTrackers(hash),
    refetchInterval: 5000,
  });
  if (q.isLoading) return <div className="text-muted">loading trackers...</div>;
  if (q.error) return <div className="text-danger">{(q.error as Error).message}</div>;
  return (
    <div>
      <button onClick={() => reannounce([hash])} className="mb-2 px-2 py-0.5 text-xs border border-accent text-accent">
        reannounce
      </button>
      <table className="w-full">
        <thead>
          <tr className="text-muted uppercase tracking-wide text-[10px]">
            <th className="text-left py-1">url</th>
            <th className="text-left w-28">status</th>
            <th className="text-right w-16">tier</th>
            <th className="text-right w-16">peers</th>
            <th className="text-right w-16">seeds</th>
            <th className="text-left">message</th>
          </tr>
        </thead>
        <tbody>
          {(q.data ?? []).map((t, i) => (
            <tr key={i} className="border-b border-dotted border-border">
              <td className="py-0.5 truncate text-fg2 max-w-md">{t.url}</td>
              <td>{STATUS[t.status] ?? t.status}</td>
              <td className="text-right">{t.tier}</td>
              <td className="text-right">{t.num_peers}</td>
              <td className="text-right">{t.num_seeds}</td>
              <td className="truncate text-muted">{t.msg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Replace placeholders in `DetailsPanel.tsx`**

Replace the placeholder helpers and the body switch:

```tsx
import { FilesTab } from '@/components/Details/FilesTab';
import { PeersTab } from '@/components/Details/PeersTab';
import { TrackersTab } from '@/components/Details/TrackersTab';
```

Replace the body block:

```tsx
      <div className="flex-1 overflow-auto p-3 text-xs">
        {tab === 'general' && <GeneralTab t={torrent} />}
        {tab === 'files' && torrent.hash && <FilesTab hash={torrent.hash} />}
        {tab === 'peers' && torrent.hash && <PeersTab hash={torrent.hash} />}
        {tab === 'trackers' && torrent.hash && <TrackersTab hash={torrent.hash} />}
      </div>
```

Delete the `FilesPlaceholder`/`PeersPlaceholder`/`TrackersPlaceholder` functions.

- [ ] **Step 5: Build and commit**

Run: `npm run build`
Expected: success.

```bash
git add -A
git commit -m "feat: Files, Peers, Trackers detail tabs"
```

---

## Task 24: Search page

**Files:**
- Create: `src/components/Search/SearchBar.tsx`, `src/components/Search/ResultsTable.tsx`
- Modify: `src/pages/SearchPage.tsx`

- [ ] **Step 1: Implement `src/components/Search/SearchBar.tsx`**

```tsx
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
        className="flex-1 border border-border bg-bg px-2 py-1 text-fg2"
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="border border-border bg-bg px-2 py-1 text-fg2">
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
              className="border border-border bg-bg px-2 py-1 text-fg2">
        <option value="enabled">all enabled</option>
        {plugins.filter((p) => p.enabled).map((p) => (
          <option key={p.name} value={p.name}>{p.fullName}</option>
        ))}
      </select>
      <button type="submit" className="border border-accent text-accent px-3 py-1">search</button>
    </form>
  );
}
```

- [ ] **Step 2: Implement `src/components/Search/ResultsTable.tsx`**

```tsx
import type { SearchResult } from '@/api/types';
import { formatBytes } from '@/lib/format';

export function ResultsTable({
  results, onAdd,
}: {
  results: SearchResult[];
  onAdd: (url: string) => void;
}) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-muted uppercase tracking-wide text-[10px]">
          <th className="text-left py-1 px-2">name</th>
          <th className="text-right w-20">size</th>
          <th className="text-right w-12">S</th>
          <th className="text-right w-12">L</th>
          <th className="text-left w-32">site</th>
          <th className="w-16"></th>
        </tr>
      </thead>
      <tbody>
        {results.map((r, i) => (
          <tr key={i} className="border-b border-dotted border-border hover:bg-bg2">
            <td className="px-2 py-0.5 truncate text-fg2 max-w-2xl">{r.fileName}</td>
            <td className="text-right">{r.fileSize > 0 ? formatBytes(r.fileSize) : '—'}</td>
            <td className="text-right text-ok">{r.nbSeeders}</td>
            <td className="text-right text-warn">{r.nbLeechers}</td>
            <td className="truncate"><a href={r.descrLink} target="_blank" rel="noreferrer" className="text-muted hover:text-fg2">{new URL(r.siteUrl).hostname}</a></td>
            <td className="text-right pr-2">
              <button onClick={() => onAdd(r.fileUrl)} className="border border-accent text-accent px-2">+</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 3: Implement `src/pages/SearchPage.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react';
import { useSync } from '@/hooks/useSync';
import { TopBar } from '@/components/Layout/TopBar';
import { SearchBar } from '@/components/Search/SearchBar';
import { ResultsTable } from '@/components/Search/ResultsTable';
import { startSearch, stopSearch, deleteSearch, fetchSearchResults } from '@/api/search';
import { AddTorrent } from '@/components/Modals/AddTorrent';
import type { SearchResult } from '@/api/types';
import { useUi } from '@/stores/ui';

export default function SearchPage() {
  const { state } = useSync();
  const ui = useUi();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefill, setPrefill] = useState('');
  const pollRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => {
    if (pollRef.current) clearTimeout(pollRef.current);
    if (sessionId !== null) { void stopSearch(sessionId).catch(() => {}); void deleteSearch(sessionId).catch(() => {}); }
  }, [sessionId]);

  async function start(pattern: string, plugins: 'enabled' | string[], category: string) {
    setError(null); setResults([]);
    if (sessionId !== null) { await stopSearch(sessionId).catch(() => {}); await deleteSearch(sessionId).catch(() => {}); }
    try {
      const { id } = await startSearch(pattern, plugins, category);
      setSessionId(id); setRunning(true); poll(id);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  }

  function poll(id: number) {
    if (pollRef.current) clearTimeout(pollRef.current);
    fetchSearchResults(id).then((res) => {
      setResults(res.results);
      if (res.status === 'Stopped') { setRunning(false); return; }
      pollRef.current = setTimeout(() => poll(id), 1500);
    }).catch((e) => setError(e.message));
  }

  function add(url: string) {
    setPrefill(url);
    ui.openModal('add');
  }

  return (
    <div className="h-screen flex flex-col">
      <TopBar serverState={state.serverState} />
      <SearchBar onStart={start} />
      {error && <div className="text-danger px-3 py-1 text-xs">{error}</div>}
      <div className="px-3 py-1 text-muted text-[11px]">
        {running ? `searching… ${results.length} results so far` : results.length ? `${results.length} results` : 'enter a query above'}
      </div>
      <div className="flex-1 overflow-auto">
        <ResultsTable results={results} onAdd={add} />
      </div>
      {ui.activeModal === 'add' &&
        <AddTorrent initialUrl={prefill} categories={Object.keys(state.categories)} />}
    </div>
  );
}
```

- [ ] **Step 4: Build and commit**

Run: `npm run build`
Expected: success.

```bash
git add -A
git commit -m "feat: search page with live results and add-from-result"
```

---

## Task 25: Settings — preferences tabs

**Files:**
- Create: `src/components/Settings/SettingsLayout.tsx`, `src/components/Settings/PrefsTab.tsx`, `src/components/Settings/tabs/General.tsx`, `src/components/Settings/tabs/Connection.tsx`, `src/components/Settings/tabs/Speed.tsx`, `src/components/Settings/tabs/Downloads.tsx`, `src/components/Settings/tabs/Behavior.tsx`
- Modify: `src/pages/SettingsPage.tsx`

- [ ] **Step 1: Implement `src/components/Settings/PrefsTab.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { fetchPrefs, setPrefs } from '@/api/prefs';
import type { Preferences } from '@/api/types';

export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'bool';
  unit?: string;
  divisor?: number;        // for kilobytes/sec etc.
}

export function PrefsTab({ fields }: { fields: FieldDef[] }) {
  const [prefs, setLocal] = useState<Preferences | null>(null);
  const [dirty, setDirty] = useState<Preferences>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { fetchPrefs().then(setLocal).catch((e) => setErr(e.message)); }, []);
  if (!prefs) return <div className="text-muted">loading…</div>;

  function update(k: string, v: unknown) { setDirty((d) => ({ ...d, [k]: v })); }
  function get(k: string): unknown { return k in dirty ? dirty[k] : prefs![k]; }

  async function save() {
    setBusy(true); setErr(null);
    try {
      await setPrefs(dirty);
      setLocal({ ...prefs, ...dirty });
      setDirty({});
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-3 text-xs max-w-xl">
      {fields.map((f) => {
        const v = get(f.key);
        if (f.type === 'bool') {
          return (
            <label key={f.key} className="flex items-center gap-2 text-muted">
              <input type="checkbox" checked={!!v}
                     onChange={(e) => update(f.key, e.target.checked)} />
              <span>{f.label}</span>
            </label>
          );
        }
        const display = f.divisor && typeof v === 'number' ? v / f.divisor : v;
        return (
          <label key={f.key} className="flex items-center gap-3">
            <span className="w-56 text-muted">{f.label}</span>
            <input
              type={f.type === 'number' ? 'number' : 'text'}
              value={String(display ?? '')}
              onChange={(e) => {
                let next: unknown = e.target.value;
                if (f.type === 'number') {
                  const n = Number(e.target.value);
                  next = f.divisor ? n * f.divisor : n;
                }
                update(f.key, next);
              }}
              className="border border-border bg-bg px-2 py-1 text-fg2 w-48"
            />
            {f.unit && <span className="text-muted">{f.unit}</span>}
          </label>
        );
      })}
      {err && <div className="text-danger">{err}</div>}
      <div className="flex gap-2 pt-2">
        <button onClick={save} disabled={busy || Object.keys(dirty).length === 0}
                className="px-3 py-1 border border-accent text-accent disabled:opacity-50">
          {busy ? '...' : 'save'}
        </button>
        <button onClick={() => setDirty({})} disabled={Object.keys(dirty).length === 0}
                className="px-3 py-1 border border-border disabled:opacity-50">revert</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement the 5 tab files**

`src/components/Settings/tabs/General.tsx`:

```tsx
import { PrefsTab } from '../PrefsTab';
export default function General() {
  return <PrefsTab fields={[
    { key: 'locale', label: 'locale', type: 'text' },
    { key: 'autorun_enabled', label: 'run external program on completion', type: 'bool' },
    { key: 'autorun_program', label: 'program path', type: 'text' },
    { key: 'preallocate_all', label: 'preallocate disk space for all files', type: 'bool' },
  ]} />;
}
```

`src/components/Settings/tabs/Connection.tsx`:

```tsx
import { PrefsTab } from '../PrefsTab';
export default function Connection() {
  return <PrefsTab fields={[
    { key: 'listen_port', label: 'listening port', type: 'number' },
    { key: 'random_port', label: 'use random port', type: 'bool' },
    { key: 'upnp', label: 'enable UPnP / NAT-PMP', type: 'bool' },
    { key: 'max_connec', label: 'max connections (global)', type: 'number' },
    { key: 'max_connec_per_torrent', label: 'max connections per torrent', type: 'number' },
  ]} />;
}
```

`src/components/Settings/tabs/Speed.tsx`:

```tsx
import { PrefsTab } from '../PrefsTab';
export default function Speed() {
  return <PrefsTab fields={[
    { key: 'dl_limit',     label: 'global download limit',      type: 'number', unit: 'KB/s', divisor: 1024 },
    { key: 'up_limit',     label: 'global upload limit',        type: 'number', unit: 'KB/s', divisor: 1024 },
    { key: 'alt_dl_limit', label: 'alt download limit',         type: 'number', unit: 'KB/s', divisor: 1024 },
    { key: 'alt_up_limit', label: 'alt upload limit',           type: 'number', unit: 'KB/s', divisor: 1024 },
    { key: 'scheduler_enabled', label: 'schedule alt rate',     type: 'bool' },
  ]} />;
}
```

`src/components/Settings/tabs/Downloads.tsx`:

```tsx
import { PrefsTab } from '../PrefsTab';
export default function Downloads() {
  return <PrefsTab fields={[
    { key: 'save_path',      label: 'default save path',        type: 'text' },
    { key: 'temp_path',      label: 'temp save path',           type: 'text' },
    { key: 'temp_path_enabled', label: 'use temp path',         type: 'bool' },
    { key: 'incomplete_files_ext', label: 'append .!qB to incomplete files', type: 'bool' },
    { key: 'auto_tmm_enabled', label: 'automatic torrent management default', type: 'bool' },
  ]} />;
}
```

`src/components/Settings/tabs/Behavior.tsx`:

```tsx
import { PrefsTab } from '../PrefsTab';
export default function Behavior() {
  return <PrefsTab fields={[
    { key: 'queueing_enabled', label: 'enable torrent queueing', type: 'bool' },
    { key: 'max_active_downloads', label: 'max active downloads', type: 'number' },
    { key: 'max_active_uploads',   label: 'max active uploads',   type: 'number' },
    { key: 'max_active_torrents',  label: 'max active torrents',  type: 'number' },
    { key: 'max_ratio_enabled',    label: 'stop seeding at ratio', type: 'bool' },
    { key: 'max_ratio',            label: 'ratio',                 type: 'number' },
  ]} />;
}
```

- [ ] **Step 3: Implement `src/components/Settings/SettingsLayout.tsx`**

```tsx
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { TopBar } from '@/components/Layout/TopBar';
import { useSync } from '@/hooks/useSync';
import General from './tabs/General';
import Connection from './tabs/Connection';
import Speed from './tabs/Speed';
import Downloads from './tabs/Downloads';
import Behavior from './tabs/Behavior';

const TABS = [
  { to: 'general', label: 'general' },
  { to: 'connection', label: 'connection' },
  { to: 'speed', label: 'speed' },
  { to: 'downloads', label: 'downloads' },
  { to: 'behavior', label: 'behavior' },
  { to: 'plugins', label: 'search plugins' },
];

export function SettingsLayout({ pluginsTab }: { pluginsTab: React.ReactNode }) {
  const { state } = useSync();
  return (
    <div className="h-screen flex flex-col">
      <TopBar serverState={state.serverState} />
      <div className="flex-1 min-h-0 flex">
        <nav className="w-48 border-r border-border py-2 text-xs">
          {TABS.map((t) => (
            <NavLink key={t.to} to={t.to}
              className={({ isActive }) =>
                `block px-3 py-0.5 ${isActive ? 'bg-bg2 text-fg2' : 'text-muted hover:text-fg2'}`}
            >{t.label}</NavLink>
          ))}
        </nav>
        <div className="flex-1 overflow-auto p-4">
          <Routes>
            <Route index element={<Navigate to="general" replace />} />
            <Route path="general" element={<General />} />
            <Route path="connection" element={<Connection />} />
            <Route path="speed" element={<Speed />} />
            <Route path="downloads" element={<Downloads />} />
            <Route path="behavior" element={<Behavior />} />
            <Route path="plugins" element={pluginsTab} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Update `src/pages/SettingsPage.tsx`**

```tsx
import { SettingsLayout } from '@/components/Settings/SettingsLayout';
import { PluginsTab } from '@/components/Settings/tabs/Plugins';

export default function SettingsPage() {
  return <SettingsLayout pluginsTab={<PluginsTab />} />;
}
```

(`PluginsTab` will be created in the next task.)

- [ ] **Step 5: Build (will fail until next task adds Plugins) — skip and commit**

Skip build for now; create stub:

`src/components/Settings/tabs/Plugins.tsx`:

```tsx
export function PluginsTab() {
  return <div className="text-muted">plugins (next task)</div>;
}
```

Run: `npm run build`
Expected: success.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: settings page with prefs tabs"
```

---

## Task 26: Search Plugins tab

**Files:**
- Create: `src/components/Settings/tabs/Plugins.tsx` (replace stub)

- [ ] **Step 1: Replace `src/components/Settings/tabs/Plugins.tsx`**

```tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPlugins, installPlugin, uninstallPlugin, enablePlugin, updatePlugins } from '@/api/search';

export function PluginsTab() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['plugins'], queryFn: fetchPlugins });
  const [source, setSource] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const install = useMutation({
    mutationFn: () => installPlugin(source),
    onSuccess: async () => { setSource(''); await qc.invalidateQueries({ queryKey: ['plugins'] }); },
    onError: (e) => setErr(e instanceof Error ? e.message : String(e)),
  });
  const update = useMutation({
    mutationFn: () => updatePlugins(),
    onSuccess: async () => qc.invalidateQueries({ queryKey: ['plugins'] }),
  });

  async function toggle(name: string, enable: boolean) {
    await enablePlugin([name], enable);
    qc.invalidateQueries({ queryKey: ['plugins'] });
  }
  async function uninstall(name: string) {
    if (!confirm(`Uninstall ${name}?`)) return;
    await uninstallPlugin([name]);
    qc.invalidateQueries({ queryKey: ['plugins'] });
  }

  if (q.isLoading) return <div className="text-muted">loading plugins...</div>;
  if (q.error) return <div className="text-danger">{(q.error as Error).message}</div>;

  return (
    <div className="space-y-4 text-xs max-w-3xl">
      <div className="flex gap-2 items-center">
        <input
          placeholder="install URL or local path (.py / .zip)"
          value={source} onChange={(e) => setSource(e.target.value)}
          className="flex-1 border border-border bg-bg px-2 py-1 text-fg2"
        />
        <button disabled={!source.trim() || install.isPending}
                onClick={() => install.mutate()}
                className="px-3 py-1 border border-accent text-accent disabled:opacity-50">install</button>
        <button onClick={() => update.mutate()} disabled={update.isPending}
                className="px-3 py-1 border border-border disabled:opacity-50">update all</button>
      </div>
      {err && <div className="text-danger">{err}</div>}

      <table className="w-full">
        <thead>
          <tr className="text-muted uppercase tracking-wide text-[10px]">
            <th className="text-left py-1">name</th>
            <th className="text-left">version</th>
            <th className="text-left">url</th>
            <th className="text-center w-16">enabled</th>
            <th className="text-right w-24"></th>
          </tr>
        </thead>
        <tbody>
          {(q.data ?? []).map((p) => (
            <tr key={p.name} className="border-b border-dotted border-border">
              <td className="py-0.5 text-fg2">{p.fullName}</td>
              <td>{p.version}</td>
              <td className="truncate text-muted max-w-xs">{p.url}</td>
              <td className="text-center">
                <input type="checkbox" checked={p.enabled}
                       onChange={(e) => toggle(p.name, e.target.checked)} />
              </td>
              <td className="text-right">
                <button onClick={() => uninstall(p.name)}
                        className="px-2 border border-danger text-danger">uninstall</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: Search Plugins management tab"
```

---

## Task 27: Smoke test (Playwright)

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Write `playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: process.env.UI_URL ?? 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  webServer: process.env.UI_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
```

- [ ] **Step 2: Install browsers**

```bash
npx playwright install --with-deps chromium
```

- [ ] **Step 3: Write `tests/e2e/smoke.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

const QBT_USER = process.env.QBT_USER ?? 'admin';
const QBT_PASS = process.env.QBT_PASS ?? 'adminadmin';
const QBT_URL = process.env.QBT_URL;

test.skip(!QBT_URL, 'QBT_URL not set — skipping live smoke test');

test('login → list → add → pause → delete', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('USERNAME').fill(QBT_USER);
  await page.getByLabel('PASSWORD').fill(QBT_PASS);
  await page.getByRole('button', { name: 'Connect' }).click();

  await expect(page.getByTestId('torrent-list')).toBeVisible();

  await page.getByRole('button', { name: '+ add' }).click();
  await page.getByLabel('URLS / MAGNETS', { exact: false }).fill(
    'magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a&dn=archlinux',
  );
  await page.getByRole('button', { name: 'add', exact: true }).click();

  await expect(page.locator('text=archlinux').first()).toBeVisible({ timeout: 8000 });

  await page.locator('text=archlinux').first().click();
  await page.keyboard.press('p');     // pause via keybind

  // Delete via keybind
  await page.keyboard.press('d');
  await page.getByRole('button', { name: 'delete' }).click();
});
```

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: playwright smoke test (opt-in via QBT_URL)"
```

---

## Task 28: README and final pass

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# qbt — terminal-native qBittorrent UI

A keyboard-first replacement Web UI for qBittorrent. Talks to qBittorrent's `/api/v2` directly. Static-only — no backend.

## Develop

```bash
npm install
QBT_URL=http://localhost:8080 npm run dev   # proxies /api to your qB instance
```

## Build

```bash
npm run build
# dist/ contains the static app
```

Set qBittorrent's "Web UI → Use alternative WebUI" to `dist/`, or serve from any static host.

## Test

```bash
npm test                                                  # vitest watch
npm run test:run                                          # one-shot
QBT_URL=http://localhost:8080 npm run e2e                 # opt-in playwright
```

## Keybindings

Press `?` inside the app for the auto-generated cheat sheet.
```

- [ ] **Step 2: Final build + lint**

Run: `npm run typecheck && npm run test:run && npm run build`
Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "docs: README"
```

---

## Self-Review Notes

Spec coverage check:
- §4.1 topology, §4.2 stack — Tasks 1, 2
- §4.3 API integration — Tasks 4–8
- §4.4 auth — Tasks 7, 13
- §5 visual language — Task 2
- §6 layout (top bar / sidebar / list / details) — Tasks 14–17, 22–23
- §6.1 search view — Task 24
- §6.2 settings + plugins tab — Tasks 25, 26
- §7 keyboard model — Tasks 9, 10, 21; help (§7) — Task 20
- §8 component file map — followed throughout
- §9 data flow — Tasks 12 (sync hook), 24 (search session lifecycle)
- §10 error handling — covered in client (Task 5), useSync (Task 12), modals
- §11 testing — Tasks 3, 5, 6, 9, 10, 11, 14, 15, 27
- §12 build/deploy — Tasks 1, 28

No placeholders. Type names (`SyncState`, `Binding`, `KbContext`, `Torrent`, `SearchPlugin`, `FieldDef`) used consistently across tasks.

`onClose` prop on Modal vs `useCloseModal` hook: both are used; `Modal` accepts the close callback explicitly so it can also be used outside the global modal store (tested-friendly), but consumers in this plan all wire it up via `useCloseModal`. Consistent.

`reannounce` is exported from torrents.ts (Task 7) and consumed in TrackersTab (Task 23). Consistent.

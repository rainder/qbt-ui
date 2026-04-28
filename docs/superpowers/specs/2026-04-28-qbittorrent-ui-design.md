# qBittorrent UI Replacement — Design Spec

**Date:** 2026-04-28
**Status:** Draft, awaiting user review
**Codename:** `qbt` (Terminal Native)

## 1. Goal

Replace qBittorrent's built-in WebUI with a modern, keyboard-first, terminal-native single-page app that talks to an existing qBittorrent instance via its Web API. Deployed as static files; usable as qBittorrent's "Use alternative WebUI" target or hosted independently.

## 2. Why

qBittorrent's built-in WebUI is functional but dated. Power users want something that feels like the tools they live in (`btop`, `lazygit`, `k9s`): mono font, dense rows, vim-style keybindings, no animation surplus. This is for that audience.

## 3. Non-goals (v1)

- **Multi-instance switching** — single qB endpoint per deployment
- **RSS feed management** — out of scope
- **Mobile-optimized layout** — usable on tablet, but desktop-first
- **Native app / wrapper** — pure web

## 4. Architecture

### 4.1 Topology

```
[Browser SPA] ──HTTP──▶ [qBittorrent Web API]
                          (same-origin in prod, dev proxy in dev)
```

Static SPA. Server is qBittorrent itself (via "alternative WebUI" config) or any static host fronting the API. No backend of our own.

### 4.2 Stack

- **Build:** Vite + TypeScript
- **UI:** React 18
- **Styling:** Tailwind CSS, custom mono-token theme
- **Server state:** TanStack Query (polling, caching, mutations)
- **Local UI state:** Zustand (selection, panel, modal, theme)
- **Routing:** React Router (`/login`, `/`, `/search`, `/settings`)
- **Testing:** Vitest (units) + Playwright (smoke flows, opt-in via `QBT_URL`)

### 4.3 API integration

Typed client wrapping `/api/v2/*`. Key endpoints:

| Concern | Endpoint |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/logout` |
| Sync (live state) | `GET /sync/maindata?rid=N` |
| Torrent control | `POST /torrents/{pause,resume,delete,recheck,...}` |
| Add | `POST /torrents/add` (multipart) |
| Files / peers / trackers | `GET /torrents/{files,peers,trackers}` |
| Categories / tags | `POST /torrents/{createCategory,createTags,...}` |
| Search | `POST /search/{start,stop}`, `GET /search/{status,results}` |
| Search plugins | `GET /search/plugins`, `POST /search/{installPlugin,enablePlugin,...}` |
| Preferences | `GET /app/preferences`, `POST /app/setPreferences` |

**Live state model.** `sync/maindata` returns either a full snapshot or a diff keyed by request id (`rid`). Client maintains a normalized store of torrents, applies diffs, advances `rid`. Poll interval 1500 ms; pauses when tab is hidden (`Page Visibility API`).

### 4.4 Auth

Cookie-based (qB sets `SID` on login). Login screen captures host/user/pass; session persists via cookie. On 403 from any endpoint, kick back to login. Detect qB's localhost-bypass mode by attempting any authed call without login first; skip login screen if it succeeds.

## 5. Visual language

- **Theme:** dark, ANSI-inspired palette
  - bg `#0a0e14`, fg `#b3b1ad`, accent `#59c2ff` (cyan), success `#aad94c` (green), warn `#ffb454` (yellow), danger `#f07178` (red), muted `#626a73`
- **Type:** JetBrains Mono, 13px base, tabular numerics for all counters
- **Density:** 28px row height, 1px dividers (dotted within tables, solid at section boundaries)
- **No** gradients, drop shadows, or motion beyond opacity fades for panel open/close

## 6. Layout

```
┌──────────────────────────────────────────────────────────────┐
│ qbt | ↓ 16.4M  ↑ 2.5M  ratio 2.34  free 1.2T   [+] [/] [?] │  Top bar
├──────────┬───────────────────────────────────────────────────┤
│ STATUS   │  pill  name                size  ▓▓▓░  ↓    ↑    │
│ ▸ all 14 │  DL    ubuntu-24.04...   5.2 GB  73%  12M  1.4M  │  Main list
│   dl  3  │  SE    linux-talks...    1.8 GB 100%   —   820k  │
│   se 11  │  PA    arch-2026...     980 MB  34%   —    —    │
│ TAGS     │                                                   │
│ #linux   │                                                   │
│ CATEGS   │                                                   │
│ /movies  │                                                   │
└──────────┴───────────────────────────────────────────────────┘
                                   ┌─ details (slide-up panel) ─┐
                                   │ general  files  peers  trk│
                                   └────────────────────────────┘
```

- **Top bar** (44 px): logo, global stats, primary actions
- **Sidebar** (200 px, collapsible): status / tag / category filters with counts
- **Main list:** virtualized rows (TanStack Virtual), columns sortable by click, resizable
- **Details panel:** slides up from bottom over main list, takes 40 % vertical, dismissible with `esc`. Picked over a full-width second view to keep the list visible while inspecting.

### 6.1 Search view (`/search`)

```
┌──────────────────────────────────────────────────────────────┐
│ qbt /search                                          [esc]   │
├──────────────────────────────────────────────────────────────┤
│ query: [______________________]  category: [all▾] plugin:[*] │
├──────────────────────────────────────────────────────────────┤
│ name                       size      S    L   plugin    [+]  │
│ ubuntu-24.04-desktop.iso  5.2 GB   2103   88  rutor      ↵   │
│ ...                                                           │
└──────────────────────────────────────────────────────────────┘
```

Live results streamed from `/api/v2/search/status` + `/api/v2/search/results` while the search session is alive. Enter on a row opens the Add-Torrent modal with the result URL prefilled.

### 6.2 Settings (`/settings`)

Tabs: **General** | **Connection** | **Speed** | **Downloads** | **Behavior** | **Search Plugins**.

- First five tabs map directly to `app/preferences` fields.
- **Search Plugins** tab lists installed plugins (name, version, enabled toggle), with actions: Install from URL, Update all, Uninstall.

## 7. Keyboard model

Vim-style modal-ish bindings. Handler is a single registered registry; every binding has `{ context, keys, action, label }` so the help overlay (`?`) is generated automatically.

| Context | Key | Action |
|---|---|---|
| List | `j` / `k` | move row down / up |
| List | `gg` / `G` | top / bottom |
| List | `space` | toggle select |
| List | `x` | enter multi-select mode |
| List | `enter` | open details |
| List | `p` / `r` | pause / resume selection |
| List | `d` | delete selection (confirm) |
| List | `R` | force recheck |
| List | `c` | set category |
| List | `t` | edit tags |
| Global | `a` | add torrent |
| Global | `/` | filter list |
| Global | `gs` | go to search |
| Global | `gp` | go to plugin manager |
| Global | `gh` | go home (list) |
| Global | `?` | help overlay |
| Modal | `esc` | close |

## 8. Components

```
src/
  api/
    client.ts           fetch wrapper, auth, retry
    torrents.ts         /torrents/* + types
    sync.ts             /sync/maindata + diff applier
    search.ts           /search/* + plugin endpoints
    prefs.ts            /app/preferences
    types.ts            shared API types
  hooks/
    useSync.ts          live torrent state via polling
    useStats.ts         derived global stats
    useSearch.ts        manages search session lifecycle
    useKeybinds.ts      registers bindings for a context
  components/
    Layout/
      TopBar.tsx
      Sidebar.tsx
      DetailsPanel.tsx
    List/
      TorrentTable.tsx
      TorrentRow.tsx
      ColumnHeader.tsx
      StatusPill.tsx
      ProgressBar.tsx
    Modals/
      AddTorrent.tsx
      ConfirmDelete.tsx
      SetCategory.tsx
      EditTags.tsx
      Help.tsx
    Search/
      SearchPage.tsx
      SearchBar.tsx
      ResultsTable.tsx
    Settings/
      SettingsPage.tsx
      tabs/{General,Connection,Speed,Downloads,Behavior,Plugins}.tsx
  pages/
    TorrentListPage.tsx
    SearchPage.tsx
    SettingsPage.tsx
    LoginPage.tsx
  stores/
    selection.ts        selected torrent hashes
    ui.ts               panel open, sort column, filter
  styles/
    theme.css           palette, fonts, base resets
    tailwind.css
  keyboard/
    registry.ts         binding map
    handler.ts          DOM listener, context resolution
  App.tsx
  main.tsx
```

Each unit has a single concern and is testable in isolation. The sync diff applier and keyboard registry are pure modules behind interfaces — they get unit tests; the React components stay thin.

## 9. Data flow

1. Login page → `POST /auth/login` → cookie set → redirect to `/`.
2. `App` mounts. `useSync` starts polling `sync/maindata`. First call returns full snapshot, subsequent calls return diffs keyed by `rid`.
3. Snapshot applied to TanStack Query cache (`['torrents']` and `['stats']`). Components subscribe.
4. Selection / panel state in Zustand. Mutations call API directly, then optimistically update or invalidate the query.
5. Search has its own session lifecycle: `start` returns an `id`, then poll `status` + `results` until `status === Stopped`, then `delete` to free the session on the server.

## 10. Error handling

- 401/403 → bounce to login, preserve return URL
- Network errors → toast, exponential backoff on next poll (max 10 s)
- Mutation failures → toast with API error message, no silent retries
- Plugin install failures (the qB plugin endpoints return 200 even on failure) → poll `/search/plugins` after install attempts and diff against previous list to detect success

## 11. Testing

**Unit (Vitest):**
- `sync.applyDiff` against fixture snapshots
- Format helpers (size, speed, ETA, ratio)
- Keyboard registry resolution by context
- Filter/sort logic for the list

**Integration (Playwright, opt-in):**
- Login → list shows torrents → pause → resume → delete
- Add torrent (magnet) → appears in list within 3 s
- Search → results populate → enter → add modal opens prefilled
- Skipped unless `QBT_URL` env is set

No mocking of qBittorrent itself in integration tests — real instance only.

## 12. Build and deployment

- `npm run build` produces `dist/` of static files
- `index.html` + hashed JS/CSS, no SSR
- Set qBittorrent's "Use alternative WebUI" to point at `dist/`, or serve from anywhere and configure CORS in qB
- Single-file dev: `npm run dev` with Vite proxy to `http://localhost:8080`

## 13. Open questions

None blocking. Tunable later:
- Default poll interval (1500 ms felt right; we'll let users override in settings)
- Whether to ship a Docker image bundling qB + this UI as one unit (post-v1)

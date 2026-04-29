# qbt-ui

Modern, keyboard-first, GitHub-Primer-flavoured replacement Web UI for **qBittorrent**. Talks to qBittorrent's `/api/v2` directly — no backend of its own. Ships as a static SPA, so you can serve it however you like (Docker, alternative-WebUI, any static host).

> Status: v1.1 — feature-complete for daily use.

## Features

- **Live torrent list** — virtualised, sortable, filterable. Status pills, GitHub-style labels, `↓ ↑` sparklines, connection-status dot, free-space indicator.
- **Vim-style keybindings** — `j/k` row, `space` select, `enter` open details, `p` pause, `r` resume, `d` delete, `c` set category, `t` edit tags, `R` recheck, `gs` search, `gn` settings, `gh` home, `?` help, …
- **Right-click everything** — pause/resume/recheck/reannounce, sequential download, first-and-last-piece priority, queue position (top/up/down/bottom), move save location, set category/tags, rate limits, force start, export `.torrent`, delete.
- **Bulk operations** — shift-click range, `cmd/ctrl+a` select all, multi-target every action.
- **Drag-and-drop** — drop a `.torrent` file or paste a magnet anywhere on the page to add it.
- **Search engine + plugin manager** — full qBittorrent search with live results table and the install/enable/disable/update flow for `.py` plugins.
- **Per-file priority editor** in details (Skip / Normal / High / Max).
- **Tracker editor** — add, edit, remove trackers per torrent.
- **Inline file rename** in details panel.
- **Settings** — preferences pages for General, Connection, Speed, Downloads, Behavior, plus Search Plugins.
- **Log viewer** — colour-coded live tail of qBittorrent's main log.
- **Desktop notifications** when torrents complete (permission requested on first user interaction).
- **PWA-installable** — add to home screen / dock as a standalone app.
- **Persistent UI state** — filter and sort survive reloads.
- **Dark theme** — GitHub Primer dark.

## Quick start (Docker)

The included compose file runs **qBittorrent + qbt-ui** as one stack:

```bash
git clone https://github.com/<you>/qbt-ui.git
cd qbt-ui
cp .env.example .env       # edit ports / volumes / TZ as you like
docker compose up -d
open http://localhost:8080  # or whatever WEB_PORT you set
```

First-time qBittorrent login is `admin / adminadmin` until you change it in Settings → Web UI inside qBittorrent. Persistent state lives under `./data/` by default.

If you'd rather point qbt-ui at an **existing** qBittorrent instance:

```yaml
# docker-compose.override.yml
services:
  qbittorrent: !reset null
  qbt-ui:
    depends_on: !reset []
    environment:
      QBT_BACKEND: http://192.168.1.2:8080
```

…or skip compose entirely and just run the image:

```bash
docker run --rm -p 8080:80 \
  -e QBT_BACKEND=http://192.168.1.2:8080 \
  ghcr.io/<you>/qbt-ui:latest
```

## Quick start (development)

Requires Node 20.19+.

```bash
npm install --legacy-peer-deps
QBT_URL=http://localhost:8080 npm run dev
# open http://localhost:5173
```

The Vite dev server proxies `/api/*` to whatever `QBT_URL` you point at.

## Configuration

| Variable | Default | What it does |
|---|---|---|
| `WEB_PORT` | `8080` | Host port the UI listens on (compose only) |
| `QBT_BACKEND` | `http://qbittorrent:8080` | qBittorrent base URL the nginx proxies to |
| `QBT_PORT` | `8888` | Host port for qBittorrent's classic WebUI |
| `BT_PORT` | `6881` | BitTorrent TCP/UDP listen port |
| `PUID` / `PGID` | `1000` | User and group the qBittorrent container runs as |
| `TZ` | `Etc/UTC` | Timezone for both containers |
| `CONFIG_DIR` | `./data/config` | Host path for qBittorrent state |
| `DOWNLOADS_DIR` | `./data/downloads` | Host path for downloads |

The Web UI listens on container port `80`; map any host port via the `WEB_PORT` env var.

## Tests

```bash
npm test                                # vitest watch
npm run test:run                        # one-shot
QBT_URL=http://192.168.1.2:8080 npm run e2e   # opt-in Playwright smoke
```

68 unit tests across format helpers, sync diff, list ops, keyboard registry, store reducers, completion-notification logic, and the StatusPill atom.

## Architecture

- **Build:** Vite + TypeScript, strict
- **UI:** React 19, Tailwind v4 (CSS `@theme` tokens, no config file), lucide-style monochrome
- **Server state:** TanStack Query
- **Live state:** `/sync/maindata` polled every 1.5 s, diff-applied to a Zustand-flavoured normalized store
- **Local state:** Zustand with `persist` middleware for filter/sort
- **Routing:** React Router 7 (`/login`, `/`, `/search`, `/settings/*`)
- **Static-only:** the production bundle has no Node runtime; nginx serves the assets and proxies `/api/*` to qBittorrent

## Keybindings

Press **`?`** inside the app for the auto-generated cheat sheet (it reads directly from the binding registry, so it's always accurate).

## Project layout

```
src/
  api/           Typed wrappers around /api/v2 + /transfer/* + /log/*
  components/    Layout, List, Modals, Details, Search, Settings, ui (atoms)
  hooks/         useSync, useStats, useSpeedHistory, useCompletionNotifications, useKeybinds
  keyboard/      Registry + DOM handler + sequence buffer
  lib/           Pure utilities (format, listOps)
  pages/         Login, TorrentList, Search, Settings
  stores/        Selection (Set), UI (filters/sort/modal/details)
  styles/        theme.css + tailwind.css
```

## Contributing

Issues and PRs welcome. The codebase is small and well-typed; before opening a PR, run:

```bash
npm run typecheck && npm run test:run && npm run build
```

## License

MIT — see [LICENSE](LICENSE).

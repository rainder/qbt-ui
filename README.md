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

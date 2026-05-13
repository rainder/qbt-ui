# PWA setup for iOS standalone (and Android)

How to set up a React + Vite + Tailwind SPA so it behaves correctly as an installed PWA on iOS — full-screen height, no top/bottom gaps, floating bottom tab bar, safe-area aware, virtualized lists that don't break.

The headline rule: **do NOT force `height: 100%` down the `html → body → #root → page` chain**. That cascade is the single biggest source of iOS PWA bugs (empty top gap, content not reaching the bottom, floating bar overlapping rows weirdly). Let the body grow naturally and scroll the document instead.

## 1. `index.html` meta tags

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#0d1117" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="YourApp" />
<link rel="apple-touch-icon" href="/icon-192.png" />
```

Why each one matters:

- `viewport-fit=cover` — required for `env(safe-area-inset-*)` to return non-zero on iPhones with a notch or Dynamic Island. Without it the safe-area envs are all zero and your bottom bar overlaps the home indicator.
- `maximum-scale=1` — prevents accidental pinch-zoom that breaks iOS's viewport size reporting.
- `apple-mobile-web-app-capable=yes` — required to even run as a standalone PWA on iOS.
- `apple-mobile-web-app-status-bar-style=black-translucent` — makes the iOS status bar translucent so the app paints behind it. Pair with a sticky/sticky-styled top element whose background is dark; that background shows through the status bar so it looks unified.
- `apple-touch-icon` — iOS uses this for the home-screen icon. PNG is more reliable than SVG.

## 2. Web manifest

```js
// vite.config.ts (with vite-plugin-pwa)
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Your App',
    short_name: 'App',
    theme_color: '#0d1117',
    background_color: '#0d1117',  // MUST match your app's canvas color
    display: 'standalone',         // not 'fullscreen' — keeps the iOS status bar
    start_url: '/',
    scope: '/',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
})
```

`background_color` is what iOS paints during launch before your JS boots. If it doesn't match your canvas color you'll see a white flash on every launch.

## 3. Global CSS — what NOT to do, then what to do

### Don't do this

```css
/* This breaks iOS PWA layout in subtle ways. */
html, body, #root { height: 100%; }
```

Cascading `height: 100%` through four levels is fragile on iOS — any quirk in any layer collapses the chain. You'll get an empty strip at the top or bottom and won't be able to figure out why. `100dvh` helps a bit but doesn't fully fix it.

### Do this

```css
:root { color-scheme: dark; }  /* or 'light' */

html {
  /* Stop the document rubber-banding so the body bg can't be revealed. */
  overscroll-behavior-y: contain;
  /* Kill the blue tap-flash on iOS. */
  -webkit-tap-highlight-color: transparent;
  /* Suppress the long-press "save image / copy link" menu on UI chrome. */
  -webkit-touch-callout: none;
}

body {
  margin: 0;
  background: var(--color-canvas);
  color: var(--color-fg-default);
  font-family: -apple-system, BlinkMacSystemFont, ...;
}

/* iOS paints html's background up to the viewport edges even if html is
   shorter than the viewport, so a colored html background prevents any
   white edge from showing through. */
html { background: var(--color-canvas); }

/* Non-text interactive elements: kill text selection and the 300ms tap delay. */
button, a, [role='button'], [role='tab'], [role='menuitem'], [role='option'] {
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

/* iOS Safari zooms on focus when input font-size is < 16px. Bump it on phones. */
@media (max-width: 767px) {
  input:not([type='checkbox']):not([type='radio']):not([type='range']):not([type='color']):not([type='file']),
  select,
  textarea {
    font-size: 16px;
  }
}
```

No height settings on `html`, `body`, or `#root`. The body grows with content, the document scrolls.

## 4. Page layout — `min-h-screen`, not `h-full`

```tsx
export function SomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <TopBar />  {/* sticky top-0 z-20 — see §6 */}
      <div className="flex-1 flex">
        <Sidebar />  {/* md:sticky md:top-14 h-[calc(100vh-3.5rem)] — see §6 */}
        <main className="flex-1 min-w-0 flex flex-col">
          <List />  {/* document scroll — see §5 */}
        </main>
      </div>
    </div>
  );
}
```

- Outer: `min-h-screen flex flex-col`. Page is at least 100vh, grows beyond if content overflows.
- Inside: regular flex layout, **no `overflow-auto`** anywhere. The browser scrolls the document.
- Tailwind's `min-h-screen` resolves to `min-height: 100vh`, which is reliable on iOS PWA.

## 5. Virtualized lists with document scroll

`@tanstack/react-virtual`'s `useVirtualizer` requires a fixed-height scroll container, which forces you back into the `h-full` cascade nightmare. Use `useWindowVirtualizer` instead — the window is the scroll container.

```tsx
import { useLayoutEffect, useRef, useState } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ rows }: { rows: Row[] }) {
  const listRef = useRef<HTMLDivElement>(null);

  // The list starts somewhere below the document top (after the TopBar,
  // sticky sort header, etc.). The virtualizer needs that offset.
  const [scrollMargin, setScrollMargin] = useState(0);
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const recalc = () => {
      setScrollMargin(el.getBoundingClientRect().top + window.scrollY);
    };
    recalc();
    window.addEventListener('resize', recalc);
    // Re-measure when ancestors resize (sidebar opening, orientation change).
    const ro = new ResizeObserver(recalc);
    if (el.parentElement) ro.observe(el.parentElement);
    return () => {
      window.removeEventListener('resize', recalc);
      ro.disconnect();
    };
  }, []);

  const v = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 44,  // your row height
    overscan: 16,
    scrollMargin,
  });

  return (
    <div className="pb-mobile-nav">
      {/* Sticky sort header — top-0 on mobile, top-14 below TopBar on desktop. */}
      <div className="sticky top-0 md:top-14 z-10 bg-canvas-subtle">
        <SortHeader />
      </div>
      <div ref={listRef} style={{ height: v.getTotalSize(), position: 'relative' }}>
        {v.getVirtualItems().map((vi) => (
          <div
            key={rows[vi.index].id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              transform: `translateY(${vi.start - scrollMargin}px)`,
            }}
          >
            <Row data={rows[vi.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

The critical detail is `translateY(${vi.start - scrollMargin}px)`. `vi.start` is in document-scroll coordinates; subtracting `scrollMargin` gives the position relative to the list container.

## 6. Sticky positioning for chrome

With document scroll, your TopBar and Sidebar need to be sticky so they stay put while the user scrolls.

```tsx
// TopBar — sticky at top of viewport.
<div className="sticky top-0 z-20 h-14 bg-canvas border-b ...">

// Sidebar — sticky below TopBar on desktop, fixed slide-in on mobile.
<div className="
  fixed md:sticky md:top-14
  inset-y-0 left-0 z-30 md:z-auto
  h-screen md:h-[calc(100vh-3.5rem)]   {/* 100vh - TopBar height */}
">

// Sort/column header inside the list — sticky below TopBar on desktop, at top of viewport on mobile (where TopBar is hidden).
<div className="sticky top-0 md:top-14 z-10 bg-canvas-subtle">
```

Z-index stack (bottom to top):
- `z-10` — sticky sort/column header
- `z-20` — TopBar, fixed-bottom DetailsPanel (desktop)
- `z-30` — Mobile sidebar slide-in, MobileBottomBar floating pill
- `z-40` — Mobile fullscreen detail overlays (covers MobileBottomBar)
- `z-50` — Modals

## 7. Floating bottom pill bar (mobile)

The right pattern: a **wide pill** with small side gutters, translucent with backdrop blur, positioned with `max()` for the bottom inset.

```tsx
export function MobileBottomBar() {
  return (
    <div
      className="md:hidden fixed left-3.5 right-3.5 z-30 pointer-events-none"
      style={{ bottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="
        pointer-events-auto flex items-center justify-around gap-1 px-2 h-[62px]
        rounded-[28px] border border-border-muted
        bg-canvas-subtle/80 backdrop-blur-xl backdrop-saturate-150
        shadow-[0_10px_40px_rgba(0,0,0,0.45),0_2px_6px_rgba(0,0,0,0.25)]
      ">
        {/* tabs — each one: flex-1 max-w-[64px] */}
      </div>
    </div>
  );
}
```

- `left-3.5 right-3.5` — 14px gutters on both sides. Avoid the narrow centered `left-1/2 -translate-x-1/2` pattern; it looks lost on the screen.
- `h-[62px] rounded-[28px]` — natural iOS pill proportions.
- `bg-canvas-subtle/80 backdrop-blur-xl backdrop-saturate-150` — proper translucent + blur, so content scrolling behind it looks intentional.
- `bottom: max(0.5rem, env(safe-area-inset-bottom))` — at least 8px from the bottom on devices without a safe area, more on iPhones with a home indicator. Use `max()` instead of `calc(env() + 4px)` so it works on both kinds of devices.
- `z-30` so it sits behind mobile fullscreen overlays (`z-40`).

**Render the bar inside an `AuthGate` / `RequireAuth` wrapper alongside `<Outlet />`** so it appears on every authenticated route automatically:

```tsx
return (
  <>
    <Outlet />
    <MobileBottomBar />
  </>
);
```

Then reserve space at the bottom of every mobile scroll area so the last row can clear the bar:

```css
.pb-mobile-nav {
  padding-bottom: 90px;  /* static — bar is ~62px + ~28px clearance */
}
@media (min-width: 768px) {
  .pb-mobile-nav {
    padding-bottom: 0;  /* bar is hidden on desktop */
  }
}
```

Apply `pb-mobile-nav` to the **content root** of each page (the table, the search results wrapper, the settings content). Don't use `env()` math here — it's already baked into the bar's own `bottom`, and using static `90px` is what works reliably.

## 8. Safe-area top — per-element, not global

iOS status bar style `black-translucent` makes the system status bar paint OVER the top of your app. You need to push content below it, but NOT by putting `padding-top: env(safe-area-inset-top)` on `#root` — that leaves an unfilled colored strip when the topmost element doesn't have a background.

Instead, put the safe-area inset on the **topmost visible element on each page**, so its background extends behind the status bar:

```tsx
// Sticky sort/column header on the torrent list
<div
  className="flex items-center bg-canvas-subtle ..."
  style={{ paddingTop: 'calc(env(safe-area-inset-top) + 6px)' }}
>
  <SortButtons />
</div>

// Top input bar on the search page
<form
  className="flex flex-wrap gap-2 px-4 pb-4 bg-canvas-subtle ..."
  style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
>
```

Use **inline `style`**, not a `.pt-safe` Tailwind class — Tailwind's `p-*` shorthand utilities load after your custom CSS and will override `padding-top: env(...)`.

The result on iOS: the iOS status bar is translucent and shows the dark canvas-subtle color through it, with white system text on top. Your sort buttons sit just below the status bar. No empty top gap.

## 9. Fixed-bottom detail panels (desktop)

When the document scrolls, an inline desktop "details panel below the list" would float to the bottom of the document — useless. Switch it to `position: fixed` and add a spacer above to keep the last list row scrollable.

```tsx
// In the page
<List />
{detailsOpen && (
  <>
    <div aria-hidden className="hidden md:block" style={{ height: '40vh' }} />
    <DetailsPanel torrent={t} />
  </>
)}

// DetailsPanel desktop view
<div
  className={clsx(
    'fixed bottom-0 right-0 z-20 border-t bg-canvas-subtle flex flex-col',
    sidebarCollapsed ? 'left-0' : 'left-0 md:left-60',  // clear the sticky sidebar
  )}
  style={{ height: '40vh' }}
>
```

The 40vh spacer is in the document flow so the user can scroll their last row above the fixed panel; the panel itself is fixed and overlays the bottom of the viewport.

## 10. Drag-drop / modal overlays — use `fixed`, not `absolute`

With document scroll, `position: absolute` on a page-level overlay anchors to the page's coordinate system, which can extend below the viewport. Always use `position: fixed inset-0` for full-screen overlays so they cover the **viewport** regardless of scroll position.

```tsx
{isDragging && (
  <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
    <div className="absolute inset-4 border-2 border-dashed ..." />
  </div>
)}
```

## 11. Quick debugging checklist

Symptoms and what to look for:

- **Big empty strip at top under iOS status bar** → `#root` has `padding-top: env(safe-area-inset-top)`. Remove it and add the inset to the topmost visible element of each page via inline `style`.
- **Big empty strip at bottom above the home indicator** → either too much `pb-mobile-nav` padding, or the bar's `bottom` is using `env() + N` instead of `max(0.5rem, env())`. Try static `pb: 90px` and `bottom: max(0.5rem, env(safe-area-inset-bottom))`.
- **Content doesn't fill the screen** → `html, body, #root` are still forcing `height: 100%`. Remove it; let pages use `min-h-screen` and the document scroll.
- **Floating bar feels lost, content visible around it** → bar is a narrow centered pill (`left-1/2 -translate-x-1/2`). Switch to wide pill (`left-3.5 right-3.5`).
- **Content peeks through the floating bar weirdly** → bar isn't translucent enough. Use `bg-X/80 backdrop-blur-xl backdrop-saturate-150`.
- **Sticky header overlaps the TopBar on desktop** → sticky element has `top-0`. Use `top-0 md:top-14` (or whatever your TopBar height is).
- **Virtualized list rows positioned wrong / scroll-jumps** → using `useVirtualizer` (container scroll) but should be `useWindowVirtualizer` (window scroll). Or `vi.start` isn't being adjusted by `scrollMargin`.
- **404s / weird behavior on PWA after a fix** → iOS aggressively caches the manifest and service worker. Remove the PWA from the home screen, hard-refresh in Safari, then re-add.

## 12. One last thing — body background

Even with all of the above, you can occasionally see white edges on iOS PWA during rubber-band or transitions. Belt-and-braces:

```css
html { background: var(--color-canvas); }
body { background: var(--color-canvas); }
```

Both. The root element's background paints to the viewport edges in the CSS spec, but iOS occasionally paints the area between html and body. Setting both costs nothing.

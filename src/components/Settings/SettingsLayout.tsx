import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { TopBar } from '@/components/Layout/TopBar';
import { useSync } from '@/hooks/useSync';
import { useUi } from '@/stores/ui';
import General from './tabs/General';
import Connection from './tabs/Connection';
import Speed from './tabs/Speed';
import Downloads from './tabs/Downloads';
import Behavior from './tabs/Behavior';

const TABS = [
  { to: 'general', label: 'General' },
  { to: 'connection', label: 'Connection' },
  { to: 'speed', label: 'Speed' },
  { to: 'downloads', label: 'Downloads' },
  { to: 'behavior', label: 'Behavior' },
  { to: 'plugins', label: 'Search plugins' },
];

export function SettingsLayout({ pluginsTab }: { pluginsTab: React.ReactNode }) {
  const { state } = useSync();
  const sidebarCollapsed = useUi((s) => s.sidebarCollapsed);
  const toggleSidebar = useUi((s) => s.toggleSidebar);

  // Close the overlay sidebar when picking a tab on mobile.
  function onTabClick() {
    if (typeof window !== 'undefined' && window.innerWidth < 768 && !sidebarCollapsed) {
      toggleSidebar();
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar serverState={state.serverState} />
      <div className="flex-1 flex relative">
        {!sidebarCollapsed && (
          <>
            {/* Mobile-only backdrop. Pinned to viewport so it works with
                document scroll. */}
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={toggleSidebar}
              className="md:hidden fixed inset-0 z-20 bg-black/50"
            />
            {/* Settings sidebar — overlay on mobile, sticky on md+ */}
            <div className="fixed md:sticky md:top-14 inset-y-0 left-0 z-30 md:z-auto flex h-screen md:h-[calc(100vh-3.5rem)]">
              <nav
                className="w-60 bg-canvas border-r border-border-muted pb-4 px-3 flex flex-col gap-px shrink-0 overflow-y-auto"
                style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
              >
                <div className="text-fg-muted text-xs font-semibold uppercase tracking-wider px-3 mb-1">
                  Settings
                </div>
                {TABS.map((t) => (
                  <NavLink
                    key={t.to}
                    to={`/settings/${t.to}`}
                    onClick={onTabClick}
                    className={({ isActive }) =>
                      [
                        'flex items-center rounded-md px-3 py-1.5 text-sm transition-colors',
                        isActive
                          ? 'bg-accent-subtle text-fg-default font-semibold'
                          : 'text-fg-default hover:bg-canvas-subtle',
                      ].join(' ')
                    }
                  >
                    {t.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </>
        )}
        {/* Content — flows in the document, no internal scroll. */}
        <div
          className="flex-1 px-6 pb-mobile-nav max-w-3xl"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)' }}
        >
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

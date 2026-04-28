import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { TopBar } from '@/components/Layout/TopBar';
import { useSync } from '@/hooks/useSync';
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
  return (
    <div className="h-screen flex flex-col">
      <TopBar serverState={state.serverState} />
      <div className="flex-1 min-h-0 flex">
        {/* Settings sidebar */}
        <nav className="w-60 bg-canvas border-r border-border-muted py-4 px-3 flex flex-col gap-px shrink-0">
          <div className="text-fg-muted text-xs font-semibold uppercase tracking-wider px-3 mb-1">
            Settings
          </div>
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={`/settings/${t.to}`}
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
        {/* Content */}
        <div className="flex-1 overflow-auto p-6 max-w-3xl">
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

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
        <nav className="w-48 bg-bg2 border-r border-border py-3 px-2 text-xs flex flex-col gap-0.5">
          {TABS.map((t) => (
            <NavLink key={t.to} to={t.to}
              className={({ isActive }) =>
                `block rounded px-2.5 py-1.5 text-[12px] transition-colors ${isActive
                  ? 'bg-accent-bg text-fg2 font-medium ring-1 ring-inset ring-accent/40'
                  : 'text-fg hover:bg-bg3 hover:text-fg2'}`}
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

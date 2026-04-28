import { SettingsLayout } from '@/components/Settings/SettingsLayout';
import { PluginsTab } from '@/components/Settings/tabs/Plugins';

export default function SettingsPage() {
  return <SettingsLayout pluginsTab={<PluginsTab />} />;
}

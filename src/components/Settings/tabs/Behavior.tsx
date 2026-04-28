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

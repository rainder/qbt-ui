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

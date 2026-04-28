import { PrefsTab } from '../PrefsTab';
export default function Downloads() {
  return <PrefsTab fields={[
    { key: 'save_path',      label: 'default save path',        type: 'text' },
    { key: 'temp_path',      label: 'temp save path',           type: 'text' },
    { key: 'temp_path_enabled', label: 'use temp path',         type: 'bool' },
    { key: 'incomplete_files_ext', label: 'append .!qB to incomplete files', type: 'bool' },
    { key: 'auto_tmm_enabled', label: 'automatic torrent management default', type: 'bool' },
  ]} />;
}

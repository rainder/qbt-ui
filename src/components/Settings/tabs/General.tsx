import { PrefsTab } from '../PrefsTab';
export default function General() {
  return <PrefsTab fields={[
    { key: 'locale', label: 'locale', type: 'text' },
    { key: 'autorun_enabled', label: 'run external program on completion', type: 'bool' },
    { key: 'autorun_program', label: 'program path', type: 'text' },
    { key: 'preallocate_all', label: 'preallocate disk space for all files', type: 'bool' },
  ]} />;
}

import { PrefsTab } from '../PrefsTab';
export default function Connection() {
  return <PrefsTab fields={[
    { key: 'listen_port', label: 'listening port', type: 'number' },
    { key: 'random_port', label: 'use random port', type: 'bool' },
    { key: 'upnp', label: 'enable UPnP / NAT-PMP', type: 'bool' },
    { key: 'max_connec', label: 'max connections (global)', type: 'number' },
    { key: 'max_connec_per_torrent', label: 'max connections per torrent', type: 'number' },
  ]} />;
}

import type { ServerState } from '@/api/types';

export function useStats(serverState: ServerState | undefined) {
  return {
    dlSpeed: serverState?.dl_info_speed ?? 0,
    upSpeed: serverState?.up_info_speed ?? 0,
    ratio: parseFloat(serverState?.global_ratio ?? '0') || 0,
    freeSpace: serverState?.free_space_on_disk ?? 0,
    altRate: serverState?.use_alt_speed_limits ?? false,
    connection: serverState?.connection_status ?? 'disconnected',
  };
}

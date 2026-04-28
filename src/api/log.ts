import { apiGet } from './client';

export interface LogEntry {
  id: number;
  timestamp: number;  // unix ms
  type: number;       // 1 NORMAL, 2 INFO, 4 WARNING, 8 CRITICAL
  message: string;
}

export const fetchMainLog = (lastKnownId = -1) =>
  apiGet<LogEntry[]>('/log/main', { last_known_id: lastKnownId });

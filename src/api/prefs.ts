import { apiGet, apiPost } from './client';
import type { Preferences } from './types';

export const fetchPrefs = () => apiGet<Preferences>('/app/preferences');

export const setPrefs = (patch: Preferences) =>
  apiPost('/app/setPreferences', { json: JSON.stringify(patch) });

export const fetchVersion = () => apiGet<string>('/app/version');

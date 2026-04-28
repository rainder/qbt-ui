import { apiGet, apiPost } from './client';

export const getSpeedLimitsMode = () => apiGet<string>('/transfer/speedLimitsMode'); // returns "0" or "1"
export const toggleSpeedLimitsMode = () => apiPost('/transfer/toggleSpeedLimitsMode');

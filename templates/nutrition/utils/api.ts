import { createShopApiClient } from '@/src/services/apiClient';

const client = createShopApiClient('nutrition');

export const apiRequest = client.apiRequest;
export const api = client.api;

export default api;

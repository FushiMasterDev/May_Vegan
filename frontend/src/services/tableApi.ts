import { apiClient } from './apiClient';
import type { ApiItemResponse, RestaurantTable, TableStatus } from '@/types';

export async function listTables(params: { area?: string; status?: TableStatus } = {}) {
  const res = await apiClient.get<{ success: true; data: RestaurantTable[] }>('/tables', { params });
  return res.data.data;
}

export async function listAreas() {
  const res = await apiClient.get<{ success: true; data: string[] }>('/tables/areas');
  return res.data.data;
}

export interface TablePayload {
  code: string;
  seats: number;
  area: string;
  status?: TableStatus;
}

export async function createTable(payload: TablePayload) {
  const res = await apiClient.post<ApiItemResponse<RestaurantTable>>('/tables', payload);
  return res.data.data;
}

export async function updateTable(id: number, payload: Partial<TablePayload>) {
  const res = await apiClient.put<ApiItemResponse<RestaurantTable>>(`/tables/${id}`, payload);
  return res.data.data;
}

export async function updateTableStatus(id: number, status: TableStatus) {
  const res = await apiClient.put<ApiItemResponse<RestaurantTable>>(`/tables/${id}/status`, { status });
  return res.data.data;
}

export async function deleteTable(id: number) {
  await apiClient.delete(`/tables/${id}`);
}

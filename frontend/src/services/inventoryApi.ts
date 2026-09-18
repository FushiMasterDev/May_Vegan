import { apiClient } from './apiClient';
import type { ApiItemResponse, ApiListResponse, InventoryDashboard, InventoryTransaction, InventoryTransactionType } from '@/types';

export async function getInventoryDashboard() {
  const res = await apiClient.get<ApiItemResponse<InventoryDashboard>>('/inventory/dashboard');
  return res.data.data;
}

export async function listInventoryTransactions(params: {
  ingredientId?: number;
  type?: InventoryTransactionType;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
} = {}) {
  const res = await apiClient.get<ApiListResponse<InventoryTransaction>>('/inventory/transactions', { params });
  return res.data;
}

export interface CreateInventoryTransactionPayload {
  ingredientId: number;
  type: InventoryTransactionType;
  quantity: number;
  unitCost?: number;
  note?: string;
}

export async function createInventoryTransaction(payload: CreateInventoryTransactionPayload) {
  const res = await apiClient.post<ApiItemResponse<InventoryTransaction>>('/inventory/transactions', payload);
  return res.data.data;
}

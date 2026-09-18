import { apiClient } from './apiClient';
import type { ApiItemResponse, Supplier } from '@/types';

export async function listSuppliers() {
  const res = await apiClient.get<{ success: true; data: Supplier[] }>('/suppliers');
  return res.data.data;
}

export interface SupplierPayload {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export async function createSupplier(payload: SupplierPayload) {
  const res = await apiClient.post<ApiItemResponse<Supplier>>('/suppliers', payload);
  return res.data.data;
}

export async function updateSupplier(id: number, payload: Partial<SupplierPayload>) {
  const res = await apiClient.put<ApiItemResponse<Supplier>>(`/suppliers/${id}`, payload);
  return res.data.data;
}

export async function deleteSupplier(id: number) {
  await apiClient.delete(`/suppliers/${id}`);
}

import { apiClient } from './apiClient';
import type { ApiItemResponse, ApiListResponse, Customer } from '@/types';

export async function listCustomers(params: { search?: string; page?: number; limit?: number } = {}) {
  const res = await apiClient.get<ApiListResponse<Customer>>('/customers', { params });
  return res.data;
}

export async function getCustomer(id: number) {
  const res = await apiClient.get<ApiItemResponse<Customer>>(`/customers/${id}`);
  return res.data.data;
}

export async function setCustomerStatus(id: number, status: 'ACTIVE' | 'LOCKED') {
  const res = await apiClient.put<ApiItemResponse<Customer>>(`/customers/${id}/status`, { status });
  return res.data.data;
}

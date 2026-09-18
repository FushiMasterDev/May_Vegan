import { apiClient } from './apiClient';
import type { ApiItemResponse, Category } from '@/types';

interface ListResponse {
  success: true;
  data: Category[];
}

export async function listCategories(search?: string) {
  const res = await apiClient.get<ListResponse>('/categories', { params: { search } });
  return res.data.data;
}

export async function getCategory(id: number) {
  const res = await apiClient.get<ApiItemResponse<Category>>(`/categories/${id}`);
  return res.data.data;
}

export interface CategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export async function createCategory(payload: CategoryPayload) {
  const res = await apiClient.post<ApiItemResponse<Category>>('/categories', payload);
  return res.data.data;
}

export async function updateCategory(id: number, payload: Partial<CategoryPayload>) {
  const res = await apiClient.put<ApiItemResponse<Category>>(`/categories/${id}`, payload);
  return res.data.data;
}

export async function deleteCategory(id: number) {
  await apiClient.delete(`/categories/${id}`);
}

import { apiClient } from './apiClient';
import type { ApiItemResponse, ApiListResponse, Ingredient } from '@/types';

export async function listIngredients(params: { search?: string; lowStockOnly?: boolean; page?: number; limit?: number } = {}) {
  const res = await apiClient.get<ApiListResponse<Ingredient>>('/ingredients', { params });
  return res.data;
}

export interface IngredientPayload {
  name: string;
  unit: string;
  minStockLevel?: number;
  costPrice?: number;
  supplierId?: number;
  expiryDate?: string;
  initialQuantity?: number;
}

export async function createIngredient(payload: IngredientPayload) {
  const res = await apiClient.post<ApiItemResponse<Ingredient>>('/ingredients', payload);
  return res.data.data;
}

export async function updateIngredient(id: number, payload: Partial<IngredientPayload>) {
  const res = await apiClient.put<ApiItemResponse<Ingredient>>(`/ingredients/${id}`, payload);
  return res.data.data;
}

export async function deleteIngredient(id: number) {
  await apiClient.delete(`/ingredients/${id}`);
}

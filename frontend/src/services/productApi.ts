import { apiClient } from './apiClient';
import type { ApiItemResponse, ApiListResponse, Product, ProductStatus } from '@/types';

export interface ListProductParams {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  onSale?: boolean;
  isNew?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'popular' | 'newest' | 'rating';
  page?: number;
  limit?: number;
}

export async function listProducts(params: ListProductParams = {}) {
  const res = await apiClient.get<ApiListResponse<Product>>('/products', { params });
  return res.data;
}

export async function getProduct(idOrSlug: string | number) {
  const res = await apiClient.get<ApiItemResponse<Product>>(`/products/${idOrSlug}`);
  return res.data.data;
}

export interface ProductPayload {
  categoryId: number;
  name: string;
  slug?: string;
  description?: string;
  ingredientsText?: string;
  calories?: number;
  allergyInfo?: string;
  price: number;
  salePrice?: number | null;
  status?: ProductStatus;
  isFeatured?: boolean;
  isBestSeller?: boolean;
}

export async function createProduct(payload: ProductPayload) {
  const res = await apiClient.post<ApiItemResponse<Product>>('/products', payload);
  return res.data.data;
}

export async function updateProduct(id: number, payload: Partial<ProductPayload>) {
  const res = await apiClient.put<ApiItemResponse<Product>>(`/products/${id}`, payload);
  return res.data.data;
}

export async function deleteProduct(id: number) {
  await apiClient.delete(`/products/${id}`);
}

export async function uploadProductImage(id: number, file: File, isPrimary: boolean) {
  const form = new FormData();
  form.append('image', file);
  form.append('isPrimary', String(isPrimary));
  const res = await apiClient.post(`/products/${id}/images`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function removeProductImage(productId: number, imageId: number) {
  await apiClient.delete(`/products/${productId}/images/${imageId}`);
}

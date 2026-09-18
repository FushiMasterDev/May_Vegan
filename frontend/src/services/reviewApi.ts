import { apiClient } from './apiClient';
import type { ApiItemResponse, ApiListResponse, Review } from '@/types';

export async function listProductReviews(productId: number, params: { page?: number; limit?: number } = {}) {
  const res = await apiClient.get<ApiListResponse<Review>>(`/products/${productId}/reviews`, { params });
  return res.data;
}

export async function listRecentReviews(limit = 6) {
  const res = await apiClient.get<{ success: true; data: Review[] }>('/reviews/recent', { params: { limit } });
  return res.data.data;
}

export async function listAllReviews(params: { productId?: number; status?: 'VISIBLE' | 'HIDDEN'; page?: number; limit?: number } = {}) {
  const res = await apiClient.get<ApiListResponse<Review>>('/reviews', { params });
  return res.data;
}

export interface CreateReviewPayload {
  productId: number;
  orderId: number;
  rating: number;
  comment?: string;
  imageUrl?: string;
}

export async function createReview(payload: CreateReviewPayload) {
  const res = await apiClient.post<ApiItemResponse<Review>>('/reviews', payload);
  return res.data.data;
}

export async function hideReview(id: number) {
  await apiClient.put(`/reviews/${id}/hide`);
}

export async function unhideReview(id: number) {
  await apiClient.put(`/reviews/${id}/unhide`);
}

export async function deleteReview(id: number) {
  await apiClient.delete(`/reviews/${id}`);
}

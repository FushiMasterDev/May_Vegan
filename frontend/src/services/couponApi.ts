import { apiClient } from './apiClient';
import type { ApiItemResponse, ApiListResponse, Coupon, CouponDiscountType, CouponStatus } from '@/types';

export async function listCoupons(params: { status?: CouponStatus; page?: number; limit?: number } = {}) {
  const res = await apiClient.get<ApiListResponse<Coupon>>('/coupons', { params });
  return res.data;
}

export interface CouponPayload {
  code: string;
  name: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  status?: CouponStatus;
}

export async function createCoupon(payload: CouponPayload) {
  const res = await apiClient.post<ApiItemResponse<Coupon>>('/coupons', payload);
  return res.data.data;
}

export async function updateCoupon(id: number, payload: Partial<CouponPayload>) {
  const res = await apiClient.put<ApiItemResponse<Coupon>>(`/coupons/${id}`, payload);
  return res.data.data;
}

export async function deleteCoupon(id: number) {
  await apiClient.delete(`/coupons/${id}`);
}

export async function validateCoupon(code: string, orderAmount: number) {
  const res = await apiClient.post<ApiItemResponse<{ coupon: Coupon; discountAmount: number }>>('/coupons/validate', {
    code,
    orderAmount,
  });
  return res.data.data;
}

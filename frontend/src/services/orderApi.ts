import { apiClient } from './apiClient';
import type { ApiItemResponse, ApiListResponse, Order, OrderStatus, OrderType, PaymentMethod } from '@/types';

export interface CreateOrderPayload {
  orderType: OrderType;
  tableId?: number;
  items: Array<{ productId: number; quantity: number; note?: string }>;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  deliveryAddress?: string;
  note?: string;
  requestedTime?: string;
  couponCode?: string;
  paymentMethod: PaymentMethod;
}

export async function createOrder(payload: CreateOrderPayload) {
  const res = await apiClient.post<ApiItemResponse<Order>>('/orders', payload);
  return res.data.data;
}

export async function getOrderByCode(code: string) {
  const res = await apiClient.get<ApiItemResponse<Order>>(`/orders/code/${code}`);
  return res.data.data;
}

export async function getOrder(id: number) {
  const res = await apiClient.get<ApiItemResponse<Order>>(`/orders/${id}`);
  return res.data.data;
}

export async function myOrders() {
  const res = await apiClient.get<{ success: true; data: Order[] }>('/orders/mine');
  return res.data.data;
}

export interface ListOrderParams {
  status?: OrderStatus;
  orderType?: OrderType;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export async function listOrders(params: ListOrderParams = {}) {
  const res = await apiClient.get<ApiListResponse<Order>>('/orders', { params });
  return res.data;
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  const res = await apiClient.put<ApiItemResponse<Order>>(`/orders/${id}/status`, { status });
  return res.data.data;
}

export async function transferOrderTable(id: number, tableId: number) {
  const res = await apiClient.put<ApiItemResponse<Order>>(`/orders/${id}/table`, { tableId });
  return res.data.data;
}

export async function cancelOrder(id: number) {
  const res = await apiClient.post<ApiItemResponse<Order>>(`/orders/${id}/cancel`);
  return res.data.data;
}

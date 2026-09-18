import { apiClient } from './apiClient';
import type { ApiItemResponse, DashboardStatistics } from '@/types';

export async function getStatistics() {
  const res = await apiClient.get<ApiItemResponse<DashboardStatistics>>('/dashboard/statistics');
  return res.data.data;
}

export async function getOrdersByStatus() {
  const res = await apiClient.get<{ success: true; data: Array<{ status: string; count: number }> }>(
    '/dashboard/orders-by-status'
  );
  return res.data.data;
}

export async function getRevenueTrend(days = 14) {
  const res = await apiClient.get<{ success: true; data: Array<{ date: string; revenue: number }> }>(
    '/dashboard/revenue-trend',
    { params: { days } }
  );
  return res.data.data;
}

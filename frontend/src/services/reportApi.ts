import { apiClient } from './apiClient';
import type { ApiItemResponse, RevenueReport } from '@/types';

export type RevenueRange = 'today' | '7d' | '30d' | 'month' | 'year' | 'custom';

export async function getRevenueReport(range: RevenueRange, from?: string, to?: string) {
  const res = await apiClient.get<ApiItemResponse<RevenueReport>>('/reports/revenue', {
    params: { range, from, to },
  });
  return res.data.data;
}

// Endpoint yêu cầu xác thực nên không thể tải qua thẻ <a href> trực tiếp
// (sẽ thiếu Bearer token) — tải qua axios rồi tự kích hoạt download.
export async function downloadRevenueCsv(range: RevenueRange, from?: string, to?: string): Promise<void> {
  const res = await apiClient.get('/reports/revenue', {
    params: { range, from, to, export: 'csv' },
    responseType: 'blob',
  });
  const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `doanh-thu-${range}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

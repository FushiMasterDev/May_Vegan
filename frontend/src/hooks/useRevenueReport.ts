import { useQuery } from '@tanstack/react-query';
import { getRevenueReport, type RevenueRange } from '@/services/reportApi';

export function useRevenueReport(range: RevenueRange, from?: string, to?: string) {
  return useQuery({
    queryKey: ['revenue-report', range, from, to],
    queryFn: () => getRevenueReport(range, from, to),
    enabled: range !== 'custom' || Boolean(from && to),
  });
}

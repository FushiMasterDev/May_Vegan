import { useState } from 'react';
import { Download } from 'lucide-react';
import { useRevenueReport } from '@/hooks/useRevenueReport';
import { DateRangeFilter } from '@/components/common/DateRangeFilter';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/contexts/ToastContext';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatCurrency } from '@/utils/format';
import { downloadRevenueCsv, type RevenueRange } from '@/services/reportApi';

export default function ReportsPage() {
  const toast = useToast();
  const [range, setRange] = useState<RevenueRange>('30d');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const { data: report, isLoading } = useRevenueReport(range, from, to);

  async function handleExport() {
    setIsExporting(true);
    try {
      await downloadRevenueCsv(range, from, to);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Xuất báo cáo thất bại'));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-[var(--text-primary)]">Báo cáo</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Báo cáo doanh thu chi tiết, có thể xuất CSV.</p>
        </div>
        <Button variant="outline" onClick={handleExport} isLoading={isExporting}>
          <Download size={16} /> Xuất CSV
        </Button>
      </div>

      <DateRangeFilter range={range} from={from} to={to} onRangeChange={setRange} onFromChange={setFrom} onToChange={setTo} />

      {isLoading || !report ? (
        <PageLoading />
      ) : (
        <>
          <Card className="grid grid-cols-3 divide-x divide-[var(--border-subtle)] p-5 text-center">
            <div>
              <p className="font-display text-2xl text-brand-800">{formatCurrency(report.totalRevenue)}</p>
              <p className="text-xs text-[var(--text-muted)]">Tổng doanh thu</p>
            </div>
            <div>
              <p className="font-display text-2xl text-brand-800">{report.totalOrders}</p>
              <p className="text-xs text-[var(--text-muted)]">Đơn hoàn thành</p>
            </div>
            <div>
              <p className="font-display text-2xl text-brand-800">{formatCurrency(report.avgOrderValue)}</p>
              <p className="text-xs text-[var(--text-muted)]">Giá trị TB / đơn</p>
            </div>
          </Card>

          <div>
            <h2 className="mb-3 font-display text-lg text-[var(--text-primary)]">Doanh thu theo ngày</h2>
            {report.revenueByDay.length === 0 ? (
              <EmptyState title="Không có dữ liệu" description="Không có đơn hàng hoàn thành trong khoảng thời gian này." />
            ) : (
              <Table>
                <Thead><tr><Th>Ngày</Th><Th>Doanh thu</Th></tr></Thead>
                <Tbody>
                  {report.revenueByDay.map((d) => (
                    <Tr key={d.date}><Td>{d.date}</Td><Td>{formatCurrency(d.revenue)}</Td></Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </div>

          <div>
            <h2 className="mb-3 font-display text-lg text-[var(--text-primary)]">Top món bán chạy</h2>
            {report.topProducts.length === 0 ? (
              <EmptyState title="Không có dữ liệu" description="Chưa có món nào được bán trong khoảng thời gian này." />
            ) : (
              <Table>
                <Thead><tr><Th>Món ăn</Th><Th>Số lượng bán</Th><Th>Doanh thu</Th></tr></Thead>
                <Tbody>
                  {report.topProducts.map((p) => (
                    <Tr key={p.productId}><Td>{p.name}</Td><Td>{p.quantity}</Td><Td>{formatCurrency(p.revenue)}</Td></Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Wallet, ShoppingBag, TrendingUp } from 'lucide-react';
import { useRevenueReport } from '@/hooks/useRevenueReport';
import { DateRangeFilter } from '@/components/common/DateRangeFilter';
import { StatCard } from '@/components/common/StatCard';
import { RevenueAreaChart } from '@/components/common/charts/RevenueAreaChart';
import { SimpleBarChart } from '@/components/common/charts/SimpleBarChart';
import { RankedBarList } from '@/components/common/charts/RankedBarList';
import { Card } from '@/components/ui/Card';
import { PageLoading } from '@/components/ui/Loading';
import { formatCurrency } from '@/utils/format';
import type { RevenueRange } from '@/services/reportApi';

const ORDER_TYPE_LABEL: Record<string, string> = {
  DINE_IN: 'Tại quán',
  DELIVERY: 'Giao hàng',
  PICKUP: 'Nhận tại quán',
};

export default function RevenuePage() {
  const [range, setRange] = useState<RevenueRange>('30d');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data: report, isLoading } = useRevenueReport(range, from, to);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-brand-900">Doanh thu</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Theo dõi doanh thu theo thời gian.</p>
      </div>

      <DateRangeFilter range={range} from={from} to={to} onRangeChange={setRange} onFromChange={setFrom} onToChange={setTo} />

      {isLoading || !report ? (
        <PageLoading />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={<Wallet size={20} />} label="Tổng doanh thu" value={formatCurrency(report.totalRevenue)} />
            <StatCard icon={<ShoppingBag size={20} />} label="Số đơn hoàn thành" value={report.totalOrders} accent="accent" />
            <StatCard icon={<TrendingUp size={20} />} label="Giá trị đơn trung bình" value={formatCurrency(report.avgOrderValue)} accent="wood" />
          </div>

          <Card className="p-5">
            <h2 className="font-display text-lg text-brand-900">Doanh thu theo ngày</h2>
            <RevenueAreaChart data={report.revenueByDay} />
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="font-display text-lg text-brand-900">Doanh thu theo loại đơn</h2>
              <SimpleBarChart
                data={report.revenueByOrderType.map((r) => ({ label: ORDER_TYPE_LABEL[r.orderType] ?? r.orderType, value: r.revenue }))}
                valueFormatter={(v) => `${Math.round(v / 1000)}k`}
              />
            </Card>
            <Card className="p-5">
              <h2 className="font-display text-lg text-brand-900">Top món bán chạy</h2>
              <div className="mt-4">
                <RankedBarList
                  items={report.topProducts.map((p) => ({ label: p.name, value: p.quantity, valueLabel: `${p.quantity} phần` }))}
                />
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

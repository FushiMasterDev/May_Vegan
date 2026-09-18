import { useQuery } from '@tanstack/react-query';
import {
  Wallet,
  CalendarDays,
  ShoppingBag,
  Users,
  Grid3x3,
  UtensilsCrossed,
  Clock,
} from 'lucide-react';
import { getStatistics, getOrdersByStatus, getRevenueTrend } from '@/services/dashboardApi';
import { StatCard } from '@/components/common/StatCard';
import { RevenueAreaChart } from '@/components/common/charts/RevenueAreaChart';
import { SimpleBarChart } from '@/components/common/charts/SimpleBarChart';
import { RankedBarList } from '@/components/common/charts/RankedBarList';
import { ProductImage } from '@/components/common/ProductImage';
import { PageLoading } from '@/components/ui/Loading';
import { Card } from '@/components/ui/Card';
import { formatCurrency, toNumber } from '@/utils/format';
import { ORDER_STATUS_META } from '@/utils/statusMeta';
import { getPrimaryImage } from '@/utils/product';
import type { OrderStatus } from '@/types';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getStatistics });
  const { data: revenueTrend, isLoading: trendLoading } = useQuery({
    queryKey: ['dashboard-revenue-trend'],
    queryFn: () => getRevenueTrend(14),
  });
  const { data: ordersByStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['dashboard-orders-by-status'],
    queryFn: getOrdersByStatus,
  });

  if (statsLoading || !stats) return <PageLoading />;

  const statusData = (ordersByStatus ?? []).map((s) => ({
    label: ORDER_STATUS_META[s.status as OrderStatus]?.label ?? s.status,
    value: s.count,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-brand-900">Tổng quan</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Số liệu hoạt động của Mây Vegan hôm nay.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<Wallet size={20} />} label="Doanh thu hôm nay" value={formatCurrency(stats.revenueToday)} />
        <StatCard icon={<Wallet size={20} />} label="Doanh thu tháng" value={formatCurrency(stats.revenueMonth)} accent="accent" />
        <StatCard icon={<ShoppingBag size={20} />} label="Đơn hàng hôm nay" value={stats.ordersToday} />
        <StatCard icon={<Clock size={20} />} label="Đơn đang chờ" value={stats.pendingOrders} accent="wood" />
        <StatCard icon={<Users size={20} />} label="Khách hàng" value={stats.customerCount} />
        <StatCard icon={<Grid3x3 size={20} />} label="Bàn đang sử dụng" value={stats.occupiedTables} />
        <StatCard icon={<UtensilsCrossed size={20} />} label="Món ăn" value={stats.productCount} />
        <StatCard icon={<CalendarDays size={20} />} label="14 ngày qua" value={formatCurrency(revenueTrend?.reduce((s, d) => s + d.revenue, 0) ?? 0)} accent="accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="font-display text-lg text-brand-900">Doanh thu 14 ngày qua</h2>
          {trendLoading ? <PageLoading /> : <RevenueAreaChart data={revenueTrend ?? []} />}
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-lg text-brand-900">Món bán chạy</h2>
          <div className="mt-4">
            <RankedBarList
              items={stats.topProducts.map((p) => ({
                label: p.name,
                value: p.soldCount,
                valueLabel: `${p.soldCount} đã bán`,
              }))}
            />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="font-display text-lg text-brand-900">Đơn hàng theo trạng thái</h2>
          {statusLoading ? <PageLoading /> : <SimpleBarChart data={statusData} />}
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-lg text-brand-900">Top món ăn</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {stats.topProducts.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                  <ProductImage src={getPrimaryImage(p)} alt={p.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-900 line-clamp-1">{p.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{formatCurrency(p.salePrice ?? p.price)}</p>
                </div>
                <span className="text-xs font-medium text-[var(--text-muted)]">{toNumber(p.soldCount)} bán</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

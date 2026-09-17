import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

export type RevenueRange = 'today' | '7d' | '30d' | 'month' | 'year' | 'custom';

function resolveRange(range: RevenueRange, from?: string, to?: string): { start: Date; end: Date } {
  const now = new Date();
  const endOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)
  );

  if (range === 'today') {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    return { start, end: endOfToday };
  }
  if (range === '7d' || range === '30d') {
    const days = range === '7d' ? 6 : 29;
    const start = new Date(endOfToday);
    start.setUTCDate(start.getUTCDate() - days);
    start.setUTCHours(0, 0, 0, 0);
    return { start, end: endOfToday };
  }
  if (range === 'month') {
    return { start: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)), end: endOfToday };
  }
  if (range === 'year') {
    return { start: new Date(Date.UTC(now.getUTCFullYear(), 0, 1)), end: endOfToday };
  }
  // custom
  if (!from || !to) throw AppError.badRequest('Vui lòng chọn khoảng thời gian (from, to)');
  return { start: new Date(`${from}T00:00:00.000Z`), end: new Date(`${to}T23:59:59.999Z`) };
}

export async function getRevenueReport(range: RevenueRange, from?: string, to?: string) {
  const { start, end } = resolveRange(range, from, to);

  const orders = await prisma.order.findMany({
    where: { status: 'COMPLETED', createdAt: { gte: start, lte: end } },
    include: { items: true },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

  const byDay = new Map<string, number>();
  const byOrderType = new Map<string, number>();
  for (const o of orders) {
    const day = o.createdAt.toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + Number(o.totalAmount));
    byOrderType.set(o.orderType, (byOrderType.get(o.orderType) ?? 0) + Number(o.totalAmount));
  }
  const revenueByDay = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue }));
  const revenueByOrderType = Array.from(byOrderType.entries()).map(([orderType, revenue]) => ({
    orderType,
    revenue,
  }));

  const productAgg = new Map<number, { productId: number; name: string; quantity: number; revenue: number }>();
  for (const o of orders) {
    for (const item of o.items) {
      const cur = productAgg.get(item.productId) ?? {
        productId: item.productId,
        name: item.productNameSnapshot,
        quantity: 0,
        revenue: 0,
      };
      cur.quantity += item.quantity;
      cur.revenue += Number(item.subtotal);
      productAgg.set(item.productId, cur);
    }
  }
  const topProducts = Array.from(productAgg.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  return {
    range: { start: start.toISOString(), end: end.toISOString() },
    totalRevenue,
    totalOrders,
    avgOrderValue,
    revenueByDay,
    revenueByOrderType,
    topProducts,
  };
}

import { prisma } from '../config/database';

export async function getStatistics() {
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [
    todayRevenueAgg,
    monthRevenueAgg,
    ordersToday,
    customerCount,
    occupiedTables,
    productCount,
    pendingOrders,
    topProducts,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: 'COMPLETED', createdAt: { gte: todayStart } },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: { status: 'COMPLETED', createdAt: { gte: monthStart } },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.customer.count(),
    prisma.restaurantTable.count({ where: { status: 'OCCUPIED' } }),
    prisma.product.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.product.findMany({
      orderBy: { soldCount: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        soldCount: true,
        price: true,
        salePrice: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
    }),
  ]);

  return {
    revenueToday: Number(todayRevenueAgg._sum.totalAmount ?? 0),
    revenueMonth: Number(monthRevenueAgg._sum.totalAmount ?? 0),
    ordersToday,
    customerCount,
    occupiedTables,
    productCount,
    pendingOrders,
    topProducts,
  };
}

export async function getOrdersByStatus() {
  const grouped = await prisma.order.groupBy({ by: ['status'], _count: true });
  return grouped.map((g) => ({ status: g.status, count: g._count }));
}

export async function getRevenueTrend(days = 14) {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { status: 'COMPLETED', createdAt: { gte: start } },
    select: { totalAmount: true, createdAt: true },
  });

  const byDay = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + Number(o.totalAmount));
  }

  return Array.from(byDay.entries()).map(([date, revenue]) => ({ date, revenue }));
}

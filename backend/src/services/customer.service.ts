import { UserStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { parsePagination, buildMeta } from '../utils/pagination';

export async function listCustomers(query: { search?: string; page?: string; limit?: string }) {
  const { page, limit, skip, take } = parsePagination(query);

  const where = query.search
    ? {
        user: {
          OR: [
            { fullName: { contains: query.search } },
            { email: { contains: query.search } },
            { phone: { contains: query.search } },
          ],
        },
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, email: true, phone: true, status: true, avatarUrl: true } } },
    }),
    prisma.customer.count({ where }),
  ]);

  return { items, meta: buildMeta(page, limit, total) };
}

export async function getCustomerDetail(id: number) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      user: { select: { fullName: true, email: true, phone: true, status: true, avatarUrl: true, createdAt: true } },
      orders: { orderBy: { createdAt: 'desc' }, take: 20, include: { items: true } },
      reservations: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });
  if (!customer) throw AppError.notFound('Không tìm thấy khách hàng');
  return customer;
}

export async function setCustomerStatus(id: number, status: UserStatus) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) throw AppError.notFound('Không tìm thấy khách hàng');
  await prisma.user.update({ where: { id: customer.userId }, data: { status } });
  return getCustomerDetail(id);
}

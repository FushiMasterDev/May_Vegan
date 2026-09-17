import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { parsePagination, buildMeta } from '../utils/pagination';
import type { CreateReviewInput } from '../validators/review.validator';

async function recomputeProductRating(productId: number) {
  const agg = await prisma.review.aggregate({
    where: { productId, status: 'VISIBLE' },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      ratingAvg: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
      ratingCount: agg._count,
    },
  });
}

export async function listByProduct(productId: number, query: { page?: string; limit?: string }) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = { productId, status: 'VISIBLE' as const };
  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { customer: { include: { user: { select: { fullName: true, avatarUrl: true } } } } },
    }),
    prisma.review.count({ where }),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
}

export async function listAll(query: { productId?: number; status?: 'VISIBLE' | 'HIDDEN'; page?: string; limit?: string }) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = {
    ...(query.productId ? { productId: query.productId } : {}),
    ...(query.status ? { status: query.status } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, slug: true } },
        customer: { include: { user: { select: { fullName: true, email: true } } } },
      },
    }),
    prisma.review.count({ where }),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
}

export async function createReview(userId: number, input: CreateReviewInput) {
  const customer = await prisma.customer.findUnique({ where: { userId } });
  if (!customer) throw AppError.forbidden('Chỉ khách hàng có tài khoản mới có thể đánh giá');

  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: { items: true },
  });
  if (!order || order.customerId !== customer.id) {
    throw AppError.notFound('Không tìm thấy đơn hàng');
  }
  if (order.status !== 'COMPLETED') {
    throw AppError.badRequest('Chỉ có thể đánh giá món ăn từ đơn hàng đã hoàn thành');
  }
  const boughtProduct = order.items.some((item) => item.productId === input.productId);
  if (!boughtProduct) {
    throw AppError.badRequest('Món ăn này không có trong đơn hàng đã chọn');
  }

  const existing = await prisma.review.findFirst({
    where: { customerId: customer.id, productId: input.productId, orderId: input.orderId },
  });
  if (existing) throw AppError.conflict('Bạn đã đánh giá món này cho đơn hàng này rồi');

  const review = await prisma.review.create({
    data: {
      productId: input.productId,
      customerId: customer.id,
      orderId: input.orderId,
      rating: input.rating,
      comment: input.comment,
      imageUrl: input.imageUrl,
    },
  });

  await recomputeProductRating(input.productId);
  return review;
}

export async function setVisibility(id: number, status: 'VISIBLE' | 'HIDDEN') {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw AppError.notFound('Không tìm thấy đánh giá');
  const updated = await prisma.review.update({ where: { id }, data: { status } });
  await recomputeProductRating(review.productId);
  return updated;
}

export async function removeReview(id: number) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw AppError.notFound('Không tìm thấy đánh giá');
  await prisma.review.delete({ where: { id } });
  await recomputeProductRating(review.productId);
}

import { CouponStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { parsePagination, buildMeta } from '../utils/pagination';
import { parseDateOnly } from '../utils/datetime';
import type { CreateCouponInput, UpdateCouponInput } from '../validators/coupon.validator';

export async function listCoupons(query: { status?: CouponStatus; page?: string; limit?: string }) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = query.status ? { status: query.status } : {};
  const [items, total] = await Promise.all([
    prisma.coupon.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.coupon.count({ where }),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
}

export async function getCoupon(id: number) {
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) throw AppError.notFound('Không tìm thấy mã giảm giá');
  return coupon;
}

export async function createCoupon(input: CreateCouponInput) {
  const existing = await prisma.coupon.findUnique({ where: { code: input.code } });
  if (existing) throw AppError.conflict('Mã giảm giá đã tồn tại');

  return prisma.coupon.create({
    data: {
      code: input.code.toUpperCase(),
      name: input.name,
      discountType: input.discountType,
      discountValue: input.discountValue,
      minOrderAmount: input.minOrderAmount ?? 0,
      maxDiscountAmount: input.maxDiscountAmount,
      startDate: parseDateOnly(input.startDate),
      endDate: parseDateOnly(input.endDate),
      usageLimit: input.usageLimit,
      status: input.status ?? 'ACTIVE',
    },
  });
}

export async function updateCoupon(id: number, input: UpdateCouponInput) {
  await getCoupon(id);
  return prisma.coupon.update({
    where: { id },
    data: {
      name: input.name,
      discountType: input.discountType,
      discountValue: input.discountValue,
      minOrderAmount: input.minOrderAmount,
      maxDiscountAmount: input.maxDiscountAmount,
      startDate: input.startDate ? parseDateOnly(input.startDate) : undefined,
      endDate: input.endDate ? parseDateOnly(input.endDate) : undefined,
      usageLimit: input.usageLimit,
      status: input.status,
    },
  });
}

export async function deleteCoupon(id: number) {
  await getCoupon(id);
  const usageCount = await prisma.couponUsage.count({ where: { couponId: id } });
  if (usageCount > 0) {
    throw AppError.conflict('Không thể xoá mã đã được sử dụng. Hãy chuyển trạng thái sang INACTIVE thay vì xoá.');
  }
  await prisma.coupon.delete({ where: { id } });
}

export async function validateCoupon(code: string, orderAmount: number) {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon) throw AppError.notFound('Mã giảm giá không tồn tại');

  const today = parseDateOnly(new Date().toISOString().slice(0, 10));

  if (coupon.status !== 'ACTIVE') throw AppError.badRequest('Mã giảm giá không còn hiệu lực');
  if (today < coupon.startDate) throw AppError.badRequest('Mã giảm giá chưa bắt đầu áp dụng');
  if (today > coupon.endDate) throw AppError.badRequest('Mã giảm giá đã hết hạn');
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw AppError.badRequest('Mã giảm giá đã hết lượt sử dụng');
  }
  if (orderAmount < Number(coupon.minOrderAmount)) {
    throw AppError.badRequest(
      `Đơn hàng tối thiểu ${Number(coupon.minOrderAmount).toLocaleString('vi-VN')}đ để áp dụng mã này`
    );
  }

  let discount =
    coupon.discountType === 'PERCENT'
      ? (orderAmount * Number(coupon.discountValue)) / 100
      : Number(coupon.discountValue);
  if (coupon.maxDiscountAmount !== null) {
    discount = Math.min(discount, Number(coupon.maxDiscountAmount));
  }
  discount = Math.round(discount);

  return { coupon, discountAmount: discount };
}

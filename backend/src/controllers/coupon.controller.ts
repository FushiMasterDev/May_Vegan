import { Request, Response } from 'express';
import { CouponStatus } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { parseIdParam } from '../utils/parseId';
import * as couponService from '../services/coupon.service';
import { createCouponSchema, updateCouponSchema, validateCouponSchema } from '../validators/coupon.validator';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { status, page, limit } = req.query as Record<string, string>;
  const { items, meta } = await couponService.listCoupons({ status: status as CouponStatus, page, limit });
  res.json({ success: true, data: items, meta });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const coupon = await couponService.getCoupon(id);
  res.json({ success: true, data: coupon });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = createCouponSchema.parse(req.body);
  const coupon = await couponService.createCoupon(input);
  res.status(201).json({ success: true, data: coupon });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const input = updateCouponSchema.parse(req.body);
  const coupon = await couponService.updateCoupon(id, input);
  res.json({ success: true, data: coupon });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  await couponService.deleteCoupon(id);
  res.json({ success: true, message: 'Đã xoá mã giảm giá' });
});

export const validate = asyncHandler(async (req: Request, res: Response) => {
  const { code, orderAmount } = validateCouponSchema.parse(req.body);
  const result = await couponService.validateCoupon(code, orderAmount);
  res.json({ success: true, data: result });
});

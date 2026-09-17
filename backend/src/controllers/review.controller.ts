import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { parseIdParam } from '../utils/parseId';
import { AppError } from '../utils/AppError';
import * as reviewService from '../services/review.service';
import { createReviewSchema, listReviewQuerySchema } from '../validators/review.validator';

export const listByProduct = asyncHandler(async (req: Request, res: Response) => {
  const productId = parseIdParam(req.params.id);
  const { page, limit } = req.query as { page?: string; limit?: string };
  const { items, meta } = await reviewService.listByProduct(productId, { page, limit });
  res.json({ success: true, data: items, meta });
});

export const listAll = asyncHandler(async (req: Request, res: Response) => {
  const query = listReviewQuerySchema.parse(req.query);
  const { items, meta } = await reviewService.listAll(query);
  res.json({ success: true, data: items, meta });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized();
  const input = createReviewSchema.parse(req.body);
  const review = await reviewService.createReview(req.user.id, input);
  res.status(201).json({ success: true, data: review });
});

export const hide = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const review = await reviewService.setVisibility(id, 'HIDDEN');
  res.json({ success: true, data: review });
});

export const unhide = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const review = await reviewService.setVisibility(id, 'VISIBLE');
  res.json({ success: true, data: review });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  await reviewService.removeReview(id);
  res.json({ success: true, message: 'Đã xoá đánh giá' });
});

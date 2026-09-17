import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.coerce.number().int().positive('Vui lòng chọn món ăn'),
  orderId: z.coerce.number().int().positive('Vui lòng chọn đơn hàng'),
  rating: z.coerce.number().int().min(1, 'Đánh giá tối thiểu 1 sao').max(5, 'Đánh giá tối đa 5 sao'),
  comment: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
});

export const listReviewQuerySchema = z.object({
  productId: z.coerce.number().int().positive().optional(),
  status: z.enum(['VISIBLE', 'HIDDEN']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

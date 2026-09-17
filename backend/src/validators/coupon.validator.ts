import { z } from 'zod';

export const createCouponSchema = z
  .object({
    code: z.string().min(3, 'Mã giảm giá tối thiểu 3 ký tự').max(40),
    name: z.string().min(1, 'Vui lòng nhập tên chương trình').max(150),
    discountType: z.enum(['PERCENT', 'AMOUNT']),
    discountValue: z.coerce.number().positive('Giá trị giảm phải lớn hơn 0'),
    minOrderAmount: z.coerce.number().nonnegative().optional(),
    maxDiscountAmount: z.coerce.number().positive().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ (YYYY-MM-DD)'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ (YYYY-MM-DD)'),
    usageLimit: z.coerce.number().int().positive().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['endDate'],
  })
  .refine((data) => data.discountType !== 'PERCENT' || data.discountValue <= 100, {
    message: 'Giảm theo % không được vượt quá 100',
    path: ['discountValue'],
  });

export const updateCouponSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  discountType: z.enum(['PERCENT', 'AMOUNT']).optional(),
  discountValue: z.coerce.number().positive().optional(),
  minOrderAmount: z.coerce.number().nonnegative().optional(),
  maxDiscountAmount: z.coerce.number().positive().nullable().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  usageLimit: z.coerce.number().int().positive().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED']).optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập mã giảm giá'),
  orderAmount: z.coerce.number().nonnegative(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;

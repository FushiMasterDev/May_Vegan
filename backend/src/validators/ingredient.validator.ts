import { z } from 'zod';

export const createIngredientSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên nguyên liệu').max(150),
  unit: z.string().min(1, 'Vui lòng nhập đơn vị tính').max(20),
  minStockLevel: z.coerce.number().nonnegative().optional(),
  costPrice: z.coerce.number().nonnegative().optional(),
  supplierId: z.coerce.number().int().positive().optional(),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ (YYYY-MM-DD)').optional(),
  initialQuantity: z.coerce.number().nonnegative().optional(),
});

export const updateIngredientSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  unit: z.string().min(1).max(20).optional(),
  minStockLevel: z.coerce.number().nonnegative().optional(),
  costPrice: z.coerce.number().nonnegative().optional(),
  supplierId: z.coerce.number().int().positive().nullable().optional(),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const listIngredientQuerySchema = z.object({
  search: z.string().optional(),
  lowStockOnly: z.coerce.boolean().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreateIngredientInput = z.infer<typeof createIngredientSchema>;
export type UpdateIngredientInput = z.infer<typeof updateIngredientSchema>;

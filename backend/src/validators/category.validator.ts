import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên danh mục').max(100),
  slug: z.string().max(120).optional(),
  description: z.string().max(500).optional(),
  displayOrder: z.coerce.number().int().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

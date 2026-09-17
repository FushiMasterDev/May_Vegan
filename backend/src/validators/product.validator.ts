import { z } from 'zod';

export const listProductQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  status: z.enum(['AVAILABLE', 'OUT_OF_STOCK', 'HIDDEN']).optional(),
  isFeatured: z.coerce.boolean().optional(),
  isBestSeller: z.coerce.boolean().optional(),
  onSale: z.coerce.boolean().optional(),
  isNew: z.coerce.boolean().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'popular', 'newest', 'rating']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const createProductSchema = z
  .object({
    categoryId: z.coerce.number().int().positive('Vui lòng chọn danh mục'),
    name: z.string().min(1, 'Vui lòng nhập tên món').max(150),
    slug: z.string().max(180).optional(),
    description: z.string().max(5000).optional(),
    ingredientsText: z.string().max(500).optional(),
    calories: z.coerce.number().int().nonnegative().optional(),
    allergyInfo: z.string().max(255).optional(),
    price: z.coerce.number().positive('Giá phải lớn hơn 0'),
    salePrice: z.coerce.number().positive().optional(),
    status: z.enum(['AVAILABLE', 'OUT_OF_STOCK', 'HIDDEN']).optional(),
    isFeatured: z.coerce.boolean().optional(),
    isBestSeller: z.coerce.boolean().optional(),
  })
  .refine((data) => !data.salePrice || data.salePrice < data.price, {
    message: 'Giá khuyến mãi phải nhỏ hơn giá gốc',
    path: ['salePrice'],
  });

export const updateProductSchema = z.object({
  categoryId: z.coerce.number().int().positive().optional(),
  name: z.string().min(1).max(150).optional(),
  slug: z.string().max(180).optional(),
  description: z.string().max(5000).optional(),
  ingredientsText: z.string().max(500).optional(),
  calories: z.coerce.number().int().nonnegative().optional(),
  allergyInfo: z.string().max(255).optional(),
  price: z.coerce.number().positive().optional(),
  salePrice: z.coerce.number().positive().nullable().optional(),
  status: z.enum(['AVAILABLE', 'OUT_OF_STOCK', 'HIDDEN']).optional(),
  isFeatured: z.coerce.boolean().optional(),
  isBestSeller: z.coerce.boolean().optional(),
});

export type ListProductQuery = z.infer<typeof listProductQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

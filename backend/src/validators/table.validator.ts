import { z } from 'zod';

const statusEnum = z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING', 'MAINTENANCE']);

export const createTableSchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập mã bàn').max(20),
  seats: z.coerce.number().int().positive('Số ghế phải lớn hơn 0'),
  area: z.string().min(1, 'Vui lòng nhập khu vực').max(100),
  status: statusEnum.optional(),
});

export const updateTableSchema = createTableSchema.partial();

export const updateTableStatusSchema = z.object({ status: statusEnum });

export const listTableQuerySchema = z.object({
  area: z.string().optional(),
  status: statusEnum.optional(),
});

export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;

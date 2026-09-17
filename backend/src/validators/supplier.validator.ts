import { z } from 'zod';

export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên nhà cung cấp').max(150),
  contactPerson: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Email không hợp lệ').optional(),
  address: z.string().max(500).optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;

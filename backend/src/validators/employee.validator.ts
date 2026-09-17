import { z } from 'zod';

const roleNameEnum = z.enum(['ADMIN', 'MANAGER', 'STAFF', 'KITCHEN']);
const phoneSchema = z.string().regex(/^0\d{9,10}$/, 'Số điện thoại không hợp lệ');

export const createEmployeeSchema = z.object({
  fullName: z.string().min(2, 'Vui lòng nhập họ tên').max(100),
  email: z.string().email('Email không hợp lệ'),
  phone: phoneSchema,
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
  position: z.string().min(1, 'Vui lòng nhập chức vụ').max(100),
  roleName: roleNameEnum,
  hiredAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const updateEmployeeSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: phoneSchema.optional(),
  position: z.string().min(1).max(100).optional(),
  roleName: roleNameEnum.optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  hiredAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const listEmployeeQuerySchema = z.object({
  search: z.string().optional(),
  roleName: roleNameEnum.optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

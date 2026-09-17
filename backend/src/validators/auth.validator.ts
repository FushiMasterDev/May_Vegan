import { z } from 'zod';

const phoneSchema = z
  .string()
  .regex(/^0\d{9,10}$/, 'Số điện thoại không hợp lệ');

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Vui lòng nhập họ tên').max(100),
  email: z.string().email('Email không hợp lệ'),
  phone: phoneSchema,
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
  address: z.string().max(500).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Thiếu refresh token'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Thiếu token đặt lại mật khẩu'),
  newPassword: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: phoneSchema.optional(),
  address: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

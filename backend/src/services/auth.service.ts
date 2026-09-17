import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signPasswordResetToken,
  verifyPasswordResetToken,
} from '../utils/jwt';
import type {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from '../validators/auth.validator';

const SALT_ROUNDS = 10;

function toSafeUser(user: {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  createdAt: Date;
  role: { name: string };
  customer?: { id: number; address: string | null; loyaltyPoints: number; totalOrders: number; totalSpent: unknown } | null;
}) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    status: user.status,
    role: user.role.name,
    createdAt: user.createdAt,
    customer: user.customer
      ? {
          id: user.customer.id,
          address: user.customer.address,
          loyaltyPoints: user.customer.loyaltyPoints,
          totalOrders: user.customer.totalOrders,
          totalSpent: user.customer.totalSpent,
        }
      : null,
  };
}

function issueTokens(userId: number, roleName: string) {
  const payload = { sub: userId, role: roleName };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { phone: input.phone }] },
  });
  if (existing) {
    throw AppError.conflict('Email hoặc số điện thoại đã được sử dụng');
  }

  const customerRole = await prisma.role.findUnique({ where: { name: 'CUSTOMER' } });
  if (!customerRole) throw AppError.badRequest('Hệ thống chưa cấu hình vai trò CUSTOMER');

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      passwordHash,
      roleId: customerRole.id,
      customer: { create: { address: input.address } },
    },
    include: { role: true, customer: true },
  });

  const tokens = issueTokens(user.id, user.role.name);
  return { user: toSafeUser(user), ...tokens };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { role: true, customer: true },
  });
  if (!user) throw AppError.unauthorized('Email hoặc mật khẩu không đúng');

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) throw AppError.unauthorized('Email hoặc mật khẩu không đúng');

  if (user.status !== 'ACTIVE') {
    throw AppError.forbidden('Tài khoản đã bị khoá. Vui lòng liên hệ quản trị viên.');
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const tokens = issueTokens(user.id, user.role.name);
  return { user: toSafeUser(user), ...tokens };
}

export async function refresh(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw AppError.unauthorized('Refresh token không hợp lệ hoặc đã hết hạn');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { role: true } });
  if (!user || user.status !== 'ACTIVE') {
    throw AppError.unauthorized('Tài khoản không hợp lệ');
  }

  return issueTokens(user.id, user.role.name);
}

export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true, customer: true, employee: true },
  });
  if (!user) throw AppError.notFound('Không tìm thấy người dùng');
  return toSafeUser(user);
}

export async function updateProfile(userId: number, input: UpdateProfileInput) {
  if (input.phone) {
    const existing = await prisma.user.findFirst({
      where: { phone: input.phone, NOT: { id: userId } },
    });
    if (existing) throw AppError.conflict('Số điện thoại đã được sử dụng bởi tài khoản khác');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: input.fullName,
      phone: input.phone,
      avatarUrl: input.avatarUrl,
      customer: input.address !== undefined ? { update: { address: input.address } } : undefined,
    },
    include: { role: true, customer: true },
  });

  return toSafeUser(user);
}

export async function changePassword(userId: number, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound('Không tìm thấy người dùng');

  const isValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!isValid) throw AppError.badRequest('Mật khẩu hiện tại không đúng');

  const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

// Không có dịch vụ gửi email được cấu hình trong dự án này — token đặt lại
// mật khẩu được log ra console (môi trường dev) thay vì gửi email thật.
// Không tiết lộ qua response liệu email có tồn tại hay không, để tránh dò
// email hợp lệ (user enumeration).
export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = signPasswordResetToken(user.id, user.passwordHash);
    console.log(`[password-reset] Link đặt lại mật khẩu cho ${email}: /reset-password?token=${token}`);
  }
}

export async function resetPassword(token: string, newPassword: string) {
  let payload;
  try {
    payload = verifyPasswordResetToken(token);
  } catch {
    throw AppError.badRequest('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.passwordHash !== payload.pwd) {
    throw AppError.badRequest('Token đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng');
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
}

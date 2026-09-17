import { RequestHandler } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/database';

export interface AuthUser {
  id: number;
  roleName: string;
  email: string;
  fullName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

async function loadUserFromHeader(authHeader: string | undefined): Promise<AuthUser | null> {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);
  const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { role: true } });
  if (!user || user.status !== 'ACTIVE') return null;
  return { id: user.id, roleName: user.role.name, email: user.email, fullName: user.fullName };
}

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const user = await loadUserFromHeader(req.headers.authorization);
    if (!user) throw AppError.unauthorized('Token không hợp lệ hoặc đã hết hạn');
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(AppError.unauthorized('Token không hợp lệ hoặc đã hết hạn'));
  }
};

// Dùng cho các route công khai nhưng muốn gắn thông tin khách hàng nếu đã đăng nhập
// (vd: đặt món/đặt bàn cho khách vãng lai lẫn khách có tài khoản).
export const optionalAuthenticate: RequestHandler = async (req, _res, next) => {
  try {
    const user = await loadUserFromHeader(req.headers.authorization);
    if (user) req.user = user;
  } catch {
    // token không hợp lệ ở route optional -> bỏ qua, coi như khách chưa đăng nhập
  }
  next();
};

export function authorize(...roles: string[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(AppError.unauthorized());
    if (!roles.includes(req.user.roleName)) {
      return next(AppError.forbidden('Bạn không có quyền thực hiện thao tác này'));
    }
    next();
  };
}

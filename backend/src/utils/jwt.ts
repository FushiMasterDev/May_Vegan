import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface AccessTokenPayload {
  sub: number;
  role: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as SignOptions);
}

export function signRefreshToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as unknown as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as unknown as AccessTokenPayload;
}

interface PasswordResetPayload {
  sub: number;
  pwd: string;
}

// Token bị ràng buộc theo password_hash hiện tại: sau khi đổi mật khẩu,
// password_hash thay đổi nên token cũ tự động không còn hợp lệ — không cần
// bảng lưu trạng thái reset token riêng.
export function signPasswordResetToken(userId: number, currentPasswordHash: string): string {
  return jwt.sign({ sub: userId, pwd: currentPasswordHash }, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
}

export function verifyPasswordResetToken(token: string): PasswordResetPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as unknown as PasswordResetPayload;
}

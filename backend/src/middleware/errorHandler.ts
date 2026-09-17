import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

// Prisma-specific error mapping (unique constraint, not-found, etc.) is added
// in Phase 2 once the Prisma schema/models exist and the client is generated.

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      details: err.flatten().fieldErrors,
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
    ...(env.NODE_ENV === 'development' && err instanceof Error
      ? { stack: err.stack, error: err.message }
      : {}),
  });
}

import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

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

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Dữ liệu đã tồn tại (trùng giá trị duy nhất)',
        details: err.meta,
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dữ liệu',
      });
    }
    if (err.code === 'P2003') {
      return res.status(409).json({
        success: false,
        message: 'Không thể thực hiện vì dữ liệu đang được tham chiếu ở nơi khác',
      });
    }
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

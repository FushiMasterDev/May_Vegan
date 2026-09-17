import { AppError } from './AppError';

export function parseIdParam(value: string, name = 'id'): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw AppError.badRequest(`${name} không hợp lệ`);
  }
  return id;
}

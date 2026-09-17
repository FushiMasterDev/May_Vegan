import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { RequestHandler } from 'express';
import { AppError } from '../utils/AppError';

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

function storageFor(subfolder: string) {
  const dir = path.join(UPLOAD_ROOT, subfolder);
  fs.mkdirSync(dir, { recursive: true });

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, name);
    },
  });
}

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function imageFileFilter(_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, WEBP, GIF)'));
  }
  cb(null, true);
}

export function createImageUploader(subfolder: string) {
  return multer({
    storage: storageFor(subfolder),
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  });
}

export function publicUrlForUpload(subfolder: string, filename: string): string {
  return `/uploads/${subfolder}/${filename}`;
}

// Bọc multer.single(...) để lỗi upload (file quá lớn, sai định dạng...) trả
// về 400 gọn gàng thay vì rơi vào error handler 500 mặc định.
export function uploadSingle(subfolder: string, fieldName: string): RequestHandler {
  const uploader = createImageUploader(subfolder).single(fieldName);
  return (req, res, next) => {
    uploader(req, res, (err: unknown) => {
      if (err) return next(err instanceof Error ? AppError.badRequest(err.message) : AppError.badRequest('Tải file thất bại'));
      next();
    });
  };
}

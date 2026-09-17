import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { parseIdParam } from '../utils/parseId';
import { AppError } from '../utils/AppError';
import { publicUrlForUpload } from '../middleware/upload';
import * as productService from '../services/product.service';
import { listProductQuerySchema, createProductSchema, updateProductSchema } from '../validators/product.validator';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = listProductQuerySchema.parse(req.query);
  const { items, meta } = await productService.listProducts(query);
  res.json({ success: true, data: items, meta });
});

export const getByIdOrSlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductBySlugOrId(req.params.idOrSlug);
  res.json({ success: true, data: product });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = createProductSchema.parse(req.body);
  const product = await productService.createProduct(input);
  res.status(201).json({ success: true, data: product });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const input = updateProductSchema.parse(req.body);
  const product = await productService.updateProduct(id, input);
  res.json({ success: true, data: product });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  await productService.deleteProduct(id);
  res.json({ success: true, message: 'Đã xoá món ăn' });
});

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  const productId = parseIdParam(req.params.id);
  if (!req.file) throw AppError.badRequest('Vui lòng chọn file ảnh');
  const imageUrl = publicUrlForUpload('products', req.file.filename);
  const isPrimary = req.body.isPrimary === 'true' || req.body.isPrimary === true;
  const image = await productService.addProductImage(productId, imageUrl, isPrimary);
  res.status(201).json({ success: true, data: image });
});

export const removeImage = asyncHandler(async (req: Request, res: Response) => {
  const productId = parseIdParam(req.params.id);
  const imageId = parseIdParam(req.params.imageId, 'imageId');
  await productService.removeProductImage(productId, imageId);
  res.json({ success: true, message: 'Đã xoá hình ảnh' });
});

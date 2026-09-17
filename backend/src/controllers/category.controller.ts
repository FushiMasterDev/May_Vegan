import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { parseIdParam } from '../utils/parseId';
import * as categoryService from '../services/category.service';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const categories = await categoryService.listCategories(search);
  res.json({ success: true, data: categories });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const category = await categoryService.getCategory(id);
  res.json({ success: true, data: category });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = createCategorySchema.parse(req.body);
  const category = await categoryService.createCategory(input);
  res.status(201).json({ success: true, data: category });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const input = updateCategorySchema.parse(req.body);
  const category = await categoryService.updateCategory(id, input);
  res.json({ success: true, data: category });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  await categoryService.deleteCategory(id);
  res.json({ success: true, message: 'Đã xoá danh mục' });
});

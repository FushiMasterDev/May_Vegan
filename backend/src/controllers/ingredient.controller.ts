import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { parseIdParam } from '../utils/parseId';
import * as ingredientService from '../services/ingredient.service';
import { createIngredientSchema, updateIngredientSchema, listIngredientQuerySchema } from '../validators/ingredient.validator';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = listIngredientQuerySchema.parse(req.query);
  const { items, meta } = await ingredientService.listIngredients(query);
  res.json({ success: true, data: items, meta });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const ingredient = await ingredientService.getIngredient(id);
  res.json({ success: true, data: ingredient });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = createIngredientSchema.parse(req.body);
  const ingredient = await ingredientService.createIngredient(input);
  res.status(201).json({ success: true, data: ingredient });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const input = updateIngredientSchema.parse(req.body);
  const ingredient = await ingredientService.updateIngredient(id, input);
  res.json({ success: true, data: ingredient });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  await ingredientService.deleteIngredient(id);
  res.json({ success: true, message: 'Đã xoá nguyên liệu' });
});

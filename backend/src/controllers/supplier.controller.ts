import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { parseIdParam } from '../utils/parseId';
import * as supplierService from '../services/supplier.service';
import { createSupplierSchema, updateSupplierSchema } from '../validators/supplier.validator';

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const suppliers = await supplierService.listSuppliers();
  res.json({ success: true, data: suppliers });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const supplier = await supplierService.getSupplier(id);
  res.json({ success: true, data: supplier });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = createSupplierSchema.parse(req.body);
  const supplier = await supplierService.createSupplier(input);
  res.status(201).json({ success: true, data: supplier });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const input = updateSupplierSchema.parse(req.body);
  const supplier = await supplierService.updateSupplier(id, input);
  res.json({ success: true, data: supplier });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  await supplierService.deleteSupplier(id);
  res.json({ success: true, message: 'Đã xoá nhà cung cấp' });
});

import { Request, Response } from 'express';
import { InventoryTransactionType } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import * as inventoryService from '../services/inventory.service';
import {
  createInventoryTransactionSchema,
  listInventoryTransactionQuerySchema,
} from '../validators/inventory.validator';

export const listTransactions = asyncHandler(async (req: Request, res: Response) => {
  const query = listInventoryTransactionQuerySchema.parse(req.query);
  const { items, meta } = await inventoryService.listTransactions(
    query as { ingredientId?: number; type?: InventoryTransactionType; dateFrom?: string; dateTo?: string; page?: string; limit?: string }
  );
  res.json({ success: true, data: items, meta });
});

export const createTransaction = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized();
  const input = createInventoryTransactionSchema.parse(req.body);
  const transaction = await inventoryService.createTransaction(input, req.user.id);
  res.status(201).json({ success: true, data: transaction });
});

export const dashboard = asyncHandler(async (_req: Request, res: Response) => {
  const data = await inventoryService.getInventoryDashboard();
  res.json({ success: true, data });
});

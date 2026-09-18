import { Request, Response } from 'express';
import { TableStatus } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { parseIdParam } from '../utils/parseId';
import * as tableService from '../services/table.service';
import { createTableSchema, updateTableSchema, updateTableStatusSchema } from '../validators/table.validator';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const area = typeof req.query.area === 'string' ? req.query.area : undefined;
  const status = typeof req.query.status === 'string' ? (req.query.status as TableStatus) : undefined;
  const tables = await tableService.listTables({ area, status });
  res.json({ success: true, data: tables });
});

export const areas = asyncHandler(async (_req: Request, res: Response) => {
  const data = await tableService.listAreas();
  res.json({ success: true, data });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const table = await tableService.getTable(id);
  res.json({ success: true, data: table });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = createTableSchema.parse(req.body);
  const table = await tableService.createTable(input);
  res.status(201).json({ success: true, data: table });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const input = updateTableSchema.parse(req.body);
  const table = await tableService.updateTable(id, input);
  res.json({ success: true, data: table });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const { status } = updateTableStatusSchema.parse(req.body);
  const table = await tableService.updateTableStatus(id, status);
  res.json({ success: true, data: table });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  await tableService.deleteTable(id);
  res.json({ success: true, message: 'Đã xoá bàn' });
});

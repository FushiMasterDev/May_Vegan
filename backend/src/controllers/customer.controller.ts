import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { parseIdParam } from '../utils/parseId';
import * as customerService from '../services/customer.service';
import { listCustomerQuerySchema, updateCustomerStatusSchema } from '../validators/customer.validator';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = listCustomerQuerySchema.parse(req.query);
  const { items, meta } = await customerService.listCustomers(query);
  res.json({ success: true, data: items, meta });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const customer = await customerService.getCustomerDetail(id);
  res.json({ success: true, data: customer });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const { status } = updateCustomerStatusSchema.parse(req.body);
  const customer = await customerService.setCustomerStatus(id, status);
  res.json({ success: true, data: customer });
});

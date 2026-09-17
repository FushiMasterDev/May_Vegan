import { Request, Response } from 'express';
import { OrderStatus, OrderType } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { parseIdParam } from '../utils/parseId';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/database';
import * as orderService from '../services/order.service';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  transferTableSchema,
  listOrderQuerySchema,
} from '../validators/order.validator';

const STAFF_ROLES = ['ADMIN', 'MANAGER', 'STAFF'];
const KITCHEN_ALLOWED_STATUSES: OrderStatus[] = ['PREPARING', 'READY'];

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = createOrderSchema.parse(req.body);

  let customerId: number | null = null;
  let employeeId: number | null = null;

  if (req.user?.roleName === 'CUSTOMER') {
    const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
    customerId = customer?.id ?? null;
  } else if (req.user && STAFF_ROLES.includes(req.user.roleName)) {
    const employee = await prisma.employee.findUnique({ where: { userId: req.user.id } });
    employeeId = employee?.id ?? null;
  }

  const order = await orderService.createOrder({ customerId, employeeId }, input);
  res.status(201).json({ success: true, data: order });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = listOrderQuerySchema.parse(req.query);
  const { items, meta } = await orderService.listOrders(query as { status?: OrderStatus; orderType?: OrderType; search?: string; dateFrom?: string; dateTo?: string; page?: string; limit?: string });
  res.json({ success: true, data: items, meta });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized();
  const id = parseIdParam(req.params.id);

  if (req.user.roleName === 'CUSTOMER') {
    const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
    if (!customer) throw AppError.forbidden();
    const order = await orderService.getOrderById(id, customer.id);
    return res.json({ success: true, data: order });
  }

  const order = await orderService.getOrderById(id);
  res.json({ success: true, data: order });
});

export const getByCode = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderByCode(req.params.code);
  res.json({ success: true, data: order });
});

export const myOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized();
  const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
  if (!customer) return res.json({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } });

  const query = listOrderQuerySchema.parse(req.query);
  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: 'desc' },
    skip: query.page ? (Number(query.page) - 1) * Number(query.limit ?? 20) : 0,
    take: query.limit ? Number(query.limit) : 20,
    include: { items: true, table: true },
  });
  res.json({ success: true, data: orders });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized();
  const id = parseIdParam(req.params.id);
  const { status } = updateOrderStatusSchema.parse(req.body);

  if (req.user.roleName === 'KITCHEN' && !KITCHEN_ALLOWED_STATUSES.includes(status)) {
    throw AppError.forbidden('Nhân viên bếp chỉ có thể cập nhật trạng thái Đang chuẩn bị / Sẵn sàng');
  }

  const order = await orderService.updateOrderStatus(id, status);
  res.json({ success: true, data: order });
});

export const transferTable = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const { tableId } = transferTableSchema.parse(req.body);
  const order = await orderService.transferTable(id, tableId);
  res.json({ success: true, data: order });
});

export const cancel = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw AppError.unauthorized();
  const id = parseIdParam(req.params.id);

  if (req.user.roleName === 'CUSTOMER') {
    const customer = await prisma.customer.findUnique({ where: { userId: req.user.id } });
    if (!customer) throw AppError.forbidden();
    const order = await orderService.cancelOwnOrder(id, customer.id);
    return res.json({ success: true, data: order });
  }

  const order = await orderService.updateOrderStatus(id, 'CANCELLED');
  res.json({ success: true, data: order });
});

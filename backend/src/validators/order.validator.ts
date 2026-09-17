import { z } from 'zod';

const orderItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive('Số lượng phải lớn hơn 0'),
  note: z.string().max(255).optional(),
});

export const createOrderSchema = z
  .object({
    orderType: z.enum(['DINE_IN', 'DELIVERY', 'PICKUP']),
    tableId: z.coerce.number().int().positive().optional(),
    items: z.array(orderItemSchema).min(1, 'Đơn hàng phải có ít nhất 1 món'),
    guestName: z.string().min(2, 'Vui lòng nhập họ tên').max(100).optional(),
    guestPhone: z.string().regex(/^0\d{9,10}$/, 'Số điện thoại không hợp lệ').optional(),
    guestEmail: z.string().email('Email không hợp lệ').optional(),
    deliveryAddress: z.string().max(500).optional(),
    note: z.string().max(500).optional(),
    requestedTime: z.string().optional(),
    couponCode: z.string().optional(),
    paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'ONLINE']).default('CASH'),
  })
  .refine((data) => data.orderType !== 'DELIVERY' || !!data.deliveryAddress, {
    message: 'Vui lòng nhập địa chỉ giao hàng',
    path: ['deliveryAddress'],
  })
  .refine((data) => data.orderType !== 'DINE_IN' || !!data.tableId, {
    message: 'Vui lòng chọn bàn',
    path: ['tableId'],
  });

export const transferTableSchema = z.object({
  tableId: z.coerce.number().int().positive('Vui lòng chọn bàn'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'COMPLETED', 'CANCELLED']),
});

export const listOrderQuerySchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'COMPLETED', 'CANCELLED']).optional(),
  orderType: z.enum(['DINE_IN', 'DELIVERY', 'PICKUP']).optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

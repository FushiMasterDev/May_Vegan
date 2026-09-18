import { OrderStatus, OrderType, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { generateOrderCode } from '../utils/codeGenerator';
import { parsePagination, buildMeta } from '../utils/pagination';
import * as couponService from './coupon.service';
import type { CreateOrderInput } from '../validators/order.validator';

const DELIVERY_FEE = 15000;
const LOYALTY_POINTS_PER_VND = 10000;

const orderInclude = {
  items: { include: { product: { select: { id: true, name: true, slug: true } } } },
  table: true,
  customer: { include: { user: { select: { fullName: true, phone: true, email: true } } } },
  employee: { include: { user: { select: { fullName: true } } } },
  coupon: true,
  payment: true,
} satisfies Prisma.OrderInclude;

export async function createOrder(
  actor: { customerId: number | null; employeeId?: number | null },
  input: CreateOrderInput
) {
  if (!actor.customerId) {
    if (!input.guestName) throw AppError.badRequest('Vui lòng nhập họ tên');
    // Đơn tại quán (nhân viên tạo tại bàn) không bắt buộc SĐT — khách được xác
    // định qua bàn đang ngồi. Giao hàng/nhận tại quán cần SĐT để liên hệ.
    if (input.orderType !== 'DINE_IN' && !input.guestPhone) {
      throw AppError.badRequest('Vui lòng nhập số điện thoại');
    }
  }

  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product) throw AppError.badRequest(`Món ăn (id=${item.productId}) không tồn tại`);
    if (product.status !== 'AVAILABLE') {
      throw AppError.badRequest(`Món "${product.name}" hiện không có sẵn`);
    }
  }

  const itemsData = input.items.map((item) => {
    const product = productMap.get(item.productId)!;
    const unitPrice = product.salePrice ?? product.price;
    const subtotal = Number(unitPrice) * item.quantity;
    return {
      productId: product.id,
      productNameSnapshot: product.name,
      unitPrice,
      quantity: item.quantity,
      note: item.note,
      subtotal,
    };
  });

  const subtotal = itemsData.reduce((sum, i) => sum + i.subtotal, 0);

  let discountAmount = 0;
  let couponId: number | null = null;
  if (input.couponCode) {
    const { coupon, discountAmount: discount } = await couponService.validateCoupon(input.couponCode, subtotal);
    couponId = coupon.id;
    discountAmount = discount;
  }

  const deliveryFee = input.orderType === 'DELIVERY' ? DELIVERY_FEE : 0;
  const totalAmount = subtotal - discountAmount + deliveryFee;

  if (input.orderType === 'DINE_IN' && input.tableId) {
    const table = await prisma.restaurantTable.findUnique({ where: { id: input.tableId } });
    if (!table) throw AppError.badRequest('Bàn không tồn tại');
    if (table.status === 'MAINTENANCE' || table.status === 'CLEANING') {
      throw AppError.badRequest('Bàn hiện không sẵn sàng phục vụ');
    }
  }

  const orderCode = await generateOrderCode();

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderCode,
        customerId: actor.customerId ?? undefined,
        tableId: input.orderType === 'DINE_IN' ? input.tableId : undefined,
        employeeId: actor.employeeId ?? undefined,
        couponId: couponId ?? undefined,
        orderType: input.orderType,
        status: 'PENDING',
        guestName: input.guestName,
        guestPhone: input.guestPhone,
        guestEmail: input.guestEmail,
        deliveryAddress: input.orderType === 'DELIVERY' ? input.deliveryAddress : undefined,
        note: input.note,
        requestedTime: input.requestedTime ? new Date(input.requestedTime) : undefined,
        subtotal,
        discountAmount,
        deliveryFee,
        totalAmount,
        paymentMethod: input.paymentMethod,
        paymentStatus: 'UNPAID',
        items: { create: itemsData },
        payment: {
          create: { amount: totalAmount, method: input.paymentMethod, status: 'PENDING' },
        },
      },
      include: orderInclude,
    });

    if (actor.customerId) {
      await tx.customer.update({
        where: { id: actor.customerId },
        data: { totalOrders: { increment: 1 } },
      });
    }

    if (couponId) {
      await tx.couponUsage.create({
        data: {
          couponId,
          orderId: created.id,
          customerId: actor.customerId ?? undefined,
          discountAmount,
        },
      });
      await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
    }

    if (input.orderType === 'DINE_IN' && input.tableId) {
      await tx.restaurantTable.update({ where: { id: input.tableId }, data: { status: 'OCCUPIED' } });
    }

    return created;
  });

  return order;
}

export async function listOrders(query: {
  status?: OrderStatus;
  orderType?: OrderType;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: string;
  limit?: string;
}) {
  const { page, limit, skip, take } = parsePagination(query);

  const where: Prisma.OrderWhereInput = {
    status: query.status,
    orderType: query.orderType,
  };

  if (query.dateFrom || query.dateTo) {
    where.createdAt = {
      ...(query.dateFrom ? { gte: new Date(`${query.dateFrom}T00:00:00.000Z`) } : {}),
      ...(query.dateTo ? { lte: new Date(`${query.dateTo}T23:59:59.999Z`) } : {}),
    };
  }

  if (query.search) {
    where.OR = [
      { orderCode: { contains: query.search } },
      { guestName: { contains: query.search } },
      { guestPhone: { contains: query.search } },
      { customer: { user: { fullName: { contains: query.search } } } },
      { customer: { user: { phone: { contains: query.search } } } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.order.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: orderInclude }),
    prisma.order.count({ where }),
  ]);

  return { items, meta: buildMeta(page, limit, total) };
}

export async function getOrderById(id: number, restrictToCustomerId?: number) {
  const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
  if (!order) throw AppError.notFound('Không tìm thấy đơn hàng');
  if (restrictToCustomerId !== undefined && order.customerId !== restrictToCustomerId) {
    throw AppError.forbidden('Bạn không có quyền xem đơn hàng này');
  }
  return order;
}

export async function getOrderByCode(code: string) {
  const order = await prisma.order.findUnique({ where: { orderCode: code }, include: orderInclude });
  if (!order) throw AppError.notFound('Không tìm thấy đơn hàng');
  return order;
}

async function releaseTableIfAny(tx: Prisma.TransactionClient, tableId: number | null) {
  if (!tableId) return;
  await tx.restaurantTable.update({ where: { id: tableId }, data: { status: 'AVAILABLE' } });
}

async function reverseCouponUsage(tx: Prisma.TransactionClient, orderId: number) {
  const usage = await tx.couponUsage.findUnique({ where: { orderId } });
  if (!usage) return;
  await tx.couponUsage.delete({ where: { orderId } });
  await tx.coupon.update({
    where: { id: usage.couponId },
    data: { usedCount: { decrement: 1 } },
  });
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) throw AppError.notFound('Không tìm thấy đơn hàng');
  if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
    throw AppError.badRequest('Đơn hàng đã kết thúc, không thể thay đổi trạng thái');
  }

  const updated = await prisma.$transaction(async (tx) => {
    let next = await tx.order.update({ where: { id }, data: { status }, include: orderInclude });

    if (status === 'COMPLETED') {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { soldCount: { increment: item.quantity } },
        });
      }
      if (order.customerId) {
        const points = Math.floor(Number(order.totalAmount) / LOYALTY_POINTS_PER_VND);
        await tx.customer.update({
          where: { id: order.customerId },
          data: {
            totalSpent: { increment: order.totalAmount },
            loyaltyPoints: { increment: points },
          },
        });
      }
      if (next.paymentStatus === 'UNPAID') {
        await tx.payment.update({
          where: { orderId: id },
          data: { status: 'SUCCESS', paidAt: new Date() },
        });
        next = await tx.order.update({ where: { id }, data: { paymentStatus: 'PAID' }, include: orderInclude });
      }
      await releaseTableIfAny(tx, order.tableId);
    }

    if (status === 'CANCELLED') {
      await reverseCouponUsage(tx, id);
      await releaseTableIfAny(tx, order.tableId);
    }

    return next;
  });

  return updated;
}

export async function transferTable(orderId: number, newTableId: number) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw AppError.notFound('Không tìm thấy đơn hàng');
  if (order.orderType !== 'DINE_IN') throw AppError.badRequest('Chỉ đơn tại quán mới có thể chuyển bàn');
  if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
    throw AppError.badRequest('Đơn hàng đã kết thúc, không thể chuyển bàn');
  }
  if (order.tableId === newTableId) throw AppError.badRequest('Đơn đang ở bàn này rồi');

  const newTable = await prisma.restaurantTable.findUnique({ where: { id: newTableId } });
  if (!newTable) throw AppError.badRequest('Bàn không tồn tại');
  if (newTable.status !== 'AVAILABLE') throw AppError.conflict('Bàn đích hiện không trống');

  return prisma.$transaction(async (tx) => {
    if (order.tableId) {
      const stillHasActiveOrder = await tx.order.count({
        where: {
          tableId: order.tableId,
          id: { not: orderId },
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
        },
      });
      if (stillHasActiveOrder === 0) {
        await tx.restaurantTable.update({ where: { id: order.tableId }, data: { status: 'AVAILABLE' } });
      }
    }
    await tx.restaurantTable.update({ where: { id: newTableId }, data: { status: 'OCCUPIED' } });
    return tx.order.update({ where: { id: orderId }, data: { tableId: newTableId }, include: orderInclude });
  });
}

export async function cancelOwnOrder(id: number, customerId: number) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw AppError.notFound('Không tìm thấy đơn hàng');
  if (order.customerId !== customerId) throw AppError.forbidden('Bạn không có quyền huỷ đơn hàng này');
  if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
    throw AppError.badRequest('Đơn hàng đang được xử lý, không thể tự huỷ. Vui lòng liên hệ quán.');
  }
  return updateOrderStatus(id, 'CANCELLED');
}

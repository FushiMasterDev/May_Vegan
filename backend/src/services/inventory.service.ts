import { InventoryTransactionType, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { parsePagination, buildMeta } from '../utils/pagination';
import type { CreateInventoryTransactionInput } from '../validators/inventory.validator';

function toSignedQuantity(type: InventoryTransactionType, quantity: number): number {
  if (type === 'IMPORT') return Math.abs(quantity);
  if (type === 'EXPORT') return -Math.abs(quantity);
  return quantity; // ADJUST / STOCKTAKE: người dùng nhập trực tiếp giá trị có dấu
}

export async function createTransaction(input: CreateInventoryTransactionInput, createdBy?: number) {
  const ingredient = await prisma.ingredient.findUnique({ where: { id: input.ingredientId } });
  if (!ingredient) throw AppError.notFound('Không tìm thấy nguyên liệu');

  const signedQuantity = toSignedQuantity(input.type, input.quantity);
  const newStock = Number(ingredient.quantityInStock) + signedQuantity;
  if (newStock < 0) {
    throw AppError.badRequest(
      `Số lượng tồn kho không đủ (hiện có ${ingredient.quantityInStock} ${ingredient.unit})`
    );
  }

  return prisma.$transaction(async (tx) => {
    const transaction = await tx.inventoryTransaction.create({
      data: {
        ingredientId: input.ingredientId,
        type: input.type,
        quantity: signedQuantity,
        unitCost: input.unitCost,
        note: input.note,
        createdBy,
      },
    });

    await tx.ingredient.update({
      where: { id: input.ingredientId },
      data: {
        quantityInStock: newStock,
        ...(input.type === 'IMPORT' ? { importedAt: new Date() } : {}),
      },
    });

    return transaction;
  });
}

export async function listTransactions(query: {
  ingredientId?: number;
  type?: InventoryTransactionType;
  dateFrom?: string;
  dateTo?: string;
  page?: string;
  limit?: string;
}) {
  const { page, limit, skip, take } = parsePagination(query);

  const where: Prisma.InventoryTransactionWhereInput = {
    ingredientId: query.ingredientId,
    type: query.type,
  };
  if (query.dateFrom || query.dateTo) {
    where.createdAt = {
      ...(query.dateFrom ? { gte: new Date(`${query.dateFrom}T00:00:00.000Z`) } : {}),
      ...(query.dateTo ? { lte: new Date(`${query.dateTo}T23:59:59.999Z`) } : {}),
    };
  }

  const [items, total] = await Promise.all([
    prisma.inventoryTransaction.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { ingredient: true, createdByUser: { select: { fullName: true } } },
    }),
    prisma.inventoryTransaction.count({ where }),
  ]);

  return { items, meta: buildMeta(page, limit, total) };
}

export async function getInventoryDashboard() {
  const ingredients = await prisma.ingredient.findMany();
  const totalIngredients = ingredients.length;
  const lowStock = ingredients.filter((i) => Number(i.quantityInStock) < Number(i.minStockLevel));
  const stockValue = ingredients.reduce((sum, i) => sum + Number(i.quantityInStock) * Number(i.costPrice), 0);

  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [importAgg, exportAgg] = await Promise.all([
    prisma.inventoryTransaction.aggregate({
      where: { type: 'IMPORT', createdAt: { gte: monthStart } },
      _sum: { quantity: true },
    }),
    prisma.inventoryTransaction.aggregate({
      where: { type: 'EXPORT', createdAt: { gte: monthStart } },
      _sum: { quantity: true },
    }),
  ]);

  return {
    totalIngredients,
    lowStockCount: lowStock.length,
    lowStockItems: lowStock,
    stockValue,
    importedThisMonth: Number(importAgg._sum.quantity ?? 0),
    exportedThisMonth: Math.abs(Number(exportAgg._sum.quantity ?? 0)),
  };
}

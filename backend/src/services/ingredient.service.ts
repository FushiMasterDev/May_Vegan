import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { generateIngredientCode } from '../utils/codeGenerator';
import { parsePagination, buildMeta } from '../utils/pagination';
import { parseDateOnly } from '../utils/datetime';
import type { CreateIngredientInput, UpdateIngredientInput } from '../validators/ingredient.validator';

export async function listIngredients(query: { search?: string; lowStockOnly?: boolean; page?: string; limit?: string }) {
  const { page, limit, skip, take } = parsePagination(query);

  const where: Prisma.IngredientWhereInput = query.search ? { name: { contains: query.search } } : {};

  const [all, total] = await Promise.all([
    prisma.ingredient.findMany({
      where,
      skip: query.lowStockOnly ? undefined : skip,
      take: query.lowStockOnly ? undefined : take,
      orderBy: { name: 'asc' },
      include: { supplier: true },
    }),
    prisma.ingredient.count({ where }),
  ]);

  if (!query.lowStockOnly) {
    return { items: all, meta: buildMeta(page, limit, total) };
  }

  const lowStock = all.filter((i) => Number(i.quantityInStock) < Number(i.minStockLevel));
  return { items: lowStock, meta: buildMeta(1, lowStock.length || 1, lowStock.length) };
}

export async function getIngredient(id: number) {
  const ingredient = await prisma.ingredient.findUnique({ where: { id }, include: { supplier: true } });
  if (!ingredient) throw AppError.notFound('Không tìm thấy nguyên liệu');
  return ingredient;
}

export async function createIngredient(input: CreateIngredientInput) {
  const code = await generateIngredientCode();
  const initialQuantity = input.initialQuantity ?? 0;

  return prisma.$transaction(async (tx) => {
    const ingredient = await tx.ingredient.create({
      data: {
        code,
        name: input.name,
        unit: input.unit,
        quantityInStock: initialQuantity,
        minStockLevel: input.minStockLevel ?? 0,
        costPrice: input.costPrice ?? 0,
        supplierId: input.supplierId,
        expiryDate: input.expiryDate ? parseDateOnly(input.expiryDate) : undefined,
        importedAt: initialQuantity > 0 ? new Date() : undefined,
      },
    });

    if (initialQuantity > 0) {
      await tx.inventoryTransaction.create({
        data: {
          ingredientId: ingredient.id,
          type: 'IMPORT',
          quantity: initialQuantity,
          unitCost: input.costPrice,
          note: 'Nhập kho ban đầu khi tạo nguyên liệu',
        },
      });
    }

    return ingredient;
  });
}

export async function updateIngredient(id: number, input: UpdateIngredientInput) {
  await getIngredient(id);
  return prisma.ingredient.update({
    where: { id },
    data: {
      name: input.name,
      unit: input.unit,
      minStockLevel: input.minStockLevel,
      costPrice: input.costPrice,
      supplierId: input.supplierId,
      expiryDate: input.expiryDate ? parseDateOnly(input.expiryDate) : undefined,
    },
    include: { supplier: true },
  });
}

export async function deleteIngredient(id: number) {
  await getIngredient(id);
  const txCount = await prisma.inventoryTransaction.count({ where: { ingredientId: id } });
  if (txCount > 0) {
    throw AppError.conflict('Không thể xoá nguyên liệu đã có lịch sử giao dịch kho');
  }
  await prisma.ingredient.delete({ where: { id } });
}

import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import type { CreateSupplierInput, UpdateSupplierInput } from '../validators/supplier.validator';

export async function listSuppliers() {
  return prisma.supplier.findMany({ orderBy: { name: 'asc' } });
}

export async function getSupplier(id: number) {
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) throw AppError.notFound('Không tìm thấy nhà cung cấp');
  return supplier;
}

export async function createSupplier(input: CreateSupplierInput) {
  return prisma.supplier.create({ data: input });
}

export async function updateSupplier(id: number, input: UpdateSupplierInput) {
  await getSupplier(id);
  return prisma.supplier.update({ where: { id }, data: input });
}

export async function deleteSupplier(id: number) {
  await getSupplier(id);
  const ingredientCount = await prisma.ingredient.count({ where: { supplierId: id } });
  if (ingredientCount > 0) {
    throw AppError.conflict('Không thể xoá nhà cung cấp đang được gắn với nguyên liệu');
  }
  await prisma.supplier.delete({ where: { id } });
}

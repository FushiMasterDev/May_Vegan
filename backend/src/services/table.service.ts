import { TableStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import type { CreateTableInput, UpdateTableInput } from '../validators/table.validator';

export async function listTables(filter: { area?: string; status?: TableStatus }) {
  return prisma.restaurantTable.findMany({
    where: {
      area: filter.area,
      status: filter.status,
    },
    orderBy: [{ area: 'asc' }, { code: 'asc' }],
  });
}

export async function getTable(id: number) {
  const table = await prisma.restaurantTable.findUnique({ where: { id } });
  if (!table) throw AppError.notFound('Không tìm thấy bàn');
  return table;
}

async function ensureUniqueCode(code: string, excludeId?: number) {
  const existing = await prisma.restaurantTable.findUnique({ where: { code } });
  if (existing && existing.id !== excludeId) throw AppError.conflict('Mã bàn đã tồn tại');
}

export async function createTable(input: CreateTableInput) {
  await ensureUniqueCode(input.code);
  return prisma.restaurantTable.create({
    data: {
      code: input.code,
      seats: input.seats,
      area: input.area,
      status: input.status ?? 'AVAILABLE',
    },
  });
}

export async function updateTable(id: number, input: UpdateTableInput) {
  await getTable(id);
  if (input.code) await ensureUniqueCode(input.code, id);
  return prisma.restaurantTable.update({
    where: { id },
    data: input,
  });
}

export async function updateTableStatus(id: number, status: TableStatus) {
  await getTable(id);
  return prisma.restaurantTable.update({ where: { id }, data: { status } });
}

export async function deleteTable(id: number) {
  await getTable(id);
  await prisma.restaurantTable.delete({ where: { id } });
}

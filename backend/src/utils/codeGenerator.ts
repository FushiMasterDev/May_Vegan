import { prisma } from '../config/database';

function todayCompact(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

export async function generateOrderCode(): Promise<string> {
  const prefix = `MV${todayCompact()}`;
  const count = await prisma.order.count({ where: { orderCode: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(3, '0')}`;
}

export async function generateReservationCode(): Promise<string> {
  const prefix = `RS${todayCompact()}`;
  const count = await prisma.reservation.count({ where: { reservationCode: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(3, '0')}`;
}

export async function generateEmployeeCode(): Promise<string> {
  const count = await prisma.employee.count();
  return `NV${String(count + 1).padStart(3, '0')}`;
}

export async function generateIngredientCode(): Promise<string> {
  const count = await prisma.ingredient.count();
  return `NL${String(count + 1).padStart(3, '0')}`;
}

import { ReservationStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { generateReservationCode } from '../utils/codeGenerator';
import { parseDateOnly, parseTimeOnly, formatTimeHHmm, timeToMinutes } from '../utils/datetime';
import { parsePagination, buildMeta } from '../utils/pagination';
import type { CreateReservationInput } from '../validators/reservation.validator';

const ACTIVE_STATUSES: ReservationStatus[] = ['PENDING', 'CONFIRMED', 'SEATED'];
const BOOKING_WINDOW_MINUTES = 120;

async function findAvailableTable(date: Date, time: string, partySize: number, area?: string) {
  const candidateTables = await prisma.restaurantTable.findMany({
    where: {
      seats: { gte: partySize },
      area,
      status: { not: 'MAINTENANCE' },
    },
    orderBy: { seats: 'asc' },
  });
  if (candidateTables.length === 0) return null;

  const dayReservations = await prisma.reservation.findMany({
    where: {
      reservationDate: date,
      status: { in: ACTIVE_STATUSES },
      tableId: { in: candidateTables.map((t) => t.id) },
    },
  });

  const requestedMinutes = timeToMinutes(time);
  const bookedTableIds = new Set(
    dayReservations
      .filter((r) => Math.abs(timeToMinutes(formatTimeHHmm(r.reservationTime)) - requestedMinutes) < BOOKING_WINDOW_MINUTES)
      .map((r) => r.tableId)
      .filter((id): id is number => id !== null)
  );

  return candidateTables.find((t) => !bookedTableIds.has(t.id)) ?? null;
}

export async function checkAvailability(input: {
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  area?: string;
}) {
  const table = await findAvailableTable(
    parseDateOnly(input.reservationDate),
    input.reservationTime,
    input.partySize,
    input.area
  );
  return { available: Boolean(table), suggestedTable: table };
}

export async function createReservation(customerId: number | null, input: CreateReservationInput) {
  const date = parseDateOnly(input.reservationDate);
  const table = await findAvailableTable(date, input.reservationTime, input.partySize, input.area);
  if (!table) {
    throw AppError.conflict('Không còn bàn trống phù hợp cho khung giờ này. Vui lòng chọn thời gian hoặc khu vực khác.');
  }

  const reservationCode = await generateReservationCode();

  return prisma.reservation.create({
    data: {
      reservationCode,
      customerId: customerId ?? undefined,
      guestName: input.guestName,
      guestPhone: input.guestPhone,
      tableId: table.id,
      partySize: input.partySize,
      reservationDate: date,
      reservationTime: parseTimeOnly(input.reservationTime),
      area: input.area ?? table.area,
      note: input.note,
      status: 'PENDING',
    },
    include: { table: true },
  });
}

export async function listMyReservations(customerId: number) {
  return prisma.reservation.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    include: { table: true },
  });
}

export async function listReservations(query: { date?: string; status?: ReservationStatus; page?: string; limit?: string }) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = {
    ...(query.date ? { reservationDate: parseDateOnly(query.date) } : {}),
    ...(query.status ? { status: query.status } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      skip,
      take,
      orderBy: [{ reservationDate: 'desc' }, { reservationTime: 'asc' }],
      include: { table: true, customer: { include: { user: { select: { fullName: true, phone: true } } } } },
    }),
    prisma.reservation.count({ where }),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
}

export async function getReservationByCode(code: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { reservationCode: code },
    include: { table: true },
  });
  if (!reservation) throw AppError.notFound('Không tìm thấy đặt bàn');
  return reservation;
}

export async function updateReservationStatus(id: number, status: ReservationStatus, tableId?: number) {
  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) throw AppError.notFound('Không tìm thấy đặt bàn');

  if (tableId) {
    const table = await prisma.restaurantTable.findUnique({ where: { id: tableId } });
    if (!table) throw AppError.badRequest('Bàn không tồn tại');
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: { status, tableId: tableId ?? reservation.tableId },
    include: { table: true },
  });

  if (status === 'SEATED' && updated.tableId) {
    await prisma.restaurantTable.update({ where: { id: updated.tableId }, data: { status: 'OCCUPIED' } });
  }
  if (status === 'CONFIRMED' && updated.tableId) {
    await prisma.restaurantTable.update({ where: { id: updated.tableId }, data: { status: 'RESERVED' } });
  }
  if ((status === 'COMPLETED' || status === 'CANCELLED') && updated.tableId) {
    await prisma.restaurantTable.update({ where: { id: updated.tableId }, data: { status: 'AVAILABLE' } });
  }

  return updated;
}

import { z } from 'zod';

const statusEnum = z.enum(['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED']);

export const createReservationSchema = z.object({
  guestName: z.string().min(2, 'Vui lòng nhập họ tên').max(100),
  guestPhone: z.string().regex(/^0\d{9,10}$/, 'Số điện thoại không hợp lệ'),
  partySize: z.coerce.number().int().positive('Số người phải lớn hơn 0').max(50),
  reservationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ (YYYY-MM-DD)'),
  reservationTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Giờ không hợp lệ (HH:mm)'),
  area: z.string().max(100).optional(),
  note: z.string().max(500).optional(),
});

export const updateReservationStatusSchema = z.object({
  status: statusEnum,
  tableId: z.coerce.number().int().positive().optional(),
});

export const listReservationQuerySchema = z.object({
  date: z.string().optional(),
  status: statusEnum.optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;

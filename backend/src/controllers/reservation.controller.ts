import { Request, Response } from 'express';
import { ReservationStatus } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { parseIdParam } from '../utils/parseId';
import { prisma } from '../config/database';
import * as reservationService from '../services/reservation.service';
import {
  createReservationSchema,
  updateReservationStatusSchema,
  listReservationQuerySchema,
} from '../validators/reservation.validator';

export const checkAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { reservationDate, reservationTime, partySize, area } = req.query as Record<string, string>;
  const result = await reservationService.checkAvailability({
    reservationDate,
    reservationTime,
    partySize: Number(partySize),
    area,
  });
  res.json({ success: true, data: result });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = createReservationSchema.parse(req.body);
  const customer =
    req.user?.roleName === 'CUSTOMER'
      ? await prisma.customer.findUnique({ where: { userId: req.user.id } })
      : null;
  const reservation = await reservationService.createReservation(customer?.id ?? null, input);
  res.status(201).json({ success: true, data: reservation });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = listReservationQuerySchema.parse(req.query);
  const { items, meta } = await reservationService.listReservations(query);
  res.json({ success: true, data: items, meta });
});

export const getByCode = asyncHandler(async (req: Request, res: Response) => {
  const reservation = await reservationService.getReservationByCode(req.params.code);
  res.json({ success: true, data: reservation });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req.params.id);
  const { status, tableId } = updateReservationStatusSchema.parse(req.body);
  const reservation = await reservationService.updateReservationStatus(id, status as ReservationStatus, tableId);
  res.json({ success: true, data: reservation });
});

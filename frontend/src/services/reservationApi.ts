import { apiClient } from './apiClient';
import type { ApiItemResponse, ApiListResponse, Reservation, ReservationStatus } from '@/types';

export async function checkAvailability(params: {
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  area?: string;
}) {
  const res = await apiClient.get<ApiItemResponse<{ available: boolean; suggestedTable: unknown }>>(
    '/reservations/availability',
    { params }
  );
  return res.data.data;
}

export interface CreateReservationPayload {
  guestName: string;
  guestPhone: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  area?: string;
  note?: string;
}

export async function createReservation(payload: CreateReservationPayload) {
  const res = await apiClient.post<ApiItemResponse<Reservation>>('/reservations', payload);
  return res.data.data;
}

export async function getReservationByCode(code: string) {
  const res = await apiClient.get<ApiItemResponse<Reservation>>(`/reservations/code/${code}`);
  return res.data.data;
}

export async function myReservations() {
  const res = await apiClient.get<{ success: true; data: Reservation[] }>('/reservations/mine');
  return res.data.data;
}

export async function listReservations(params: { date?: string; status?: ReservationStatus; page?: number; limit?: number } = {}) {
  const res = await apiClient.get<ApiListResponse<Reservation>>('/reservations', { params });
  return res.data;
}

export async function updateReservationStatus(id: number, status: ReservationStatus, tableId?: number) {
  const res = await apiClient.put<ApiItemResponse<Reservation>>(`/reservations/${id}/status`, { status, tableId });
  return res.data.data;
}

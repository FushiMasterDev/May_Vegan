import { apiClient } from './apiClient';
import type { ApiItemResponse, ApiListResponse, Employee, Role } from '@/types';

export async function listEmployees(params: { search?: string; roleName?: Role; page?: number; limit?: number } = {}) {
  const res = await apiClient.get<ApiListResponse<Employee>>('/employees', { params });
  return res.data;
}

export async function getEmployee(id: number) {
  const res = await apiClient.get<ApiItemResponse<Employee>>(`/employees/${id}`);
  return res.data.data;
}

export interface CreateEmployeePayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  position: string;
  roleName: Role;
  hiredAt?: string;
}

export async function createEmployee(payload: CreateEmployeePayload) {
  const res = await apiClient.post<ApiItemResponse<Employee>>('/employees', payload);
  return res.data.data;
}

export interface UpdateEmployeePayload {
  fullName?: string;
  phone?: string;
  position?: string;
  roleName?: Role;
  status?: 'ACTIVE' | 'INACTIVE';
  hiredAt?: string;
}

export async function updateEmployee(id: number, payload: UpdateEmployeePayload) {
  const res = await apiClient.put<ApiItemResponse<Employee>>(`/employees/${id}`, payload);
  return res.data.data;
}

export async function deactivateEmployee(id: number) {
  await apiClient.delete(`/employees/${id}`);
}

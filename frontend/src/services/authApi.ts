import { apiClient } from './apiClient';
import type { ApiItemResponse, AuthUser } from '@/types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
}

export async function login(payload: LoginPayload) {
  const res = await apiClient.post<ApiItemResponse<{ user: AuthUser } & AuthTokens>>('/auth/login', payload);
  return res.data.data;
}

export async function register(payload: RegisterPayload) {
  const res = await apiClient.post<ApiItemResponse<{ user: AuthUser } & AuthTokens>>('/auth/register', payload);
  return res.data.data;
}

export async function me() {
  const res = await apiClient.get<ApiItemResponse<AuthUser>>('/auth/me');
  return res.data.data;
}

export async function updateProfile(payload: Partial<{ fullName: string; phone: string; address: string; avatarUrl: string }>) {
  const res = await apiClient.put<ApiItemResponse<AuthUser>>('/auth/me', payload);
  return res.data.data;
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }) {
  await apiClient.put('/auth/me/password', payload);
}

export async function forgotPassword(email: string) {
  await apiClient.post('/auth/forgot-password', { email });
}

export async function resetPassword(payload: { token: string; newPassword: string }) {
  await apiClient.post('/auth/reset-password', payload);
}

export async function logout() {
  await apiClient.post('/auth/logout');
}

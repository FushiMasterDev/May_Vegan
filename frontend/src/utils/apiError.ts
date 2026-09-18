import { AxiosError } from 'axios';

export function getApiErrorMessage(error: unknown, fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.'): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string; details?: unknown } | undefined;
    if (data?.details && typeof data.details === 'object') {
      const values = Object.values(data.details as Record<string, unknown>).flat();
      const first = values.find((v) => typeof v === 'string');
      if (typeof first === 'string') return first;
    }
    if (data?.message) return data.message;
    if (error.code === 'ERR_NETWORK') return 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng.';
  }
  return fallback;
}

export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === 'number' ? value : Number(value);
}

export function formatCurrency(value: string | number | null | undefined): string {
  return `${toNumber(value).toLocaleString('vi-VN')}đ`;
}

export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString('vi-VN');
}

export function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
}

export function formatTimeHHmm(value: string | Date): string {
  const d = new Date(value);
  return d.toISOString().slice(11, 16);
}

export function parseDateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export function parseTimeOnly(timeStr: string): Date {
  return new Date(`1970-01-01T${timeStr}:00.000Z`);
}

export function formatTimeHHmm(date: Date): string {
  return date.toISOString().slice(11, 16);
}

export function formatDateISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

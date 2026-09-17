import { z } from 'zod';

export const revenueReportQuerySchema = z.object({
  range: z.enum(['today', '7d', '30d', 'month', 'year', 'custom']).default('30d'),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  export: z.enum(['csv']).optional(),
});

export type RevenueReportQuery = z.infer<typeof revenueReportQuerySchema>;

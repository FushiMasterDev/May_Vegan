import { z } from 'zod';

export const listCustomerQuerySchema = z.object({
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const updateCustomerStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'LOCKED']),
});

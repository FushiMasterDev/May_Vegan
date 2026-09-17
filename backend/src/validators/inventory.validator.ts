import { z } from 'zod';

export const createInventoryTransactionSchema = z.object({
  ingredientId: z.coerce.number().int().positive(),
  type: z.enum(['IMPORT', 'EXPORT', 'ADJUST', 'STOCKTAKE']),
  quantity: z.coerce.number().refine((v) => v !== 0, 'Số lượng phải khác 0'),
  unitCost: z.coerce.number().nonnegative().optional(),
  note: z.string().max(500).optional(),
});

export const listInventoryTransactionQuerySchema = z.object({
  ingredientId: z.coerce.number().int().positive().optional(),
  type: z.enum(['IMPORT', 'EXPORT', 'ADJUST', 'STOCKTAKE']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreateInventoryTransactionInput = z.infer<typeof createInventoryTransactionSchema>;

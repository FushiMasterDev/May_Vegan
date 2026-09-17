import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as dashboardService from '../services/dashboard.service';

export const statistics = asyncHandler(async (_req: Request, res: Response) => {
  const data = await dashboardService.getStatistics();
  res.json({ success: true, data });
});

export const ordersByStatus = asyncHandler(async (_req: Request, res: Response) => {
  const data = await dashboardService.getOrdersByStatus();
  res.json({ success: true, data });
});

export const revenueTrend = asyncHandler(async (req: Request, res: Response) => {
  const days = req.query.days ? Number(req.query.days) : 14;
  const data = await dashboardService.getRevenueTrend(days);
  res.json({ success: true, data });
});

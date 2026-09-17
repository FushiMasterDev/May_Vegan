import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { arrayToCsv } from '../utils/csv';
import * as reportService from '../services/report.service';
import { revenueReportQuerySchema } from '../validators/report.validator';

export const revenue = asyncHandler(async (req: Request, res: Response) => {
  const query = revenueReportQuerySchema.parse(req.query);
  const report = await reportService.getRevenueReport(query.range, query.from, query.to);

  if (query.export === 'csv') {
    const csv = arrayToCsv(report.revenueByDay, ['date', 'revenue']);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="doanh-thu-${query.range}.csv"`);
    return res.send(`﻿${csv}`);
  }

  res.json({ success: true, data: report });
});

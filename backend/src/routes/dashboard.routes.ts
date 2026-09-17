import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('ADMIN', 'MANAGER'));

router.get('/statistics', dashboardController.statistics);
router.get('/orders-by-status', dashboardController.ordersByStatus);
router.get('/revenue-trend', dashboardController.revenueTrend);

export default router;

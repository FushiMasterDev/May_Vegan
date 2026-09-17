import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('ADMIN', 'MANAGER'));

router.get('/dashboard', inventoryController.dashboard);
router.get('/transactions', inventoryController.listTransactions);
router.post('/transactions', inventoryController.createTransaction);

export default router;

import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

const adminRoles = authorize('ADMIN', 'MANAGER');

router.get('/', authenticate, adminRoles, customerController.list);
router.get('/:id', authenticate, adminRoles, customerController.getById);
router.put('/:id/status', authenticate, adminRoles, customerController.updateStatus);

export default router;

import { Router } from 'express';
import * as tableController from '../controllers/table.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

const staffRoles = authorize('ADMIN', 'MANAGER', 'STAFF');

router.get('/', authenticate, staffRoles, tableController.list);
router.get('/:id', authenticate, staffRoles, tableController.getById);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), tableController.create);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), tableController.update);
router.put('/:id/status', authenticate, staffRoles, tableController.updateStatus);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), tableController.remove);

export default router;

import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';

const router = Router();

const staffRoles = authorize('ADMIN', 'MANAGER', 'STAFF', 'KITCHEN');

router.post('/', optionalAuthenticate, orderController.create);
router.get('/code/:code', orderController.getByCode);
router.get('/mine', authenticate, authorize('CUSTOMER'), orderController.myOrders);

router.get('/', authenticate, staffRoles, orderController.list);
router.get('/:id', authenticate, orderController.getById);
router.put('/:id/status', authenticate, staffRoles, orderController.updateStatus);
router.put('/:id/table', authenticate, staffRoles, orderController.transferTable);
router.post('/:id/cancel', authenticate, orderController.cancel);

export default router;

import { Router } from 'express';
import * as couponController from '../controllers/coupon.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/validate', couponController.validate);

router.get('/', authenticate, authorize('ADMIN', 'MANAGER'), couponController.list);
router.get('/:id', authenticate, authorize('ADMIN', 'MANAGER'), couponController.getById);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), couponController.create);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), couponController.update);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), couponController.remove);

export default router;

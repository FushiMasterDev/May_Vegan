import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('ADMIN', 'MANAGER'), reviewController.listAll);
router.post('/', authenticate, authorize('CUSTOMER'), reviewController.create);
router.put('/:id/hide', authenticate, authorize('ADMIN', 'MANAGER'), reviewController.hide);
router.put('/:id/unhide', authenticate, authorize('ADMIN', 'MANAGER'), reviewController.unhide);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), reviewController.remove);

export default router;

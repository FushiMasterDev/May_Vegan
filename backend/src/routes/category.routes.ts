import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', categoryController.list);
router.get('/:id', categoryController.getById);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), categoryController.create);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), categoryController.update);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), categoryController.remove);

export default router;

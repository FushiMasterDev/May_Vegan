import { Router } from 'express';
import * as supplierController from '../controllers/supplier.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('ADMIN', 'MANAGER'));

router.get('/', supplierController.list);
router.get('/:id', supplierController.getById);
router.post('/', supplierController.create);
router.put('/:id', supplierController.update);
router.delete('/:id', supplierController.remove);

export default router;

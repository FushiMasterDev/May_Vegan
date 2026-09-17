import { Router } from 'express';
import * as employeeController from '../controllers/employee.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Quản lý nhân viên chỉ dành cho ADMIN — STAFF/MANAGER không được cấp quyền này.
router.use(authenticate, authorize('ADMIN'));

router.get('/', employeeController.list);
router.get('/:id', employeeController.getById);
router.post('/', employeeController.create);
router.put('/:id', employeeController.update);
router.delete('/:id', employeeController.remove);

export default router;

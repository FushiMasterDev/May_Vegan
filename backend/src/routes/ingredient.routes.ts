import { Router } from 'express';
import * as ingredientController from '../controllers/ingredient.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('ADMIN', 'MANAGER'));

router.get('/', ingredientController.list);
router.get('/:id', ingredientController.getById);
router.post('/', ingredientController.create);
router.put('/:id', ingredientController.update);
router.delete('/:id', ingredientController.remove);

export default router;

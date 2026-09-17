import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import * as reviewController from '../controllers/review.controller';
import { authenticate, authorize } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';

const router = Router();

router.get('/', productController.list);
router.get('/:idOrSlug', productController.getByIdOrSlug);
router.get('/:id/reviews', reviewController.listByProduct);

router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), productController.create);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), productController.update);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), productController.remove);

router.post(
  '/:id/images',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  uploadSingle('products', 'image'),
  productController.uploadImage
);
router.delete('/:id/images/:imageId', authenticate, authorize('ADMIN', 'MANAGER'), productController.removeImage);

export default router;

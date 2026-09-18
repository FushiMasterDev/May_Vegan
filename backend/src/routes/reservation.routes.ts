import { Router } from 'express';
import * as reservationController from '../controllers/reservation.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';

const router = Router();

router.get('/availability', reservationController.checkAvailability);
router.post('/', optionalAuthenticate, reservationController.create);
router.get('/code/:code', reservationController.getByCode);
router.get('/mine', authenticate, authorize('CUSTOMER'), reservationController.myReservations);

router.get('/', authenticate, authorize('ADMIN', 'MANAGER', 'STAFF'), reservationController.list);
router.put(
  '/:id/status',
  authenticate,
  authorize('ADMIN', 'MANAGER', 'STAFF'),
  reservationController.updateStatus
);

export default router;

import { Router } from 'express';
import authRouter from './auth.routes';
import categoryRouter from './category.routes';
import productRouter from './product.routes';
import orderRouter from './order.routes';
import tableRouter from './table.routes';
import reservationRouter from './reservation.routes';
import customerRouter from './customer.routes';
import employeeRouter from './employee.routes';
import ingredientRouter from './ingredient.routes';
import inventoryRouter from './inventory.routes';
import supplierRouter from './supplier.routes';
import couponRouter from './coupon.routes';
import reviewRouter from './review.routes';
import dashboardRouter from './dashboard.routes';
import reportRouter from './report.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Mây Vegan API đang hoạt động',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRouter);
router.use('/categories', categoryRouter);
router.use('/products', productRouter);
router.use('/orders', orderRouter);
router.use('/tables', tableRouter);
router.use('/reservations', reservationRouter);
router.use('/customers', customerRouter);
router.use('/employees', employeeRouter);
router.use('/ingredients', ingredientRouter);
router.use('/inventory', inventoryRouter);
router.use('/suppliers', supplierRouter);
router.use('/coupons', couponRouter);
router.use('/reviews', reviewRouter);
router.use('/dashboard', dashboardRouter);
router.use('/reports', reportRouter);

export default router;

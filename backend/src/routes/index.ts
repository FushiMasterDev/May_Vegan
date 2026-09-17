import { Router } from 'express';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Mây Vegan API đang hoạt động',
    timestamp: new Date().toISOString(),
  });
});

// Domain routers are mounted here in Phase 3:
// router.use('/auth', authRouter);
// router.use('/products', productRouter);
// router.use('/categories', categoryRouter);
// router.use('/orders', orderRouter);
// router.use('/tables', tableRouter);
// router.use('/reservations', reservationRouter);
// router.use('/customers', customerRouter);
// router.use('/employees', employeeRouter);
// router.use('/ingredients', ingredientRouter);
// router.use('/inventory', inventoryRouter);
// router.use('/coupons', couponRouter);
// router.use('/reviews', reviewRouter);
// router.use('/dashboard', dashboardRouter);
// router.use('/reports', reportRouter);

export default router;

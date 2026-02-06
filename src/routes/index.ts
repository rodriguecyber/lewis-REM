import express from 'express';
import authRoutes from './authRoutes';
import propertyRoutes from './propertyRoutes';
import bidRoutes from './bidRoutes';
import adminRoutes from './adminRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/bids', bidRoutes);
router.use('/admin', adminRoutes);

export default router;

